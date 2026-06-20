# FlowState Database Schema

SQLite local-first, gerenciado via `rusqlite` (bundled). Migrations rodam
no setup.

## 1. Relacionamentos

```text
projects ──────< sessions >────── session_tags >────── tags
                                       │
weekly_goals                      settings (chave-valor)
```

- `sessions.project_id` → `projects.id` (ON DELETE SET NULL)
- `session_tags.session_id` → `sessions.id` (ON DELETE CASCADE)
- `session_tags.tag_id` → `tags.id` (ON DELETE CASCADE)
- `weekly_goals.project_id` → `projects.id` (ON DELETE SET NULL)
- `weekly_goals.tag_id` → `tags.id` (ON DELETE SET NULL)

## 2. SQL de Criação (Schema Completo)

```sql
CREATE TABLE IF NOT EXISTS projects (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL UNIQUE,
    color       TEXT NOT NULL DEFAULT '#8b5cf6',
    archived    INTEGER NOT NULL DEFAULT 0,
    created_at  DATETIME NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tags (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL UNIQUE,
    color       TEXT NOT NULL DEFAULT '#a78bfa',
    created_at  DATETIME NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
    id                       INTEGER PRIMARY KEY AUTOINCREMENT,
    type                     TEXT NOT NULL CHECK (type IN ('WORK', 'STUDY')),
    project_id               INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    timer_mode               TEXT NOT NULL
                             CHECK (timer_mode IN ('PROGRESSIVE',
                                                   'REGRESSIVE')),
    status                   TEXT NOT NULL DEFAULT 'ACTIVE'
                             CHECK (status IN ('ACTIVE', 'PAUSED',
                                               'COMPLETED', 'CANCELLED')),
    planned_duration_seconds INTEGER,
    duration_seconds         INTEGER NOT NULL DEFAULT 0,
    started_at               DATETIME NOT NULL,
    finished_at              DATETIME,
    rating                   INTEGER CHECK (rating BETWEEN 1 AND 5),
    notes                    TEXT NOT NULL DEFAULT '',
    created_at               DATETIME NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_type       ON sessions(type);
CREATE INDEX IF NOT EXISTS idx_sessions_project    ON sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_status     ON sessions(status);

CREATE TABLE IF NOT EXISTS session_tags (
    session_id  INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    tag_id      INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (session_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_session_tags_tag ON session_tags(tag_id);

CREATE TABLE IF NOT EXISTS weekly_goals (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    type         TEXT NOT NULL CHECK (type IN ('WORK', 'STUDY')),
    label        TEXT NOT NULL,
    target_hours INTEGER NOT NULL,
    project_id   INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    tag_id       INTEGER REFERENCES tags(id) ON DELETE SET NULL,
    week_start   DATE NOT NULL,
    created_at   DATETIME NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_weekly_goals_week ON weekly_goals(week_start);

CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

INSERT OR IGNORE INTO settings (key, value) VALUES ('theme', 'system');
INSERT OR IGNORE INTO settings (key, value) VALUES ('language', 'en');
INSERT OR IGNORE INTO settings (key, value) VALUES ('timeFormat', '24h');
INSERT OR IGNORE INTO settings (key, value) VALUES ('dateFormat', 'BR');
INSERT OR IGNORE INTO settings (key, value) VALUES ('strictModeDefault', 'false');
```

## 3. Campos Computados & Lifecycle de Sessão

- **Não salvos no DB:** `currentHours`, `heatmap.intensity`, `streaks` e
  `distribution` são derivados via queries em runtime.
- **Sessões status:** `ACTIVE → PAUSED → ACTIVE → COMPLETED` ou
  `ACTIVE → CANCELLED`.

## 4. Mapeamento TypeScript ↔ SQLite

| TS | SQLite | Notas |
| :--- | :--- | :--- |
| `number` | `INTEGER` | IDs, durações, ratings |
| `string` | `TEXT` / `DATETIME` | Nomes, cores hex, ISO timestamps |
| `boolean` | `INTEGER` | `0` = false, `1` = true |
| `null` | `NULL` | Campos opcionais |

**Leitura no Rust (conversão booleana):**

```rust
archived: row.get::<_, i64>(3)? != 0,
```

## 5. Regras de Migrations & PRAGMAs

- **Idempotência:** Migrations sem versionamento, seguras para rodar em toda
  inicialização. Use `CREATE TABLE IF NOT EXISTS` e `INSERT OR IGNORE`.
- **Alterações:** Use `ALTER TABLE ... ADD COLUMN` tratando erro caso a coluna
  já exista.
- **PRAGMAs** (ativos em cada conexão):

```sql
PRAGMA journal_mode = WAL;    -- Leituras não bloqueiam escritas
PRAGMA foreign_keys = ON;     -- Enforça integridade referencial
```

## 6. Exportação, Importação e Wipe

- **Export (`export_data_vault`):** Executa `PRAGMA wal_checkpoint(TRUNCATE)`
  para flush do WAL e copia o arquivo `.db`.
- **Import (`import_data_vault`):** Remove arquivos WAL/SHM residuais,
  substitui o `.db` e reinicia o app em release via `app.restart()`.
- **Wipe (`wipe_all_data`):** Limpa os dados das tabelas respeitando a ordem de
  FKs e reinsere as configurações padrão.
