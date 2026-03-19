pub const CREATE_TABLES: &str = "
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
";
