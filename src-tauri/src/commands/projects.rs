use rusqlite::Connection;
use tauri::State;

use crate::database::DbPool;
use crate::models::Project;

fn row_to_project(row: &rusqlite::Row) -> rusqlite::Result<Project> {
    Ok(Project {
        id: row.get(0)?,
        name: row.get(1)?,
        color: row.get(2)?,
        archived: row.get::<_, i64>(3)? != 0,
        created_at: row.get(4)?,
    })
}

fn get_projects_inner(conn: &Connection) -> Result<Vec<Project>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT id, name, color, archived, created_at
             FROM projects
             WHERE archived = 0
             ORDER BY name ASC",
        )
        .map_err(|e| format!("Query error: {}", e))?;

    let rows = stmt
        .query_map([], row_to_project)
        .map_err(|e| format!("Query error: {}", e))?;

    let mut projects = Vec::new();
    for row in rows {
        projects.push(row.map_err(|e| format!("Row error: {}", e))?);
    }
    Ok(projects)
}

fn create_project_inner(conn: &Connection, name: String, color: String) -> Result<Project, String> {
    if name.trim().is_empty() {
        return Err("Project name cannot be empty".to_string());
    }

    conn.execute(
        "INSERT INTO projects (name, color) VALUES (?1, ?2)",
        rusqlite::params![name, color],
    )
    .map_err(|e| format!("Insert error: {}", e))?;

    let id = conn.last_insert_rowid();
    let mut stmt = conn
        .prepare("SELECT id, name, color, archived, created_at FROM projects WHERE id = ?1")
        .map_err(|e| format!("Query error: {}", e))?;

    stmt.query_row(rusqlite::params![id], row_to_project)
        .map_err(|e| format!("Fetch error: {}", e))
}

fn update_project_inner(
    conn: &Connection,
    id: i64,
    name: Option<String>,
    color: Option<String>,
) -> Result<Project, String> {
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

    stmt.query_row(rusqlite::params![id], row_to_project)
        .map_err(|_| format!("Project {} not found", id))
}

fn delete_project_inner(conn: &Connection, id: i64) -> Result<(), String> {
    conn.execute("DELETE FROM projects WHERE id = ?1", rusqlite::params![id])
        .map_err(|e| format!("Delete error: {}", e))?;
    Ok(())
}

fn archive_project_inner(conn: &Connection, id: i64) -> Result<(), String> {
    let affected = conn
        .execute(
            "UPDATE projects SET archived = 1 WHERE id = ?1",
            rusqlite::params![id],
        )
        .map_err(|e| format!("Update error: {}", e))?;

    if affected == 0 {
        return Err(format!("Project {} not found", id));
    }
    Ok(())
}

// ─── Tauri commands ──────────────────────────────────────────────

#[tauri::command]
pub fn get_projects(db: State<'_, DbPool>) -> Result<Vec<Project>, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    get_projects_inner(&conn)
}

#[tauri::command]
pub fn create_project(
    db: State<'_, DbPool>,
    name: String,
    color: Option<String>,
) -> Result<Project, String> {
    let color = color.unwrap_or_else(|| "#8b5cf6".to_string());
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    create_project_inner(&conn, name, color)
}

#[tauri::command]
pub fn update_project(
    db: State<'_, DbPool>,
    id: i64,
    name: Option<String>,
    color: Option<String>,
) -> Result<Project, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    update_project_inner(&conn, id, name, color)
}

#[tauri::command]
pub fn delete_project(db: State<'_, DbPool>, id: i64) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    delete_project_inner(&conn, id)
}

#[tauri::command]
pub fn archive_project(db: State<'_, DbPool>, id: i64) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    archive_project_inner(&conn, id)
}

// ─── Tests ───────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database::migrations::CREATE_TABLES;

    fn setup() -> Connection {
        let conn = Connection::open_in_memory().expect("in-memory DB");
        conn.execute_batch("PRAGMA foreign_keys = ON;").unwrap();
        conn.execute_batch(CREATE_TABLES).unwrap();
        conn
    }

    fn insert_project(conn: &Connection, name: &str) -> i64 {
        create_project_inner(conn, name.to_string(), "#8b5cf6".to_string())
            .expect("insert_project failed")
            .id
    }

    fn insert_project_with_color(conn: &Connection, name: &str, color: &str) -> i64 {
        create_project_inner(conn, name.to_string(), color.to_string())
            .expect("insert_project_with_color failed")
            .id
    }

    fn insert_session_for_project(conn: &Connection, project_id: i64) -> i64 {
        conn.execute(
            "INSERT INTO sessions (type, project_id, timer_mode, status, duration_seconds, started_at, notes)
             VALUES ('WORK', ?1, 'PROGRESSIVE', 'COMPLETED', 3600, '2024-01-01T09:00:00', '')",
            rusqlite::params![project_id],
        )
        .unwrap();
        conn.last_insert_rowid()
    }

    // ─── RF-P01 — Criar projeto ──────────────────────────────────

    #[test]
    fn tc_p01_a01_duplicate_name_rejected() {
        let conn = setup();
        insert_project(&conn, "Backend");
        let result = create_project_inner(&conn, "Backend".to_string(), "#8b5cf6".to_string());
        assert!(result.is_err(), "Expected Err for duplicate name");
    }

    #[test]
    fn tc_p01_a02_empty_name_rejected() {
        let conn = setup();
        let result = create_project_inner(&conn, "".to_string(), "#8b5cf6".to_string());
        assert!(result.is_err(), "Expected Err for empty name");
    }

    #[test]
    fn tc_p01_a03_default_color_applied() {
        let conn = setup();
        let id = insert_project(&conn, "Mobile");
        let projects = get_projects_inner(&conn).unwrap();
        let p = projects.iter().find(|p| p.id == id).unwrap();
        assert_eq!(p.color, "#8b5cf6");
    }

    #[test]
    fn tc_p01_a04_custom_color_preserved() {
        let conn = setup();
        let id = insert_project_with_color(&conn, "Design", "#ff0000");
        let projects = get_projects_inner(&conn).unwrap();
        let p = projects.iter().find(|p| p.id == id).unwrap();
        assert_eq!(p.color, "#ff0000");
    }

    #[test]
    fn tc_p01_b01_insert_returns_valid_entity() {
        let conn = setup();
        let project =
            create_project_inner(&conn, "Mobile".to_string(), "#8b5cf6".to_string()).unwrap();
        assert!(project.id > 0);
        assert_eq!(project.name, "Mobile");
        assert_eq!(project.color, "#8b5cf6");
        assert!(!project.archived);
        assert!(!project.created_at.is_empty());
    }

    #[test]
    fn tc_p01_b02_archived_defaults_to_false() {
        let conn = setup();
        let project =
            create_project_inner(&conn, "Alpha".to_string(), "#8b5cf6".to_string()).unwrap();
        assert!(!project.archived);
    }

    #[test]
    fn tc_p01_b03_ids_unique_and_increasing() {
        let conn = setup();
        let id1 = insert_project(&conn, "P1");
        let id2 = insert_project(&conn, "P2");
        let id3 = insert_project(&conn, "P3");
        assert!(id1 < id2 && id2 < id3);
    }

    // ─── RF-P02 — Editar projeto ─────────────────────────────────

    #[test]
    fn tc_p02_01_update_name() {
        let conn = setup();
        let id = insert_project(&conn, "Old Name");
        let updated =
            update_project_inner(&conn, id, Some("New Name".to_string()), None).unwrap();
        assert_eq!(updated.name, "New Name");
        assert_eq!(updated.color, "#8b5cf6");
    }

    #[test]
    fn tc_p02_02_update_color() {
        let conn = setup();
        let id = insert_project_with_color(&conn, "Frontend", "#8b5cf6");
        let updated =
            update_project_inner(&conn, id, None, Some("#00ff00".to_string())).unwrap();
        assert_eq!(updated.color, "#00ff00");
        assert_eq!(updated.name, "Frontend");
    }

    #[test]
    fn tc_p02_03_update_name_and_color() {
        let conn = setup();
        let id = insert_project(&conn, "Old");
        let updated = update_project_inner(
            &conn,
            id,
            Some("New".to_string()),
            Some("#111111".to_string()),
        )
        .unwrap();
        assert_eq!(updated.name, "New");
        assert_eq!(updated.color, "#111111");
    }

    #[test]
    fn tc_p02_04_duplicate_name_on_edit_rejected() {
        let conn = setup();
        insert_project(&conn, "Alpha");
        let beta_id = insert_project(&conn, "Beta");
        let result = update_project_inner(&conn, beta_id, Some("Alpha".to_string()), None);
        assert!(result.is_err(), "Expected Err for duplicate name on edit");
    }

    #[test]
    fn tc_p02_05_nonexistent_id_returns_err() {
        let conn = setup();
        let result = update_project_inner(&conn, 9999, Some("X".to_string()), None);
        assert!(result.is_err(), "Expected Err for non-existent project");
    }

    #[test]
    fn tc_p02_06_no_fields_does_not_alter_project() {
        let conn = setup();
        let id = insert_project_with_color(&conn, "Stable", "#aabbcc");
        let unchanged = update_project_inner(&conn, id, None, None).unwrap();
        assert_eq!(unchanged.name, "Stable");
        assert_eq!(unchanged.color, "#aabbcc");
    }

    // ─── RF-P03 — Arquivar / Excluir projeto ─────────────────────

    #[test]
    fn tc_p03_a01_delete_project_succeeds() {
        let conn = setup();
        let id = insert_project(&conn, "ToDelete");
        delete_project_inner(&conn, id).unwrap();
        let count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM projects WHERE id = ?1",
                rusqlite::params![id],
                |r| r.get(0),
            )
            .unwrap();
        assert_eq!(count, 0);
    }

    #[test]
    fn tc_p03_a02_sessions_project_id_set_null_after_delete() {
        let conn = setup();
        let pid = insert_project(&conn, "ToDelete");
        let sid = insert_session_for_project(&conn, pid);
        delete_project_inner(&conn, pid).unwrap();
        let project_id: Option<i64> = conn
            .query_row(
                "SELECT project_id FROM sessions WHERE id = ?1",
                rusqlite::params![sid],
                |r| r.get(0),
            )
            .unwrap();
        assert!(
            project_id.is_none(),
            "Expected project_id to be NULL after project deletion"
        );
    }

    #[test]
    fn tc_p03_a03_delete_does_not_affect_other_projects() {
        let conn = setup();
        let id1 = insert_project(&conn, "First");
        let id2 = insert_project(&conn, "Second");
        delete_project_inner(&conn, id1).unwrap();
        let count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM projects WHERE id = ?1",
                rusqlite::params![id2],
                |r| r.get(0),
            )
            .unwrap();
        assert_eq!(count, 1, "Second project should still exist");
    }

    #[test]
    fn tc_p03_a04_delete_nonexistent_returns_ok() {
        let conn = setup();
        let result = delete_project_inner(&conn, 9999);
        assert!(
            result.is_ok(),
            "Expected Ok(()) for non-existent project delete"
        );
    }

    #[test]
    fn tc_p03_b01_archive_sets_archived_to_one() {
        let conn = setup();
        let id = insert_project(&conn, "ToArchive");
        archive_project_inner(&conn, id).unwrap();
        let archived: i64 = conn
            .query_row(
                "SELECT archived FROM projects WHERE id = ?1",
                rusqlite::params![id],
                |r| r.get(0),
            )
            .unwrap();
        assert_eq!(archived, 1);
    }

    #[test]
    fn tc_p03_b02_archived_project_not_in_list() {
        let conn = setup();
        let id1 = insert_project(&conn, "Archived");
        insert_project(&conn, "Active");
        archive_project_inner(&conn, id1).unwrap();
        let projects = get_projects_inner(&conn).unwrap();
        assert_eq!(projects.len(), 1);
        assert_eq!(projects[0].name, "Active");
    }

    #[test]
    fn tc_p03_b03_archive_nonexistent_returns_err() {
        let conn = setup();
        let result = archive_project_inner(&conn, 9999);
        assert!(
            result.is_err(),
            "Expected Err for non-existent project archive"
        );
    }

    // ─── RF-P04 — Listar projetos ────────────────────────────────

    #[test]
    fn tc_p04_01_empty_list_when_no_projects() {
        let conn = setup();
        let projects = get_projects_inner(&conn).unwrap();
        assert!(projects.is_empty());
    }

    #[test]
    fn tc_p04_02_list_excludes_archived_projects() {
        let conn = setup();
        insert_project(&conn, "A");
        insert_project(&conn, "B");
        let id3 = insert_project(&conn, "C");
        conn.execute(
            "UPDATE projects SET archived = 1 WHERE id = ?1",
            rusqlite::params![id3],
        )
        .unwrap();
        let projects = get_projects_inner(&conn).unwrap();
        assert_eq!(projects.len(), 2);
    }

    #[test]
    fn tc_p04_03_list_ordered_by_name_asc() {
        let conn = setup();
        insert_project(&conn, "Zebra");
        insert_project(&conn, "Alpha");
        insert_project(&conn, "Mango");
        let projects = get_projects_inner(&conn).unwrap();
        let names: Vec<&str> = projects.iter().map(|p| p.name.as_str()).collect();
        assert_eq!(names, vec!["Alpha", "Mango", "Zebra"]);
    }

    #[test]
    fn tc_p04_04_all_fields_returned_correctly() {
        let conn = setup();
        let id = insert_project_with_color(&conn, "Design", "#ff5500");
        let projects = get_projects_inner(&conn).unwrap();
        let p = projects.iter().find(|p| p.id == id).unwrap();
        assert!(p.id > 0);
        assert_eq!(p.name, "Design");
        assert_eq!(p.color, "#ff5500");
        assert!(!p.archived);
        assert!(!p.created_at.is_empty());
    }
}
