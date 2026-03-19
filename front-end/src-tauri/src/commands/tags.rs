use tauri::State;

use crate::database::DbPool;
use crate::models::Tag;

#[tauri::command]
pub fn get_tags(db: State<'_, DbPool>) -> Result<Vec<Tag>, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    let mut stmt = conn
        .prepare("SELECT id, name, color, created_at FROM tags ORDER BY name ASC")
        .map_err(|e| format!("Query error: {}", e))?;

    let rows = stmt
        .query_map([], |row| {
            Ok(Tag {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                created_at: row.get(3)?,
            })
        })
        .map_err(|e| format!("Query error: {}", e))?;

    let mut tags = Vec::new();
    for row in rows {
        tags.push(row.map_err(|e| format!("Row error: {}", e))?);
    }
    Ok(tags)
}

#[tauri::command]
pub fn create_tag(
    db: State<'_, DbPool>,
    name: String,
    color: Option<String>,
) -> Result<Tag, String> {
    let color = color.unwrap_or_else(|| "#a78bfa".to_string());
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;

    conn.execute(
        "INSERT INTO tags (name, color) VALUES (?1, ?2)",
        rusqlite::params![name, color],
    )
    .map_err(|e| format!("Insert error: {}", e))?;

    let id = conn.last_insert_rowid();
    let mut stmt = conn
        .prepare("SELECT id, name, color, created_at FROM tags WHERE id = ?1")
        .map_err(|e| format!("Query error: {}", e))?;

    stmt.query_row(rusqlite::params![id], |row| {
        Ok(Tag {
            id: row.get(0)?,
            name: row.get(1)?,
            color: row.get(2)?,
            created_at: row.get(3)?,
        })
    })
    .map_err(|e| format!("Fetch error: {}", e))
}

#[tauri::command]
pub fn update_tag(
    db: State<'_, DbPool>,
    id: i64,
    name: Option<String>,
    color: Option<String>,
) -> Result<Tag, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;

    if let Some(ref n) = name {
        conn.execute(
            "UPDATE tags SET name = ?1 WHERE id = ?2",
            rusqlite::params![n, id],
        )
        .map_err(|e| format!("Update error: {}", e))?;
    }
    if let Some(ref c) = color {
        conn.execute(
            "UPDATE tags SET color = ?1 WHERE id = ?2",
            rusqlite::params![c, id],
        )
        .map_err(|e| format!("Update error: {}", e))?;
    }

    let mut stmt = conn
        .prepare("SELECT id, name, color, created_at FROM tags WHERE id = ?1")
        .map_err(|e| format!("Query error: {}", e))?;

    stmt.query_row(rusqlite::params![id], |row| {
        Ok(Tag {
            id: row.get(0)?,
            name: row.get(1)?,
            color: row.get(2)?,
            created_at: row.get(3)?,
        })
    })
    .map_err(|_| format!("Tag {} not found", id))
}

#[tauri::command]
pub fn delete_tag(db: State<'_, DbPool>, id: i64) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    conn.execute("DELETE FROM tags WHERE id = ?1", rusqlite::params![id])
        .map_err(|e| format!("Delete error: {}", e))?;
    Ok(())
}
