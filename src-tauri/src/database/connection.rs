use rusqlite::Connection;
use std::sync::Mutex;

use super::migrations;

/// Thread-safe wrapper around a SQLite connection.
/// Managed via `tauri::State<DbPool>` in all commands.
pub struct DbPool(pub Mutex<Connection>);

impl DbPool {
    /// Opens (or creates) the database at the given path, runs migrations,
    /// and enables WAL mode + foreign keys.
    pub fn open(db_path: &std::path::Path) -> Result<Self, String> {
        let conn = Connection::open(db_path)
            .map_err(|e| format!("Failed to open database: {}", e))?;

        // WAL mode allows concurrent reads while writing
        conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;")
            .map_err(|e| format!("Failed to set pragmas: {}", e))?;

        // Run migrations (idempotent thanks to IF NOT EXISTS / INSERT OR IGNORE)
        conn.execute_batch(migrations::CREATE_TABLES)
            .map_err(|e| format!("Migration error: {}", e))?;

        Ok(Self(Mutex::new(conn)))
    }
}
