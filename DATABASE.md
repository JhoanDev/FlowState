# FlowState — Schema do Banco de Dados

SQLite local-first, gerenciado via `rusqlite` (bundled). Migrations rodam automaticamente na primeira inicialização do app.

---

## Diagrama de Relacionamentos

```
projects ──────< sessions >────── session_tags >────── tags
                                       │
weekly_goals                      settings (chave-valor)
```

- `sessions.project_id` → `projects.id` (FK, ON DELETE SET NULL)
- `session_tags.session_id` → `sessions.id` (FK, ON DELETE CASCADE)
- `session_tags.tag_id` → `tags.id` (FK, ON DELETE CASCADE)
- `weekly_goals.project_id` → `projects.id` (FK, ON DELETE SET NULL)
- `weekly_goals.tag_id` → `tags.id` (FK, ON DELETE SET NULL)

---

## Tabelas

### projects

| Coluna | Tipo | Restrições |
|--------|------|-----------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `name` | TEXT | NOT NULL, UNIQUE |
| `color` | TEXT | NOT NULL, DEFAULT `'#8b5cf6'` |
| `archived` | INTEGER | NOT NULL, DEFAULT `0` |
| `created_at` | DATETIME | NOT NULL, DEFAULT `datetime('now')` |

### tags

| Coluna | Tipo | Restrições |
|--------|------|-----------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `name` | TEXT | NOT NULL, UNIQUE |
| `color` | TEXT | NOT NULL, DEFAULT `'#a78bfa'` |
| `created_at` | DATETIME | NOT NULL, DEFAULT `datetime('now')` |

### sessions

| Coluna | Tipo | Restrições |
|--------|------|-----------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `type` | TEXT | NOT NULL, CHECK `('WORK', 'STUDY')` |
| `project_id` | INTEGER | FK → `projects.id`, ON DELETE SET NULL |
| `timer_mode` | TEXT | NOT NULL, CHECK `('PROGRESSIVE', 'REGRESSIVE')` |
| `status` | TEXT | NOT NULL, DEFAULT `'ACTIVE'`, CHECK `('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED')` |
| `planned_duration_seconds` | INTEGER | nullable |
| `duration_seconds` | INTEGER | NOT NULL, DEFAULT `0` |
| `started_at` | DATETIME | NOT NULL |
| `finished_at` | DATETIME | nullable |
| `rating` | INTEGER | CHECK `BETWEEN 1 AND 5`, nullable |
| `notes` | TEXT | NOT NULL, DEFAULT `''` |
| `created_at` | DATETIME | NOT NULL, DEFAULT `datetime('now')` |

**Índices:**
- `idx_sessions_type` → `type`
- `idx_sessions_project` → `project_id`
- `idx_sessions_started_at` → `started_at`
- `idx_sessions_status` → `status`

### session_tags

| Coluna | Tipo | Restrições |
|--------|------|-----------|
| `session_id` | INTEGER | NOT NULL, FK → `sessions.id`, ON DELETE CASCADE |
| `tag_id` | INTEGER | NOT NULL, FK → `tags.id`, ON DELETE CASCADE |

**Chave primária:** `(session_id, tag_id)`

**Índice:** `idx_session_tags_tag` → `tag_id`

### weekly_goals

| Coluna | Tipo | Restrições |
|--------|------|-----------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `type` | TEXT | NOT NULL, CHECK `('WORK', 'STUDY')` |
| `label` | TEXT | NOT NULL |
| `target_hours` | INTEGER | NOT NULL |
| `project_id` | INTEGER | FK → `projects.id`, ON DELETE SET NULL |
| `tag_id` | INTEGER | FK → `tags.id`, ON DELETE SET NULL |
| `week_start` | DATE | NOT NULL |
| `created_at` | DATETIME | NOT NULL, DEFAULT `datetime('now')` |

**Índice:** `idx_weekly_goals_week` → `week_start`

### settings

| Coluna | Tipo | Restrições |
|--------|------|-----------|
| `key` | TEXT | PRIMARY KEY |
| `value` | TEXT | NOT NULL |

**Valores padrão inseridos na migration:**

| Chave | Valor |
|-------|-------|
| `theme` | `system` |
| `language` | `en` |
| `timeFormat` | `24h` |
| `dateFormat` | `BR` |
| `strictModeDefault` | `true` |

---

## Mapeamento TypeScript ↔ SQLite

| TypeScript | SQLite | Notas |
|-----------|--------|-------|
| `number` | `INTEGER` | IDs, durations, ratings |
| `string` | `TEXT` / `DATETIME` / `DATE` | Nomes, cores (hex), timestamps ISO |
| `boolean` | `INTEGER` | `0` = false, `1` = true |
| `null` / `undefined` | `NULL` | Campos opcionais |

---

## PRAGMAs

Configurados na inicialização da conexão:

```sql
PRAGMA journal_mode = WAL;     -- Leituras concorrentes durante escrita
PRAGMA foreign_keys = ON;       -- Enforça integridade referencial
```

---

## SQL de Criação Completo

```sql
CREATE TABLE IF NOT EXISTS projects (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL UNIQUE,
    color       TEXT    NOT NULL DEFAULT '#8b5cf6',
    archived    INTEGER NOT NULL DEFAULT 0,
    created_at  DATETIME NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tags (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL UNIQUE,
    color       TEXT    NOT NULL DEFAULT '#a78bfa',
    created_at  DATETIME NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
    id                       INTEGER PRIMARY KEY AUTOINCREMENT,
    type                     TEXT    NOT NULL CHECK (type IN ('WORK', 'STUDY')),
    project_id               INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    timer_mode               TEXT    NOT NULL CHECK (timer_mode IN ('PROGRESSIVE', 'REGRESSIVE')),
    status                   TEXT    NOT NULL DEFAULT 'ACTIVE'
                                     CHECK (status IN ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED')),
    planned_duration_seconds INTEGER,
    duration_seconds         INTEGER NOT NULL DEFAULT 0,
    started_at               DATETIME NOT NULL,
    finished_at              DATETIME,
    rating                   INTEGER CHECK (rating BETWEEN 1 AND 5),
    notes                    TEXT    NOT NULL DEFAULT '',
    created_at               DATETIME NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_type       ON sessions(type);
CREATE INDEX IF NOT EXISTS idx_sessions_project    ON sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_status     ON sessions(status);

CREATE TABLE IF NOT EXISTS session_tags (
    session_id  INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    tag_id      INTEGER NOT NULL REFERENCES tags(id)     ON DELETE CASCADE,
    PRIMARY KEY (session_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_session_tags_tag ON session_tags(tag_id);

CREATE TABLE IF NOT EXISTS weekly_goals (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    type         TEXT    NOT NULL CHECK (type IN ('WORK', 'STUDY')),
    label        TEXT    NOT NULL,
    target_hours INTEGER NOT NULL,
    project_id   INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    tag_id       INTEGER REFERENCES tags(id) ON DELETE SET NULL,
    week_start   DATE    NOT NULL,
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
INSERT OR IGNORE INTO settings (key, value) VALUES ('strictModeDefault', 'true');
```
