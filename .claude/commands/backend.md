# Backend Rules — Tauri v2 + Rust + SQLite

Diretrizes para o backend Rust do FlowState. Siga estes padrões ao adicionar
ou modificar funcionalidades.

## 1. Estrutura de Módulos

```text
src-tauri/src/
├── main.rs          # Apenas chama app_lib::run()
├── lib.rs           # Registra plugins, setup() e handlers de comandos
├── error.rs         # Helper db_err()
├── commands/        # Um arquivo por domínio (ex: projects.rs, sessions.rs)
├── database/        # init_db(), DbPool (Mutex<Connection>) e migrations.rs
└── models/          # DTOs puros (apenas structs com Serde, sem lógica de DB)
```

## 2. Regras Invioláveis

- **Zero panics:** Todo `#[tauri::command]` retorna `Result<T, String>`.
  Nunca use `.unwrap()` ou `.expect()`. Use `?` ou `.map_err()`.
- **Serde camelCase:** Toda struct IPC usa `#[serde(rename_all = "camelCase")]`.
  Campos reservados como `type` devem ser renomeados:
  `#[serde(rename = "type")] pub session_type: String`.
- **SQL Parametrizado:** Nunca interpole strings em queries. Sempre use
  `rusqlite::params![...]`.
- **DbPool:** Lock curto e liberação rápida. O lock (`Mutex`) é síncrono.
  Use escopo `{ let conn = db.0.lock().map_err(...)?; ... }` se necessário.
- **Capabilities:** Declare permissões de novos plugins em
  `src-tauri/capabilities/default.json` (ex: `dialog:default`).
- **Migrations Idempotentes:** Roda no setup. Use `CREATE TABLE IF NOT EXISTS`.
  Para alterações, use `ALTER TABLE ... ADD COLUMN` tratando erros
  caso a coluna já exista.

## 3. Padrões de Código & SQLite

### Leitura (query_map)

```rust
let mut stmt = conn.prepare(SQL)?;
let rows = stmt.query_map(params, |row| { ... })?;
let mut results = Vec::new();
for row in rows {
    results.push(row.map_err(|e| format!("Row error: {e}"))?);
}
Ok(results)
```

### Escrita (INSERT + Retorno)

Após `INSERT`, retorne a entidade usando `last_insert_rowid()`:

```rust
conn.execute(INSERT_SQL, params)?;
let id = conn.last_insert_rowid();
stmt.query_row(rusqlite::params![id], row_to_entity)
    .map_err(|e| format!("Fetch after insert: {e}"))
```

- **Booleanos:** Guardados como `INTEGER` (`0` ou `1`). Converta na leitura:
  `archived: row.get::<_, i64>(idx)? != 0`.
- **PRAGMAs:** WAL mode (`PRAGMA journal_mode = WAL`) e Foreign Keys
  (`PRAGMA foreign_keys = ON`) ativos por padrão.
- **Helpers de Mapeamento:** Extraia colunas (`const COLUMNS`) e mapeamento
  (`fn row_to_entity`) para evitar duplicação.
- **Funções Internas:** Helpers internos não expostos no IPC não recebem
  `#[tauri::command]`.

## 4. Exportação, Importação e Wipe

- **Export (`export_data_vault`):** Executa `PRAGMA wal_checkpoint(TRUNCATE)`
  para flush do WAL e copia o arquivo `.db`.
- **Import (`import_data_vault`):** Remove arquivos WAL/SHM residuais,
  substitui o `.db` e reinicia o app em release via `app.restart()`.
- **Wipe (`wipe_all_data`):** Limpa os dados das tabelas respeitando a ordem de
  FKs e reinsere as configurações padrão.

## 5. Naming Conventions para Models

| Tipo | Derive | Sufixo | Exemplo |
| :--- | :--- | :--- | :--- |
| Saída (to UI) | `Serialize` | Nenhum | `Project` |
| Entrada (from UI) | `Deserialize` | `Input` | `SaveSessionInput` |
| Referência Leve | `Serialize` | `Ref` | `SessionProjectRef` |

Use `#[serde(flatten)]` para compor structs sem aninhar o JSON:

```rust
pub struct SessionWithRelations {
    #[serde(flatten)]
    pub session: Session,
    pub project: Option<SessionProjectRef>,
}
```

## 6. Checklist para Novo Command

1. Criar/atualizar struct em `models/dominio.rs`
2. Implementar fn em `commands/dominio.rs` -> `Result<T, String>`
3. Registrar em `lib.rs` no `generate_handler![]`
4. Criar método correspondente em `services/dominio.ts` no frontend
5. Se necessário, adicionar permissão em `capabilities/default.json`
6. Se alterar o schema, adicionar SQL idempotente em `migrations.rs`
