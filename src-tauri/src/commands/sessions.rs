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

// ─── Inner Functions (testable without Tauri State) ──────────────────────────

fn insert_session_inner(
    conn: &rusqlite::Connection,
    session: &crate::models::session::SaveSessionInput,
) -> Result<Session, String> {
    if session.session_type == "WORK" && session.project_id.is_none() {
        return Err("Project is required for WORK sessions".to_string());
    }

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

fn insert_manual_session_inner(
    conn: &rusqlite::Connection,
    session: &crate::models::session::SaveSessionInput,
    tag_ids: &[i64],
) -> Result<Session, String> {
    if session.session_type == "WORK" && session.project_id.is_none() {
        return Err("Project is required for WORK sessions".to_string());
    }
    if session.session_type == "STUDY" && tag_ids.is_empty() {
        return Err("At least one tag is required for STUDY sessions".to_string());
    }

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

    for tag_id in tag_ids {
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

fn update_session_review_inner(
    conn: &rusqlite::Connection,
    session_id: i64,
    rating: i64,
    notes: &str,
) -> Result<(), String> {
    conn.execute(
        "UPDATE sessions SET rating = ?1, notes = ?2 WHERE id = ?3",
        rusqlite::params![rating, notes, session_id],
    )
    .map_err(|e| format!("Update error: {}", e))?;
    Ok(())
}

fn delete_session_inner(conn: &rusqlite::Connection, session_id: i64) -> Result<(), String> {
    conn.execute(
        "DELETE FROM session_tags WHERE session_id = ?1",
        rusqlite::params![session_id],
    )
    .map_err(|e| format!("Delete tags error: {}", e))?;

    let affected = conn
        .execute(
            "DELETE FROM sessions WHERE id = ?1",
            rusqlite::params![session_id],
        )
        .map_err(|e| format!("Delete error: {}", e))?;

    if affected == 0 {
        return Err(format!("Session {} not found", session_id));
    }

    Ok(())
}

// ─── Tauri Commands (thin wrappers) ──────────────────────────────────────────

#[tauri::command]
pub fn save_session(
    db: State<'_, DbPool>,
    session: crate::models::session::SaveSessionInput,
) -> Result<Session, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    insert_session_inner(&conn, &session)
}

#[tauri::command]
pub fn save_session_review(
    db: State<'_, DbPool>,
    session_id: i64,
    rating: i64,
    notes: String,
) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    update_session_review_inner(&conn, session_id, rating, &notes)
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
    insert_manual_session_inner(&conn, &session, &tag_ids)
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

#[tauri::command]
pub fn delete_session(db: State<'_, DbPool>, session_id: i64) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    delete_session_inner(&conn, session_id)
}

// ─── Tests ───────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database::migrations;
    use crate::models::session::SaveSessionInput;
    use rusqlite::Connection;

    fn setup() -> Connection {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch("PRAGMA foreign_keys=ON;").unwrap();
        conn.execute_batch(migrations::CREATE_TABLES).unwrap();
        conn
    }

    fn insert_project(conn: &Connection, name: &str) -> i64 {
        conn.execute(
            "INSERT INTO projects (name, color) VALUES (?1, '#8b5cf6')",
            rusqlite::params![name],
        )
        .unwrap();
        conn.last_insert_rowid()
    }

    fn insert_tag(conn: &Connection, name: &str) -> i64 {
        conn.execute(
            "INSERT INTO tags (name, color) VALUES (?1, '#a78bfa')",
            rusqlite::params![name],
        )
        .unwrap();
        conn.last_insert_rowid()
    }

    fn work_input(project_id: Option<i64>) -> SaveSessionInput {
        SaveSessionInput {
            session_type: "WORK".into(),
            project_id,
            timer_mode: "PROGRESSIVE".into(),
            status: "ACTIVE".into(),
            planned_duration_seconds: None,
            duration_seconds: 0,
            started_at: "2024-06-01T10:00:00".into(),
            finished_at: None,
            rating: None,
            notes: "".into(),
        }
    }

    fn study_input() -> SaveSessionInput {
        SaveSessionInput {
            session_type: "STUDY".into(),
            project_id: None,
            timer_mode: "PROGRESSIVE".into(),
            status: "ACTIVE".into(),
            planned_duration_seconds: None,
            duration_seconds: 0,
            started_at: "2024-06-01T10:00:00".into(),
            finished_at: None,
            rating: None,
            notes: "".into(),
        }
    }

    // ── RF-S01 Grupo A: Regras de negócio WORK ───────────────────────────────

    #[test]
    fn tc_s01_a01_work_com_projeto_sem_tags_ok() {
        let conn = setup();
        let pid = insert_project(&conn, "Backend");
        let result = insert_manual_session_inner(&conn, &work_input(Some(pid)), &[]);
        assert!(result.is_ok(), "WORK + projeto + sem tags deve ser aceito");
    }

    #[test]
    fn tc_s01_a02_work_com_projeto_com_tags_ok() {
        let conn = setup();
        let pid = insert_project(&conn, "Backend");
        let tid = insert_tag(&conn, "Rust");
        let result = insert_manual_session_inner(&conn, &work_input(Some(pid)), &[tid]);
        assert!(result.is_ok(), "WORK + projeto + tags deve ser aceito");
        let count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM session_tags WHERE session_id = ?1",
                rusqlite::params![result.unwrap().id],
                |r| r.get(0),
            )
            .unwrap();
        assert_eq!(count, 1);
    }

    #[test]
    fn tc_s01_a03_work_sem_projeto_sem_tags_err() {
        let conn = setup();
        let result = insert_manual_session_inner(&conn, &work_input(None), &[]);
        assert!(result.is_err(), "WORK sem projeto deve retornar Err");
        assert!(result.unwrap_err().contains("Project is required"));
    }

    #[test]
    fn tc_s01_a04_work_sem_projeto_com_tags_err() {
        let conn = setup();
        let tid = insert_tag(&conn, "Rust");
        let result = insert_manual_session_inner(&conn, &work_input(None), &[tid]);
        assert!(result.is_err(), "WORK sem projeto (mesmo com tags) deve retornar Err");
        assert!(result.unwrap_err().contains("Project is required"));
    }

    // ── RF-S01 Grupo B: Regras de negócio STUDY ──────────────────────────────

    #[test]
    fn tc_s01_b01_study_com_uma_tag_ok() {
        let conn = setup();
        let tid = insert_tag(&conn, "Matemática");
        let result = insert_manual_session_inner(&conn, &study_input(), &[tid]);
        assert!(result.is_ok(), "STUDY + 1 tag deve ser aceito");
    }

    #[test]
    fn tc_s01_b02_study_com_multiplas_tags_ok() {
        let conn = setup();
        let t1 = insert_tag(&conn, "Física");
        let t2 = insert_tag(&conn, "Química");
        let t3 = insert_tag(&conn, "Biologia");
        let result = insert_manual_session_inner(&conn, &study_input(), &[t1, t2, t3]);
        assert!(result.is_ok());
        let count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM session_tags WHERE session_id = ?1",
                rusqlite::params![result.unwrap().id],
                |r| r.get(0),
            )
            .unwrap();
        assert_eq!(count, 3);
    }

    #[test]
    fn tc_s01_b03_study_sem_tags_err() {
        let conn = setup();
        let result = insert_manual_session_inner(&conn, &study_input(), &[]);
        assert!(result.is_err(), "STUDY sem tags deve retornar Err");
        assert!(result.unwrap_err().contains("tag is required"));
    }

    // ── RF-S01 Grupo C: Constraints de schema ────────────────────────────────

    #[test]
    fn tc_s01_c01_insercao_base_retorna_entidade_com_id() {
        let conn = setup();
        let pid = insert_project(&conn, "Projeto");
        let s = insert_session_inner(&conn, &work_input(Some(pid))).unwrap();
        assert!(s.id > 0);
        assert_eq!(s.session_type, "WORK");
        assert_eq!(s.timer_mode, "PROGRESSIVE");
        assert_eq!(s.status, "ACTIVE");
        assert_eq!(s.duration_seconds, 0);
        assert!(s.planned_duration_seconds.is_none());
        assert!(s.finished_at.is_none());
        assert!(s.rating.is_none());
    }

    #[test]
    fn tc_s01_c02_pomodoro_salva_planned_duration() {
        let conn = setup();
        let pid = insert_project(&conn, "Projeto");
        let mut input = work_input(Some(pid));
        input.timer_mode = "REGRESSIVE".into();
        input.planned_duration_seconds = Some(1500);
        let s = insert_session_inner(&conn, &input).unwrap();
        assert_eq!(s.timer_mode, "REGRESSIVE");
        assert_eq!(s.planned_duration_seconds, Some(1500));
    }

    #[test]
    fn tc_s01_c03_tipo_invalido_rejeitado() {
        let conn = setup();
        let mut input = work_input(Some(1));
        input.session_type = "MEETING".into();
        assert!(insert_session_inner(&conn, &input).is_err());
    }

    #[test]
    fn tc_s01_c04_timer_mode_invalido_rejeitado() {
        let conn = setup();
        let pid = insert_project(&conn, "P");
        let mut input = work_input(Some(pid));
        input.timer_mode = "COUNTDOWN".into();
        assert!(insert_session_inner(&conn, &input).is_err());
    }

    #[test]
    fn tc_s01_c05_project_id_fk_inexistente_rejeitado() {
        let conn = setup();
        let result = insert_session_inner(&conn, &work_input(Some(9999)));
        assert!(result.is_err());
    }

    #[test]
    fn tc_s01_c06_started_at_preservado() {
        let conn = setup();
        let pid = insert_project(&conn, "P");
        let mut input = work_input(Some(pid));
        input.started_at = "2024-03-15T09:30:00".into();
        let s = insert_session_inner(&conn, &input).unwrap();
        assert_eq!(s.started_at, "2024-03-15T09:30:00");
    }

    #[test]
    fn tc_s01_c07_ids_unicos_e_crescentes() {
        let conn = setup();
        let pid = insert_project(&conn, "P");
        let s1 = insert_session_inner(&conn, &work_input(Some(pid))).unwrap();
        let s2 = insert_session_inner(&conn, &work_input(Some(pid))).unwrap();
        let s3 = insert_session_inner(&conn, &work_input(Some(pid))).unwrap();
        assert!(s1.id < s2.id);
        assert!(s2.id < s3.id);
    }

    // ── RF-S03: Salvar review ─────────────────────────────────────────────────

    #[test]
    fn tc_s03_01_review_salva_rating_e_notes() {
        let conn = setup();
        let pid = insert_project(&conn, "P");
        let s = insert_session_inner(&conn, &work_input(Some(pid))).unwrap();
        update_session_review_inner(&conn, s.id, 4, "Foco excelente").unwrap();
        let (rating, notes): (i64, String) = conn
            .query_row(
                "SELECT rating, notes FROM sessions WHERE id = ?1",
                rusqlite::params![s.id],
                |r| Ok((r.get(0)?, r.get(1)?)),
            )
            .unwrap();
        assert_eq!(rating, 4);
        assert_eq!(notes, "Foco excelente");
    }

    #[test]
    fn tc_s03_02_rating_minimo_aceito() {
        let conn = setup();
        let pid = insert_project(&conn, "P");
        let s = insert_session_inner(&conn, &work_input(Some(pid))).unwrap();
        assert!(update_session_review_inner(&conn, s.id, 1, "").is_ok());
    }

    #[test]
    fn tc_s03_03_rating_maximo_aceito() {
        let conn = setup();
        let pid = insert_project(&conn, "P");
        let s = insert_session_inner(&conn, &work_input(Some(pid))).unwrap();
        assert!(update_session_review_inner(&conn, s.id, 5, "").is_ok());
    }

    #[test]
    fn tc_s03_04_rating_zero_rejeitado() {
        let conn = setup();
        let pid = insert_project(&conn, "P");
        let s = insert_session_inner(&conn, &work_input(Some(pid))).unwrap();
        assert!(update_session_review_inner(&conn, s.id, 0, "").is_err());
    }

    #[test]
    fn tc_s03_05_rating_seis_rejeitado() {
        let conn = setup();
        let pid = insert_project(&conn, "P");
        let s = insert_session_inner(&conn, &work_input(Some(pid))).unwrap();
        assert!(update_session_review_inner(&conn, s.id, 6, "").is_err());
    }

    #[test]
    fn tc_s03_06_notes_vazio_aceito() {
        let conn = setup();
        let pid = insert_project(&conn, "P");
        let s = insert_session_inner(&conn, &work_input(Some(pid))).unwrap();
        assert!(update_session_review_inner(&conn, s.id, 3, "").is_ok());
    }

    // ── RF-S04 Grupo A: Manual WORK ──────────────────────────────────────────

    #[test]
    fn tc_s04_a01_work_manual_com_projeto_sem_tags_ok() {
        let conn = setup();
        let pid = insert_project(&conn, "P");
        assert!(insert_manual_session_inner(&conn, &work_input(Some(pid)), &[]).is_ok());
    }

    #[test]
    fn tc_s04_a02_work_manual_com_projeto_e_tags_ok() {
        let conn = setup();
        let pid = insert_project(&conn, "P");
        let t1 = insert_tag(&conn, "Rust");
        let t2 = insert_tag(&conn, "Backend");
        let s = insert_manual_session_inner(&conn, &work_input(Some(pid)), &[t1, t2]).unwrap();
        let count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM session_tags WHERE session_id = ?1",
                rusqlite::params![s.id],
                |r| r.get(0),
            )
            .unwrap();
        assert_eq!(count, 2);
    }

    #[test]
    fn tc_s04_a03_work_manual_sem_projeto_err() {
        let conn = setup();
        let result = insert_manual_session_inner(&conn, &work_input(None), &[]);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Project is required"));
    }

    // ── RF-S04 Grupo B: Manual STUDY ─────────────────────────────────────────

    #[test]
    fn tc_s04_b01_study_manual_com_tags_ok() {
        let conn = setup();
        let tid = insert_tag(&conn, "Rust");
        assert!(insert_manual_session_inner(&conn, &study_input(), &[tid]).is_ok());
    }

    #[test]
    fn tc_s04_b02_study_manual_sem_tags_err() {
        let conn = setup();
        let result = insert_manual_session_inner(&conn, &study_input(), &[]);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("tag is required"));
    }

    // ── RF-S04 Grupo C: Constraints session_tags ─────────────────────────────

    #[test]
    fn tc_s04_c01_tag_id_inexistente_rejeitado() {
        let conn = setup();
        let tid = insert_tag(&conn, "Rust");
        let _ = tid;
        let result = insert_manual_session_inner(&conn, &study_input(), &[9999]);
        assert!(result.is_err());
    }

    #[test]
    fn tc_s04_c02_tag_duplicada_rejeitada() {
        let conn = setup();
        let tid = insert_tag(&conn, "Rust");
        let result = insert_manual_session_inner(&conn, &study_input(), &[tid, tid]);
        assert!(result.is_err());
    }

    // ── RF-S06: Excluir sessão ────────────────────────────────────────────────

    #[test]
    fn tc_s06_01_sessao_existente_excluida() {
        let conn = setup();
        let pid = insert_project(&conn, "P");
        let s = insert_session_inner(&conn, &work_input(Some(pid))).unwrap();
        assert!(delete_session_inner(&conn, s.id).is_ok());
        let count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM sessions WHERE id = ?1",
                rusqlite::params![s.id],
                |r| r.get(0),
            )
            .unwrap();
        assert_eq!(count, 0);
    }

    #[test]
    fn tc_s06_02_session_tags_removidas_junto() {
        let conn = setup();
        let t1 = insert_tag(&conn, "T1");
        let t2 = insert_tag(&conn, "T2");
        let s = insert_manual_session_inner(&conn, &study_input(), &[t1, t2]).unwrap();
        delete_session_inner(&conn, s.id).unwrap();
        let count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM session_tags WHERE session_id = ?1",
                rusqlite::params![s.id],
                |r| r.get(0),
            )
            .unwrap();
        assert_eq!(count, 0);
    }

    #[test]
    fn tc_s06_03_tags_nao_afetadas_pela_exclusao() {
        let conn = setup();
        let tid = insert_tag(&conn, "Rust");
        let s = insert_manual_session_inner(&conn, &study_input(), &[tid]).unwrap();
        delete_session_inner(&conn, s.id).unwrap();
        let count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM tags WHERE id = ?1",
                rusqlite::params![tid],
                |r| r.get(0),
            )
            .unwrap();
        assert_eq!(count, 1);
    }

    #[test]
    fn tc_s06_04_sessao_inexistente_retorna_err() {
        let conn = setup();
        assert!(delete_session_inner(&conn, 9999).is_err());
    }

    #[test]
    fn tc_s06_05_outras_sessoes_nao_afetadas() {
        let conn = setup();
        let pid = insert_project(&conn, "P");
        let s1 = insert_session_inner(&conn, &work_input(Some(pid))).unwrap();
        let s2 = insert_session_inner(&conn, &work_input(Some(pid))).unwrap();
        delete_session_inner(&conn, s1.id).unwrap();
        let count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM sessions WHERE id = ?1",
                rusqlite::params![s2.id],
                |r| r.get(0),
            )
            .unwrap();
        assert_eq!(count, 1);
    }

    // ── RF-S07: Lifecycle de status ───────────────────────────────────────────

    #[test]
    fn tc_s07_01_todos_status_validos_aceitos() {
        let conn = setup();
        let pid = insert_project(&conn, "P");
        for status in &["ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"] {
            let mut input = work_input(Some(pid));
            input.status = status.to_string();
            assert!(
                insert_session_inner(&conn, &input).is_ok(),
                "status '{}' deve ser aceito",
                status
            );
        }
    }

    #[test]
    fn tc_s07_02_status_invalido_rejeitado() {
        let conn = setup();
        let pid = insert_project(&conn, "P");
        let mut input = work_input(Some(pid));
        input.status = "RUNNING".into();
        assert!(insert_session_inner(&conn, &input).is_err());
    }

    #[test]
    fn tc_s07_03_migrations_sao_idempotentes() {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch("PRAGMA foreign_keys=ON;").unwrap();
        conn.execute_batch(migrations::CREATE_TABLES).unwrap();
        conn.execute_batch(migrations::CREATE_TABLES).unwrap();
    }
}
