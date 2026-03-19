pub mod connection;
pub mod migrations;

pub use connection::DbPool;

use tauri::Manager;

pub fn init_db(app: &tauri::App) -> Result<DbPool, Box<dyn std::error::Error>> {
    let app_dir = app.path().app_data_dir()?;
    std::fs::create_dir_all(&app_dir)?;
    let db_path = app_dir.join("flowstate.db");

    let pool = DbPool::open(&db_path)?;

    // Run migrations
    {
        let conn = pool.0.lock().map_err(|e| format!("Lock error: {}", e))?;
        conn.execute_batch(migrations::CREATE_TABLES)
            .map_err(|e| format!("Migration error: {}", e))?;
    }

    log::info!("Database initialized at {:?}", db_path);
    Ok(pool)
}
