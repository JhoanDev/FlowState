use tauri::{Manager, State};

use crate::database::DbPool;
use crate::models::AppSettings;

fn read_setting(conn: &rusqlite::Connection, key: &str, default: &str) -> String {
    conn.query_row(
        "SELECT value FROM settings WHERE key = ?1",
        rusqlite::params![key],
        |row| row.get::<_, String>(0),
    )
    .unwrap_or_else(|_| default.to_string())
}

#[tauri::command]
pub fn get_settings(db: State<'_, DbPool>) -> Result<AppSettings, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;

    Ok(AppSettings {
        theme: read_setting(&conn, "theme", "system"),
        language: read_setting(&conn, "language", "en"),
        time_format: read_setting(&conn, "timeFormat", "24h"),
        date_format: read_setting(&conn, "dateFormat", "BR"),
        strict_mode_default: read_setting(&conn, "strictModeDefault", "false") == "true",
    })
}

#[tauri::command]
pub fn update_settings(
    db: State<'_, DbPool>,
    settings: serde_json::Value,
) -> Result<AppSettings, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;

    let mapping: &[(&str, &str)] = &[
        ("theme", "theme"),
        ("language", "language"),
        ("timeFormat", "timeFormat"),
        ("dateFormat", "dateFormat"),
        ("strictModeDefault", "strictModeDefault"),
    ];

    for (json_key, db_key) in mapping {
        if let Some(val) = settings.get(json_key) {
            let str_val = match val {
                serde_json::Value::Bool(b) => b.to_string(),
                serde_json::Value::String(s) => s.clone(),
                other => other.to_string(),
            };
            conn.execute(
                "INSERT OR REPLACE INTO settings (key, value) VALUES (?1, ?2)",
                rusqlite::params![db_key, str_val],
            )
            .map_err(|e| format!("Update error: {}", e))?;
        }
    }

    // Return the updated settings
    Ok(AppSettings {
        theme: read_setting(&conn, "theme", "system"),
        language: read_setting(&conn, "language", "en"),
        time_format: read_setting(&conn, "timeFormat", "24h"),
        date_format: read_setting(&conn, "dateFormat", "BR"),
        strict_mode_default: read_setting(&conn, "strictModeDefault", "false") == "true",
    })
}

#[tauri::command]
pub fn export_data_vault(app: tauri::AppHandle, db: State<'_, DbPool>, path: String) -> Result<bool, String> {
    use std::fs;

    // Flush WAL to the main database file to avoid exporting incomplete data
    {
        let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;
        conn.execute_batch("PRAGMA wal_checkpoint(TRUNCATE);")
            .map_err(|e| format!("Checkpoint error: {}", e))?;
    }

    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Path error: {}", e))?;
    let db_path = data_dir.join("flowstate.db");

    if !db_path.exists() {
        return Err("Database file not found".to_string());
    }

    fs::copy(&db_path, &path).map_err(|e| format!("Export error: {}", e))?;
    Ok(true)
}

#[allow(unreachable_code)]
#[tauri::command]
pub fn import_data_vault(app: tauri::AppHandle, path: String) -> Result<bool, String> {
    use std::fs;

    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Path error: {}", e))?;
    let db_path = data_dir.join("flowstate.db");

    // Remove WAL files so they don't corrupt the new DB
    let _ = fs::remove_file(data_dir.join("flowstate.db-wal"));
    let _ = fs::remove_file(data_dir.join("flowstate.db-shm"));

    fs::copy(&path, &db_path).map_err(|e| format!("Import error: {}", e))?;
    
    // In development (debug), app.restart() kills the Next.js server causing "Connection refused".
    #[cfg(not(debug_assertions))]
    app.restart();
    
    Ok(true)
}

#[tauri::command]
pub fn wipe_all_data(db: State<'_, DbPool>) -> Result<bool, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;

    conn.execute_batch(
        "DELETE FROM session_tags;
         DELETE FROM sessions;
         DELETE FROM weekly_goals;
         DELETE FROM projects;
         DELETE FROM tags;
         DELETE FROM settings;
         INSERT INTO settings (key, value) VALUES ('theme', 'system');
         INSERT INTO settings (key, value) VALUES ('language', 'en');
         INSERT INTO settings (key, value) VALUES ('timeFormat', '24h');
         INSERT INTO settings (key, value) VALUES ('dateFormat', 'BR');
         INSERT INTO settings (key, value) VALUES ('strictModeDefault', 'false');",
    )
    .map_err(|e| format!("Wipe error: {}", e))?;

    Ok(true)
}
