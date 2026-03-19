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
        strict_mode_default: read_setting(&conn, "strictModeDefault", "true") == "true",
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
        strict_mode_default: read_setting(&conn, "strictModeDefault", "true") == "true",
    })
}

#[tauri::command]
pub fn export_data_vault(app: tauri::AppHandle) -> Result<bool, String> {
    use std::fs;

    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Path error: {}", e))?;
    let db_path = data_dir.join("flowstate.db");

    if !db_path.exists() {
        return Err("Database file not found".to_string());
    }

    // Use native dialog to pick save location
    let home = std::env::var("HOME").unwrap_or_else(|_| "/tmp".to_string());
    let default_name = format!(
        "flowstate-backup-{}.db",
        chrono::Utc::now().format("%Y%m%d-%H%M%S")
    );
    let dest = std::path::PathBuf::from(&home)
        .join("Documents")
        .join(&default_name);

    // Ensure Documents dir exists
    if let Some(parent) = dest.parent() {
        let _ = fs::create_dir_all(parent);
    }

    fs::copy(&db_path, &dest).map_err(|e| format!("Export error: {}", e))?;
    Ok(true)
}

#[tauri::command]
pub fn import_data_vault(app: tauri::AppHandle) -> Result<bool, String> {
    // For import, the frontend should handle file selection via dialog
    // This is a placeholder that returns the expected path
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Path error: {}", e))?;
    let _db_path = data_dir.join("flowstate.db");

    // Import logic would copy a selected .db file over the current one
    // This requires the app to restart the DB connection after import
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
         INSERT INTO settings (key, value) VALUES ('strictModeDefault', 'true');",
    )
    .map_err(|e| format!("Wipe error: {}", e))?;

    Ok(true)
}
