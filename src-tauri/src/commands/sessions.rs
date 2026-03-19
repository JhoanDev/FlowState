use tauri::State;

use crate::database::DbPool;
use crate::models::{
    Session, SessionProjectRef, SessionTagRef, SessionWithRelations, TodayStats,
};

fn row_to_session(row: &rusqlite::Row) -> rusqlite::Result<Session> {
    Ok(Session {
        id: row.get(0)?,
        session_type: row.get(1)?,
        project_id: row.get(2)?,
        timer_mode: row.get(3)?,
        status: row.get(4)?,
        planned_duration_seconds: row.get(5)?,
        duration_seconds: row.get(6)?,
        started_at: row.get(7)?,
        finished_at: row.get(8)?,
        rating: row.get(9)?,
        notes: row.get(10)?,
        created_at: row.get(11)?,
    })
}

const SESSION_COLUMNS: &str =
    "id, type, project_id, timer_mode, status, planned_duration_seconds, \
     duration_seconds, started_at, finished_at, rating, notes, created_at";

#[tauri::command]
pub fn save_session(
    db: State<'_, DbPool>,
    session: crate::models::session::SaveSessionInput,
) -> Result<Session, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;

    conn.execute(
        "INSERT INTO sessions (type, project_id, timer_mode, status, planned_duration_seconds,
         duration_seconds, started_at, finished_at, rating, notes)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        rusqlite::params![
            session.session_type,
            session.project_id,
            session.timer_mode,
            session.status,
            session.planned_duration_seconds,
            session.duration_seconds,
            session.started_at,
            session.finished_at,
            session.rating,
            session.notes,
        ],
    )
    .map_err(|e| format!("Insert error: {}", e))?;

    let id = conn.last_insert_rowid();
    let sql = format!("SELECT {} FROM sessions WHERE id = ?1", SESSION_COLUMNS);
    let mut stmt = conn.prepare(&sql).map_err(|e| format!("Query error: {}", e))?;

    stmt.query_row(rusqlite::params![id], row_to_session)
        .map_err(|e| format!("Fetch error: {}", e))
}

#[tauri::command]
pub fn save_session_review(
    db: State<'_, DbPool>,
    session_id: i64,
    rating: i64,
    notes: String,
) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    conn.execute(
        "UPDATE sessions SET rating = ?1, notes = ?2 WHERE id = ?3",
        rusqlite::params![rating, notes, session_id],
    )
    .map_err(|e| format!("Update error: {}", e))?;
    Ok(())
}

#[tauri::command]
pub fn get_session(
    db: State<'_, DbPool>,
    session_id: i64,
) -> Result<Option<SessionWithRelations>, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;

    let sql = format!("SELECT {} FROM sessions WHERE id = ?1", SESSION_COLUMNS);
    let mut stmt = conn.prepare(&sql).map_err(|e| format!("Query error: {}", e))?;

    let session = match stmt.query_row(rusqlite::params![session_id], row_to_session) {
        Ok(s) => s,
        Err(rusqlite::Error::QueryReturnedNoRows) => return Ok(None),
        Err(e) => return Err(format!("Query error: {}", e)),
    };

    let project = if let Some(pid) = session.project_id {
        let mut pstmt = conn
            .prepare("SELECT id, name, color FROM projects WHERE id = ?1")
            .map_err(|e| format!("Query error: {}", e))?;
        pstmt
            .query_row(rusqlite::params![pid], |row| {
                Ok(SessionProjectRef {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    color: row.get(2)?,
                })
            })
            .ok()
    } else {
        None
    };

    let mut tstmt = conn
        .prepare(
            "SELECT t.id, t.name, t.color
             FROM tags t
             INNER JOIN session_tags st ON st.tag_id = t.id
             WHERE st.session_id = ?1",
        )
        .map_err(|e| format!("Query error: {}", e))?;

    let tag_rows = tstmt
        .query_map(rusqlite::params![session_id], |row| {
            Ok(SessionTagRef {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
            })
        })
        .map_err(|e| format!("Query error: {}", e))?;

    let mut tags = Vec::new();
    for tag in tag_rows {
        tags.push(tag.map_err(|e| format!("Row error: {}", e))?);
    }

    Ok(Some(SessionWithRelations {
        session,
        project,
        tags,
    }))
}

#[tauri::command]
pub fn save_manual_session(
    db: State<'_, DbPool>,
    session: crate::models::session::SaveSessionInput,
    tag_ids: Vec<i64>,
) -> Result<Session, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;

    conn.execute(
        "INSERT INTO sessions (type, project_id, timer_mode, status, planned_duration_seconds,
         duration_seconds, started_at, finished_at, rating, notes)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        rusqlite::params![
            session.session_type,
            session.project_id,
            session.timer_mode,
            session.status,
            session.planned_duration_seconds,
            session.duration_seconds,
            session.started_at,
            session.finished_at,
            session.rating,
            session.notes,
        ],
    )
    .map_err(|e| format!("Insert error: {}", e))?;

    let id = conn.last_insert_rowid();

    for tag_id in &tag_ids {
        conn.execute(
            "INSERT INTO session_tags (session_id, tag_id) VALUES (?1, ?2)",
            rusqlite::params![id, tag_id],
        )
        .map_err(|e| format!("Tag link error: {}", e))?;
    }

    let sql = format!("SELECT {} FROM sessions WHERE id = ?1", SESSION_COLUMNS);
    let mut stmt = conn.prepare(&sql).map_err(|e| format!("Query error: {}", e))?;

    stmt.query_row(rusqlite::params![id], row_to_session)
        .map_err(|e| format!("Fetch error: {}", e))
}

#[tauri::command]
pub fn get_today_stats(db: State<'_, DbPool>) -> Result<TodayStats, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;

    let mut stmt = conn
        .prepare(
            "SELECT COUNT(*), COALESCE(SUM(duration_seconds), 0)
             FROM sessions
             WHERE status = 'COMPLETED'
               AND DATE(started_at, 'localtime') = DATE('now', 'localtime')",
        )
        .map_err(|e| format!("Query error: {}", e))?;

    stmt.query_row([], |row| {
        let count: i64 = row.get(0)?;
        let total: i64 = row.get(1)?;
        let avg = if count > 0 { total / count } else { 0 };
        Ok(TodayStats {
            session_count: count,
            total_seconds: total,
            avg_seconds: avg,
        })
    })
    .map_err(|e| format!("Query error: {}", e))
}
