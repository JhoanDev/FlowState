use tauri::State;

use crate::database::DbPool;
use crate::models::{ActivityEntry, ActivityEntryTag};

fn fetch_tags_for_session(
    conn: &rusqlite::Connection,
    session_id: i64,
) -> Vec<ActivityEntryTag> {
    let mut stmt = match conn.prepare(
        "SELECT t.name, t.color
         FROM tags t
         INNER JOIN session_tags st ON st.tag_id = t.id
         WHERE st.session_id = ?1",
    ) {
        Ok(s) => s,
        Err(_) => return Vec::new(),
    };

    stmt.query_map(rusqlite::params![session_id], |row| {
        Ok(ActivityEntryTag {
            name: row.get(0)?,
            color: row.get(1)?,
        })
    })
    .map(|rows| rows.filter_map(|r| r.ok()).collect())
    .unwrap_or_default()
}

fn query_activities(
    conn: &rusqlite::Connection,
    where_clause: &str,
    params: &[&dyn rusqlite::types::ToSql],
    limit: Option<i64>,
) -> Result<Vec<ActivityEntry>, String> {
    let limit_clause = match limit {
        Some(n) => format!("LIMIT {}", n),
        None => String::new(),
    };
    let sql = format!(
        "SELECT s.id, s.type, p.name, p.color,
                s.duration_seconds, s.started_at, s.rating, s.notes
         FROM sessions s
         LEFT JOIN projects p ON s.project_id = p.id
         WHERE s.status = 'COMPLETED' {}
         ORDER BY s.started_at DESC
         {}",
        where_clause, limit_clause
    );

    let mut stmt = conn.prepare(&sql).map_err(|e| format!("Query error: {}", e))?;

    let rows = stmt
        .query_map(params, |row| {
            Ok((
                row.get::<_, i64>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, Option<String>>(2)?,
                row.get::<_, Option<String>>(3)?,
                row.get::<_, i64>(4)?,
                row.get::<_, String>(5)?,
                row.get::<_, Option<i64>>(6)?,
                row.get::<_, String>(7)?,
            ))
        })
        .map_err(|e| format!("Query error: {}", e))?;

    let mut entries = Vec::new();
    for row in rows {
        let (id, entry_type, project_name, project_color, duration, started_at, rating, notes) =
            row.map_err(|e| format!("Row error: {}", e))?;

        let tags = fetch_tags_for_session(conn, id);

        entries.push(ActivityEntry {
            id,
            entry_type,
            project_name,
            project_color,
            tags,
            duration_seconds: duration,
            started_at,
            rating,
            notes,
        });
    }

    Ok(entries)
}

#[tauri::command]
pub fn get_recent_activities(db: State<'_, DbPool>) -> Result<Vec<ActivityEntry>, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    query_activities(&conn, "", &[], Some(20))
}

#[tauri::command]
pub fn get_activities_by_date(
    db: State<'_, DbPool>,
    date: String,
) -> Result<Vec<ActivityEntry>, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    query_activities(
        &conn,
        "AND DATE(s.started_at) = ?1",
        &[&date as &dyn rusqlite::types::ToSql],
        None,
    )
}

#[tauri::command]
pub fn get_activities_by_project(
    db: State<'_, DbPool>,
    project_id: i64,
) -> Result<Vec<ActivityEntry>, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    query_activities(
        &conn,
        "AND s.project_id = ?1",
        &[&project_id as &dyn rusqlite::types::ToSql],
        None,
    )
}

#[tauri::command]
pub fn get_activities_by_tag(
    db: State<'_, DbPool>,
    tag_id: i64,
) -> Result<Vec<ActivityEntry>, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    query_activities(
        &conn,
        "AND s.id IN (SELECT session_id FROM session_tags WHERE tag_id = ?1)",
        &[&tag_id as &dyn rusqlite::types::ToSql],
        None,
    )
}
