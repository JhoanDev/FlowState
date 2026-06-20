use rusqlite::Connection;
use tauri::State;

use crate::database::DbPool;
use crate::models::Tag;

fn get_tags_inner(conn: &Connection) -> Result<Vec<Tag>, String> {
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

fn create_tag_inner(conn: &Connection, name: String, color: Option<String>) -> Result<Tag, String> {
    if name.trim().is_empty() {
        return Err("Tag name cannot be empty".to_string());
    }

    let color = color.unwrap_or_else(|| "#a78bfa".to_string());

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

fn update_tag_inner(
    conn: &Connection,
    id: i64,
    name: Option<String>,
    color: Option<String>,
) -> Result<Tag, String> {
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

fn delete_tag_inner(conn: &Connection, id: i64) -> Result<(), String> {
    conn.execute("DELETE FROM tags WHERE id = ?1", rusqlite::params![id])
        .map_err(|e| format!("Delete error: {}", e))?;
    Ok(())
}

#[tauri::command]
pub fn get_tags(db: State<'_, DbPool>) -> Result<Vec<Tag>, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    get_tags_inner(&conn)
}

#[tauri::command]
pub fn create_tag(
    db: State<'_, DbPool>,
    name: String,
    color: Option<String>,
) -> Result<Tag, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    create_tag_inner(&conn, name, color)
}

#[tauri::command]
pub fn update_tag(
    db: State<'_, DbPool>,
    id: i64,
    name: Option<String>,
    color: Option<String>,
) -> Result<Tag, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    update_tag_inner(&conn, id, name, color)
}

#[tauri::command]
pub fn delete_tag(db: State<'_, DbPool>, id: i64) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    delete_tag_inner(&conn, id)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database::migrations;
    use rusqlite::Connection;

    fn setup() -> Connection {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch("PRAGMA foreign_keys=ON;").unwrap();
        conn.execute_batch(migrations::CREATE_TABLES).unwrap();
        conn
    }

    fn insert_tag(conn: &Connection, name: &str) -> i64 {
        conn.execute(
            "INSERT INTO tags (name) VALUES (?1)",
            rusqlite::params![name],
        )
        .unwrap();
        conn.last_insert_rowid()
    }

    fn insert_tag_with_color(conn: &Connection, name: &str, color: &str) -> i64 {
        conn.execute(
            "INSERT INTO tags (name, color) VALUES (?1, ?2)",
            rusqlite::params![name, color],
        )
        .unwrap();
        conn.last_insert_rowid()
    }

    fn insert_session_with_tag(conn: &Connection, tag_id: i64) {
        conn.execute(
            "INSERT INTO sessions (type, timer_mode, status, duration_seconds, started_at)
             VALUES ('STUDY', 'PROGRESSIVE', 'COMPLETED', 0, '2024-01-01T10:00:00')",
            [],
        )
        .unwrap();
        let session_id = conn.last_insert_rowid();
        conn.execute(
            "INSERT INTO session_tags (session_id, tag_id) VALUES (?1, ?2)",
            rusqlite::params![session_id, tag_id],
        )
        .unwrap();
    }

    fn insert_goal_with_tag(conn: &Connection, tag_id: i64) -> i64 {
        conn.execute(
            "INSERT INTO weekly_goals (type, label, target_hours, tag_id, week_start)
             VALUES ('STUDY', 'Test Goal', 5, ?1, '2024-01-01')",
            rusqlite::params![tag_id],
        )
        .unwrap();
        conn.last_insert_rowid()
    }

    // RF-T01 — Grupo A: Regras de negócio

    #[test]
    fn tc_t01_a01_duplicate_name_returns_err() {
        let conn = setup();
        insert_tag(&conn, "Rust");
        let result = create_tag_inner(&conn, "Rust".into(), None);
        assert!(result.is_err());
    }

    #[test]
    fn tc_t01_a02_empty_name_returns_err() {
        let conn = setup();
        let result = create_tag_inner(&conn, "".into(), None);
        assert!(result.is_err());
    }

    #[test]
    fn tc_t01_a03_omitted_color_gets_default() {
        let conn = setup();
        let tag = create_tag_inner(&conn, "Rust".into(), None).unwrap();
        assert_eq!(tag.color, "#a78bfa");
    }

    #[test]
    fn tc_t01_a04_custom_color_is_preserved() {
        let conn = setup();
        let tag = create_tag_inner(&conn, "Rust".into(), Some("#22c55e".into())).unwrap();
        assert_eq!(tag.color, "#22c55e");
    }

    // RF-T01 — Grupo B: Constraints de schema

    #[test]
    fn tc_t01_b01_insert_returns_valid_entity() {
        let conn = setup();
        let tag = create_tag_inner(&conn, "Next.js".into(), None).unwrap();
        assert!(tag.id > 0);
        assert_eq!(tag.name, "Next.js");
        assert_eq!(tag.color, "#a78bfa");
        assert!(!tag.created_at.is_empty());
    }

    #[test]
    fn tc_t01_b02_sequential_ids_are_unique_and_ascending() {
        let conn = setup();
        let t1 = create_tag_inner(&conn, "Alpha".into(), None).unwrap();
        let t2 = create_tag_inner(&conn, "Beta".into(), None).unwrap();
        let t3 = create_tag_inner(&conn, "Gamma".into(), None).unwrap();
        assert!(t1.id < t2.id && t2.id < t3.id);
    }

    // RF-T02 — Grupo A: Editar

    #[test]
    fn tc_t02_a01_update_name_succeeds() {
        let conn = setup();
        let id = insert_tag(&conn, "Old Name");
        let tag = update_tag_inner(&conn, id, Some("New Name".into()), None).unwrap();
        assert_eq!(tag.name, "New Name");
        assert_eq!(tag.color, "#a78bfa");
    }

    #[test]
    fn tc_t02_a02_update_color_succeeds() {
        let conn = setup();
        let id = insert_tag_with_color(&conn, "My Tag", "#a78bfa");
        let tag = update_tag_inner(&conn, id, None, Some("#ef4444".into())).unwrap();
        assert_eq!(tag.color, "#ef4444");
        assert_eq!(tag.name, "My Tag");
    }

    #[test]
    fn tc_t02_a03_update_name_and_color_simultaneously() {
        let conn = setup();
        let id = insert_tag(&conn, "Old Tag");
        let tag =
            update_tag_inner(&conn, id, Some("Algorithms".into()), Some("#f59e0b".into())).unwrap();
        assert_eq!(tag.name, "Algorithms");
        assert_eq!(tag.color, "#f59e0b");
    }

    #[test]
    fn tc_t02_a04_duplicate_name_on_update_returns_err() {
        let conn = setup();
        insert_tag(&conn, "Python");
        let id2 = insert_tag(&conn, "Java");
        let result = update_tag_inner(&conn, id2, Some("Python".into()), None);
        assert!(result.is_err());
    }

    #[test]
    fn tc_t02_a05_nonexistent_id_returns_err() {
        let conn = setup();
        let result = update_tag_inner(&conn, 9999, Some("Anything".into()), None);
        assert!(result.is_err());
    }

    #[test]
    fn tc_t02_a06_no_fields_does_not_alter_tag() {
        let conn = setup();
        let id = insert_tag_with_color(&conn, "Stable", "#3b82f6");
        let tag = update_tag_inner(&conn, id, None, None).unwrap();
        assert_eq!(tag.name, "Stable");
        assert_eq!(tag.color, "#3b82f6");
    }

    // RF-T02 — Grupo B: Excluir

    #[test]
    fn tc_t02_b01_existing_tag_is_deleted() {
        let conn = setup();
        let id = insert_tag(&conn, "ToDelete");
        delete_tag_inner(&conn, id).unwrap();
        let count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM tags WHERE id = ?1",
                rusqlite::params![id],
                |r| r.get(0),
            )
            .unwrap();
        assert_eq!(count, 0);
    }

    #[test]
    fn tc_t02_b02_session_tags_removed_in_cascade() {
        let conn = setup();
        let tag_id = insert_tag(&conn, "MyTag");
        insert_session_with_tag(&conn, tag_id);
        delete_tag_inner(&conn, tag_id).unwrap();
        let count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM session_tags WHERE tag_id = ?1",
                rusqlite::params![tag_id],
                |r| r.get(0),
            )
            .unwrap();
        assert_eq!(count, 0);
    }

    #[test]
    fn tc_t02_b03_session_not_deleted_with_tag() {
        let conn = setup();
        let tag_id = insert_tag(&conn, "MyTag");
        insert_session_with_tag(&conn, tag_id);
        delete_tag_inner(&conn, tag_id).unwrap();
        let count: i64 = conn
            .query_row("SELECT COUNT(*) FROM sessions", [], |r| r.get(0))
            .unwrap();
        assert_eq!(count, 1);
    }

    #[test]
    fn tc_t02_b04_delete_nonexistent_tag_returns_ok() {
        let conn = setup();
        let result = delete_tag_inner(&conn, 9999);
        assert!(result.is_ok());
    }

    #[test]
    fn tc_t02_b05_delete_does_not_affect_other_tags() {
        let conn = setup();
        let id1 = insert_tag(&conn, "First");
        let id2 = insert_tag(&conn, "Second");
        delete_tag_inner(&conn, id1).unwrap();
        let count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM tags WHERE id = ?1",
                rusqlite::params![id2],
                |r| r.get(0),
            )
            .unwrap();
        assert_eq!(count, 1);
    }

    #[test]
    fn tc_t02_b06_weekly_goal_tag_id_set_null_on_delete() {
        let conn = setup();
        let tag_id = insert_tag(&conn, "MyGoalTag");
        let goal_id = insert_goal_with_tag(&conn, tag_id);
        delete_tag_inner(&conn, tag_id).unwrap();
        let stored_tag_id: Option<i64> = conn
            .query_row(
                "SELECT tag_id FROM weekly_goals WHERE id = ?1",
                rusqlite::params![goal_id],
                |r| r.get(0),
            )
            .unwrap();
        assert!(stored_tag_id.is_none());
    }

    // RF-T03 — Listar tags

    #[test]
    fn tc_t03_01_empty_list_when_no_tags() {
        let conn = setup();
        let tags = get_tags_inner(&conn).unwrap();
        assert!(tags.is_empty());
    }

    #[test]
    fn tc_t03_02_list_returns_all_tags_without_filter() {
        let conn = setup();
        insert_tag(&conn, "A");
        insert_tag(&conn, "B");
        insert_tag(&conn, "C");
        insert_tag(&conn, "D");
        let tags = get_tags_inner(&conn).unwrap();
        assert_eq!(tags.len(), 4);
    }

    #[test]
    fn tc_t03_03_list_ordered_by_name_asc() {
        let conn = setup();
        insert_tag(&conn, "Zebra");
        insert_tag(&conn, "Alpha");
        insert_tag(&conn, "Mango");
        let tags = get_tags_inner(&conn).unwrap();
        assert_eq!(tags[0].name, "Alpha");
        assert_eq!(tags[1].name, "Mango");
        assert_eq!(tags[2].name, "Zebra");
    }

    #[test]
    fn tc_t03_04_all_fields_returned_correctly() {
        let conn = setup();
        let id = insert_tag_with_color(&conn, "Docker", "#0ea5e9");
        let tags = get_tags_inner(&conn).unwrap();
        let tag = tags.iter().find(|t| t.id == id).unwrap();
        assert!(tag.id > 0);
        assert_eq!(tag.name, "Docker");
        assert_eq!(tag.color, "#0ea5e9");
        assert!(!tag.created_at.is_empty());
    }
}
