# Regras de Backend — Tauri v2 + Rust + SQLite

Diretrizes para o desenvolvimento do backend Rust do FlowState.
Toda regra aqui reflete os padrões **já em uso** no código. Siga-as
ao adicionar ou modificar qualquer funcionalidade.

---

## 1. Arquitetura de Módulos

```text
src-tauri/src/
├── main.rs            # Entry-point mínimo (chama app_lib::run)
├── lib.rs             # Builder do Tauri: plugins, setup, handler
├── error.rs           # Helper de conversão de erros (db_err)
├── commands/          # Um arquivo por domínio (CRUD + queries)
│   ├── mod.rs
│   ├── health.rs
│   ├── projects.rs
│   ├── tags.rs
│   ├── sessions.rs
│   ├── goals.rs
│   ├── stats.rs
│   ├── dashboard.rs
│   └── settings.rs
├── database/          # Conexão, pool e migrations
│   ├── mod.rs         # init_db(app) → DbPool
│   ├── connection.rs  # DbPool (Mutex<Connection>)
│   └── migrations.rs  # CREATE_TABLES (SQL idempotente)
└── models/            # Structs de dados (Serialize/Deserialize)
    ├── mod.rs          # Re-exports globais (pub use *)
    ├── project.rs
    ├── tag.rs
    ├── session.rs
    ├── goal.rs
    ├── stats.rs
    └── settings.rs
```

### Princípios

- **`main.rs` não faz nada** além de chamar `app_lib::run()`.
- **`lib.rs` é o ponto de montagem:** registra plugins, inicializa
  o banco via `setup()`, e lista todos os comandos em
  `generate_handler![]`.
- **Um arquivo por domínio** em `commands/`. Não misturar lógica de
  `sessions` em `projects`, etc.
- **Models são DTOs puros:** apenas `derive` de Serde + campos.
  Sem lógica de banco, sem side-effects.

---

## 2. Conexão e Estado (DbPool)

O banco é um **arquivo SQLite único** (`flowstate.db`) no diretório
`app_data_dir()`. A conexão é encapsulada em `DbPool`:

```rust
pub struct DbPool(pub Mutex<Connection>);
```

### Acesso nos comandos

```rust
#[tauri::command]
pub fn get_projects(
    db: State<'_, DbPool>,
) -> Result<Vec<Project>, String> {
    let conn = db.0.lock()
        .map_err(|e| format!("Lock error: {}", e))?;
    // usa &conn normalmente
}
```

### Regras

- Sempre obter o lock via `.lock()` com `.map_err()`.
- O lock é **síncrono** (`std::sync::Mutex`). Manter a seção
  crítica o mais curta possível.
- **Não** armazenar o `MutexGuard` em variáveis de longa duração.
  Solte-o assim que terminar as operações de banco.
- Para operações que precisam de escopo explícito, usar bloco:

```rust
{
    let conn = db.0.lock()
        .map_err(|e| format!("Lock error: {}", e))?;
    conn.execute_batch("...")?;
} // lock liberado aqui
```

---

## 3. Regras Invioláveis

### 3.1 Zero Panics em Commands

Nunca `.unwrap()` ou `.expect()` dentro de um
`#[tauri::command]`. O retorno é **sempre** `Result<T, String>`.

```rust
// ✅ Correto
conn.execute(sql, params)
    .map_err(|e| format!("Insert error: {}", e))?;

// ❌ Proibido
conn.execute(sql, params).unwrap();
```

### 3.2 Serde camelCase

Toda struct que cruza a fronteira IPC usa
`#[serde(rename_all = "camelCase")]`. O Rust fica em `snake_case`,
o frontend recebe `camelCase`.

Para campos que colidem com palavras reservadas do Rust (como
`type`), usar rename explícito:

```rust
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Session {
    pub id: i64,
    #[serde(rename = "type")]
    pub session_type: String,
    pub duration_seconds: i64,  // → durationSeconds no JSON
}
```

### 3.3 SQL Parametrizado

Zero concatenação de strings para montar queries. Sempre
`rusqlite::params![]`:

```rust
// ✅ Correto
conn.execute(
    "INSERT INTO projects (name, color) VALUES (?1, ?2)",
    rusqlite::params![name, color],
)?;

// ❌ Proibido
conn.execute(
    &format!("INSERT INTO projects (name) VALUES ('{}')", name),
    [],
)?;
```

### 3.4 Capabilities (Tauri v2)

Todo plugin utilizado precisa de permissão declarada em
`src-tauri/capabilities/default.json`. Atualmente:

```json
{
  "identifier": "default",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "dialog:default"
  ]
}
```

Ao adicionar um novo plugin (ex: `fs`, `shell`, `notification`),
incluir a permissão correspondente aqui.

### 3.5 Migrations Idempotentes

O schema é definido como uma `const &str` em `migrations.rs` usando
`CREATE TABLE IF NOT EXISTS` e `INSERT OR IGNORE`. Roda na
inicialização da conexão — não há sistema de versões de migration.

Para **adicionar colunas** a tabelas existentes, usar
`ALTER TABLE ... ADD COLUMN` com tratamento de erro (a coluna pode
já existir).

---

## 4. PRAGMAs do SQLite

Configurados automaticamente no `DbPool::open()`:

```sql
PRAGMA journal_mode = WAL;   -- Leituras não bloqueiam escritas
PRAGMA foreign_keys = ON;    -- Enforça integridade referencial
```

Não adicionar novos PRAGMAs sem necessidade comprovada. Esses dois
cobrem o que um app local-first precisa.

---

## 5. Padrões de Código nos Commands

### 5.1 Helpers de Mapeamento

Para domínios com muitas queries (como `sessions`), extrair
constantes e funções auxiliares:

```rust
const SESSION_COLUMNS: &str =
    "id, type, project_id, timer_mode, status, ...";

fn row_to_session(row: &rusqlite::Row) -> rusqlite::Result<Session> {
    Ok(Session {
        id: row.get(0)?,
        session_type: row.get(1)?,
        // ...
    })
}
```

Isso evita duplicação de mapeamento entre `save_session`,
`get_session`, etc.

### 5.2 Padrão de Leitura (query_map)

```rust
let mut stmt = conn.prepare(SQL)?;
let rows = stmt.query_map(params, |row| { ... })?;

let mut results = Vec::new();
for row in rows {
    results.push(row.map_err(|e| format!("Row error: {}", e))?);
}
Ok(results)
```

### 5.3 Padrão de Escrita (INSERT + Retorno)

Após um `INSERT`, retornar a entidade recém-criada via
`last_insert_rowid()`:

```rust
conn.execute(INSERT_SQL, params)?;
let id = conn.last_insert_rowid();

stmt.query_row(params![id], row_to_entity)
    .map_err(|e| format!("Fetch error: {}", e))
```

### 5.4 Conversão de Booleanos

SQLite armazena `INTEGER` (0/1). Converter na leitura:

```rust
archived: row.get::<_, i64>(3)? != 0,
```

### 5.5 Funções Internas (não-command)

Helpers utilitários que não são expostos via IPC **não** recebem
`#[tauri::command]`. Exemplo: `read_setting()` em `settings.rs`.

---

## 6. Models — Convenções

### Structs de Saída (→ Frontend)

- `#[derive(Debug, Serialize)]` (mínimo) ou
  `#[derive(Debug, Clone, Serialize, Deserialize)]`
- `#[serde(rename_all = "camelCase")]`

### Structs de Entrada (← Frontend)

- `#[derive(Debug, Deserialize)]`
- `#[serde(rename_all = "camelCase")]`
- Sufixo `Input` no nome (ex: `SaveSessionInput`,
  `WeeklyGoalInput`)

### Structs Compostas

Usar `#[serde(flatten)]` para evitar duplicação:

```rust
pub struct SessionWithRelations {
    #[serde(flatten)]
    pub session: Session,
    pub project: Option<SessionProjectRef>,
    pub tags: Vec<SessionTagRef>,
}
```

### Referências Leves (*Ref)

Para relações que só precisam de `id`, `name` e `color`, criar
structs `*Ref` enxutas (ex: `SessionProjectRef`,
`SessionTagRef`, `ActivityEntryTag`).

---

## 7. Contrato IPC (Frontend ↔ Backend)

### Fluxo

```text
UI Component
  → services/*.ts (invokeTauri)
    → #[tauri::command] (Rust)
      → rusqlite query
    ← Result<T, String>
  ← T | null (fallback mock em dev)
```

- **A UI nunca chama `invoke()` diretamente.** Sempre via
  `services/tauri.ts` → `invokeTauri<T>(cmd, args)`.
- Em ambiente sem Tauri (`npm run dev` no browser),
  `invokeTauri` retorna `null` e o service faz fallback para
  mocks em `mocks/`.

### Catálogo de Commands

| Domínio    | Command                     | Entrada                     | Retorno                        |
| ---------- | --------------------------- | --------------------------- | ------------------------------ |
| Health     | `ping`                      | —                           | `HealthCheck`                  |
| Projects   | `get_projects`              | —                           | `Vec<Project>`                 |
| Projects   | `create_project`            | name, color?                | `Project`                      |
| Projects   | `update_project`            | id, name?, color?           | `Project`                      |
| Projects   | `delete_project`            | id                          | `()`                           |
| Tags       | `get_tags`                  | —                           | `Vec<Tag>`                     |
| Tags       | `create_tag`                | name, color?                | `Tag`                          |
| Tags       | `update_tag`                | id, name?, color?           | `Tag`                          |
| Tags       | `delete_tag`                | id                          | `()`                           |
| Sessions   | `save_session`              | SaveSessionInput            | `Session`                      |
| Sessions   | `save_session_review`       | session_id, rating, notes   | `()`                           |
| Sessions   | `get_session`               | session_id                  | `Option<SessionWithRelations>` |
| Sessions   | `save_manual_session`       | SaveSessionInput, tag_ids   | `Session`                      |
| Sessions   | `get_today_stats`           | —                           | `TodayStats`                   |
| Sessions   | `delete_session`            | session_id                  | `()`                           |
| Goals      | `get_weekly_goals`          | week_start                  | `Vec<WeeklyGoal>`              |
| Goals      | `create_weekly_goal`        | WeeklyGoalInput, week_start | `WeeklyGoal`                   |
| Goals      | `update_weekly_goal`        | id, target_hours            | `WeeklyGoal`                   |
| Goals      | `delete_weekly_goal`        | id                          | `()`                           |
| Goals      | `get_goal_progress`         | goal_id, week_start         | `GoalProgress`                 |
| Goals      | `get_goals_summary`         | —                           | `WeeklyGoalSummary`            |
| Goals      | `get_goals_history`         | —                           | `Vec<WeeklyGoalGroup>`         |
| Stats      | `get_dashboard_stats`       | —                           | `DashboardStats`               |
| Stats      | `get_heatmap`               | —                           | `Vec<HeatmapDay>`              |
| Stats      | `get_work_distribution`     | —                           | `DistributionChart`            |
| Stats      | `get_study_distribution`    | —                           | `DistributionChart`            |
| Stats      | `get_top_rated_work`        | —                           | `Vec<TopRatedItem>`            |
| Stats      | `get_top_rated_study`       | —                           | `Vec<TopRatedItem>`            |
| Stats      | `get_streak_info`           | —                           | `StreakInfo`                   |
| Stats      | `get_consistency_days`      | —                           | `Vec<ConsistencyDay>`          |
| Stats      | `get_calendar_days`         | month, year                 | `Vec<CalendarDay>`             |
| Stats      | `get_study_tag_ranking`     | —                           | `Vec<StudyTagRankingItem>`     |
| Dashboard  | `get_recent_activities`     | limit                       | `Vec<ActivityEntry>`           |
| Dashboard  | `get_activities_by_date`    | date                        | `Vec<ActivityEntry>`           |
| Dashboard  | `get_activities_by_project` | project_id                  | `Vec<ActivityEntry>`           |
| Dashboard  | `get_activities_by_tag`     | tag_id                      | `Vec<ActivityEntry>`           |
| Settings   | `get_settings`              | —                           | `AppSettings`                  |
| Settings   | `update_settings`           | settings (JSON)             | `AppSettings`                  |
| Settings   | `export_data_vault`         | path                        | `bool`                         |
| Settings   | `import_data_vault`         | path                        | `bool`                         |
| Settings   | `wipe_all_data`             | —                           | `bool`                         |

---

## 8. Export/Import e Operações Destrutivas

### Export (`export_data_vault`)

1. Faz `PRAGMA wal_checkpoint(TRUNCATE)` para flush do WAL.
2. Copia o arquivo `.db` para o caminho informado.

### Import (`import_data_vault`)

1. Remove arquivos WAL/SHM residuais.
2. Substitui o `.db` pelo arquivo informado.
3. Reinicia o app em **release** (`app.restart()`). Em debug, o
   restart é pulado para não matar o dev server.

### Wipe (`wipe_all_data`)

Deleta os dados de todas as tabelas (respeitando a ordem de FKs) e
reinsere os settings padrão. **Não** recria tabelas.

---

## 9. Dependências (Cargo.toml)

| Crate                  | Versão | Uso                               |
| ---------------------- | ------ | --------------------------------- |
| `tauri`                | 2      | Runtime, State, commands          |
| `tauri-build`          | 2      | Build script                      |
| `tauri-plugin-log`     | 2      | Logging estruturado               |
| `tauri-plugin-dialog`  | 2      | Diálogos nativos (file picker)    |
| `rusqlite`             | 0.39   | SQLite (feature `bundled`)        |
| `serde` + `serde_json` | 1      | Serialização IPC                  |
| `chrono`               | 0.4    | Manipulação de datas              |
| `log`                  | 0.4    | Macros de logging (`log::info!`)  |

Ao adicionar dependências: preferir crates estáveis e com
`features` mínimas. Não adicionar crates para coisas que a
stdlib resolve.

---

## 10. Checklist para Novos Commands

1. Criar/atualizar a struct em `models/domínio.rs`.
2. Implementar a função em `commands/domínio.rs` com assinatura
   `fn nome(db: State<'_, DbPool>, ...) -> Result<T, String>`.
3. Registrar em `lib.rs` dentro de `generate_handler![]`.
4. Criar o método correspondente em `services/domínio.ts`
   no frontend (via `invokeTauri`).
5. Se precisar de um plugin novo, adicionar a permissão em
   `capabilities/default.json`.
6. Se alterar schema, adicionar SQL em `migrations.rs` (idempotente).
