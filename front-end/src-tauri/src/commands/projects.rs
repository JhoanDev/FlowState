use tauri::State;

use crate::database::DbPool;
use crate::models::Project;

#[tauri::command]
pub fn get_projects(db: State<'_, DbPool>) -> Result<Vec<Project>, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    let mut stmt = conn
        .prepare(
            "SELECT id, name, color, archived, created_at
             FROM projects
             WHERE archived = 0
             ORDER BY name ASC",
        )
        .map_err(|e| format!("Query error: {}", e))?;

    let rows = stmt
        .query_map([], |row| {
            Ok(Project {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                archived: row.get::<_, i64>(3)? != 0,
                created_at: row.get(4)?,
            })
        })
        .map_err(|e| format!("Query error: {}", e))?;

    let mut projects = Vec::new();
    for row in rows {
        projects.push(row.map_err(|e| format!("Row error: {}", e))?);
    }
    Ok(projects)
}

#[tauri::command]
pub fn create_project(
    db: State<'_, DbPool>,
    name: String,
    color: Option<String>,
) -> Result<Project, String> {
    let color = color.unwrap_or_else(|| "#8b5cf6".to_string());
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;

    conn.execute(
        "INSERT INTO projects (name, color) VALUES (?1, ?2)",
        rusqlite::params![name, color],
    )
    .map_err(|e| format!("Insert error: {}", e))?;

    let id = conn.last_insert_rowid();
    let mut stmt = conn
        .prepare("SELECT id, name, color, archived, created_at FROM projects WHERE id = ?1")
        .map_err(|e| format!("Query error: {}", e))?;

    stmt.query_row(rusqlite::params![id], |row| {
        Ok(Project {
            id: row.get(0)?,
            name: row.get(1)?,
            color: row.get(2)?,
            archived: row.get::<_, i64>(3)? != 0,
            created_at: row.get(4)?,
        })
    })
    .map_err(|e| format!("Fetch error: {}", e))
}

#[tauri::command]
pub fn update_project(
    db: State<'_, DbPool>,
    id: i64,
    name: Option<String>,
    color: Option<String>,
) -> Result<Project, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;

    if let Some(ref n) = name {
        conn.execute(
            "UPDATE projects SET name = ?1 WHERE id = ?2",
            rusqlite::params![n, id],
        )
        .map_err(|e| format!("Update error: {}", e))?;
    }
    if let Some(ref c) = color {
        conn.execute(
            "UPDATE projects SET color = ?1 WHERE id = ?2",
            rusqlite::params![c, id],
        )
        .map_err(|e| format!("Update error: {}", e))?;
    }

    let mut stmt = conn
        .prepare("SELECT id, name, color, archived, created_at FROM projects WHERE id = ?1")
        .map_err(|e| format!("Query error: {}", e))?;

    stmt.query_row(rusqlite::params![id], |row| {
        Ok(Project {
            id: row.get(0)?,
            name: row.get(1)?,
            color: row.get(2)?,
            archived: row.get::<_, i64>(3)? != 0,
            created_at: row.get(4)?,
        })
    })
    .map_err(|_| format!("Project {} not found", id))
}

#[tauri::command]
pub fn delete_project(db: State<'_, DbPool>, id: i64) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    conn.execute("DELETE FROM projects WHERE id = ?1", rusqlite::params![id])
        .map_err(|e| format!("Delete error: {}", e))?;
    Ok(())
}
