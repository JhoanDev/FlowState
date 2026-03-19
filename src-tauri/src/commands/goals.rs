use chrono::Datelike;
use tauri::State;

use crate::database::DbPool;
use crate::models::{GoalProgress, WeeklyGoal, WeeklyGoalGroup, WeeklyGoalSummary};

/// Computes current_hours for a goal by querying sessions in its week range.
fn compute_current_hours(
    conn: &rusqlite::Connection,
    goal_type: &str,
    project_id: Option<i64>,
    tag_id: Option<i64>,
    week_start: &str,
) -> Result<f64, String> {
    // WORK goals filter by project_id, STUDY goals filter by tag_id via session_tags
    if goal_type == "WORK" && project_id.is_some() {
        let mut stmt = conn
            .prepare(
                "SELECT COALESCE(SUM(duration_seconds) / 3600.0, 0)
                 FROM sessions
                 WHERE status = 'COMPLETED'
                   AND type = 'WORK'
                   AND project_id = ?1
                   AND DATE(started_at) >= ?2
                   AND DATE(started_at) < DATE(?2, '+7 days')",
            )
            .map_err(|e| format!("Query error: {}", e))?;
        let hours: f64 = stmt
            .query_row(rusqlite::params![project_id.unwrap(), week_start], |row| {
                row.get(0)
            })
            .map_err(|e| format!("Query error: {}", e))?;
        return Ok((hours * 10.0).round() / 10.0);
    }

    if goal_type == "STUDY" && tag_id.is_some() {
        let mut stmt = conn
            .prepare(
                "SELECT COALESCE(SUM(s.duration_seconds) / 3600.0, 0)
                 FROM sessions s
                 INNER JOIN session_tags st ON st.session_id = s.id
                 WHERE s.status = 'COMPLETED'
                   AND s.type = 'STUDY'
                   AND st.tag_id = ?1
                   AND DATE(s.started_at) >= ?2
                   AND DATE(s.started_at) < DATE(?2, '+7 days')",
            )
            .map_err(|e| format!("Query error: {}", e))?;
        let hours: f64 = stmt
            .query_row(rusqlite::params![tag_id.unwrap(), week_start], |row| {
                row.get(0)
            })
            .map_err(|e| format!("Query error: {}", e))?;
        return Ok((hours * 10.0).round() / 10.0);
    }

    // General goal: all sessions of that type in the week
    let mut stmt = conn
        .prepare(
            "SELECT COALESCE(SUM(duration_seconds) / 3600.0, 0)
             FROM sessions
             WHERE status = 'COMPLETED'
               AND type = ?1
               AND DATE(started_at) >= ?2
               AND DATE(started_at) < DATE(?2, '+7 days')",
        )
        .map_err(|e| format!("Query error: {}", e))?;
    let hours: f64 = stmt
        .query_row(rusqlite::params![goal_type, week_start], |row| row.get(0))
        .map_err(|e| format!("Query error: {}", e))?;
    Ok((hours * 10.0).round() / 10.0)
}

fn resolve_label(
    conn: &rusqlite::Connection,
    goal_type: &str,
    project_id: Option<i64>,
    tag_id: Option<i64>,
) -> String {
    if goal_type == "WORK" {
        if let Some(pid) = project_id {
            if let Ok(name) = conn.query_row(
                "SELECT name FROM projects WHERE id = ?1",
                rusqlite::params![pid],
                |row| row.get::<_, String>(0),
            ) {
                return name;
            }
        }
    }
    if goal_type == "STUDY" {
        if let Some(tid) = tag_id {
            if let Ok(name) = conn.query_row(
                "SELECT name FROM tags WHERE id = ?1",
                rusqlite::params![tid],
                |row| row.get::<_, String>(0),
            ) {
                return name;
            }
        }
    }
    "General".to_string()
}

fn hydrate_goal(conn: &rusqlite::Connection, row: &rusqlite::Row) -> rusqlite::Result<WeeklyGoal> {
    let id: i64 = row.get(0)?;
    let goal_type: String = row.get(1)?;
    let label: String = row.get(2)?;
    let target_hours: f64 = row.get(3)?;
    let project_id: Option<i64> = row.get(4)?;
    let tag_id: Option<i64> = row.get(5)?;
    let week_start: String = row.get(6)?;
    let created_at: String = row.get(7)?;

    let resolved_label = if label.is_empty() {
        resolve_label(conn, &goal_type, project_id, tag_id)
    } else {
        label
    };

    let current_hours =
        compute_current_hours(conn, &goal_type, project_id, tag_id, &week_start).unwrap_or(0.0);

    Ok(WeeklyGoal {
        id,
        goal_type,
        label: resolved_label,
        target_hours,
        project_id,
        tag_id,
        current_hours,
        week_start,
        created_at,
    })
}

fn get_current_week_start() -> String {
    let now = chrono::Utc::now().date_naive();
    let weekday = now.weekday().num_days_from_monday();
    let monday = now - chrono::Duration::days(weekday as i64);
    monday.format("%Y-%m-%d").to_string()
}

#[tauri::command]
pub fn get_weekly_goals(
    db: State<'_, DbPool>,
    week_start: Option<String>,
) -> Result<Vec<WeeklyGoal>, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    let target_week = week_start.unwrap_or_else(get_current_week_start);

    let mut stmt = conn
        .prepare(
            "SELECT id, type, label, target_hours, project_id, tag_id, week_start, created_at
             FROM weekly_goals
             WHERE week_start = ?1
             ORDER BY id ASC",
        )
        .map_err(|e| format!("Query error: {}", e))?;

    let rows = stmt
        .query_map(rusqlite::params![target_week], |row| {
            hydrate_goal(&conn, row)
        })
        .map_err(|e| format!("Query error: {}", e))?;

    let mut goals = Vec::new();
    for row in rows {
        goals.push(row.map_err(|e| format!("Row error: {}", e))?);
    }
    Ok(goals)
}

#[tauri::command]
pub fn create_weekly_goal(
    db: State<'_, DbPool>,
    #[allow(non_snake_case)] r#type: String,
    target_hours: f64,
    project_id: Option<i64>,
    tag_id: Option<i64>,
) -> Result<WeeklyGoal, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    let week_start = get_current_week_start();
    let label = resolve_label(&conn, &r#type, project_id, tag_id);

    conn.execute(
        "INSERT INTO weekly_goals (type, label, target_hours, project_id, tag_id, week_start)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        rusqlite::params![r#type, label, target_hours, project_id, tag_id, week_start],
    )
    .map_err(|e| format!("Insert error: {}", e))?;

    let id = conn.last_insert_rowid();
    let current_hours =
        compute_current_hours(&conn, &r#type, project_id, tag_id, &week_start).unwrap_or(0.0);

    let mut stmt = conn
        .prepare(
            "SELECT id, type, label, target_hours, project_id, tag_id, week_start, created_at
             FROM weekly_goals WHERE id = ?1",
        )
        .map_err(|e| format!("Query error: {}", e))?;

    let mut goal = stmt
        .query_row(rusqlite::params![id], |row| {
            Ok(WeeklyGoal {
                id: row.get(0)?,
                goal_type: row.get(1)?,
                label: row.get(2)?,
                target_hours: row.get(3)?,
                project_id: row.get(4)?,
                tag_id: row.get(5)?,
                current_hours: 0.0,
                week_start: row.get(6)?,
                created_at: row.get(7)?,
            })
        })
        .map_err(|e| format!("Fetch error: {}", e))?;

    goal.current_hours = current_hours;
    Ok(goal)
}

#[tauri::command]
pub fn update_weekly_goal(
    db: State<'_, DbPool>,
    id: i64,
    target_hours: Option<f64>,
) -> Result<WeeklyGoal, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;

    if let Some(th) = target_hours {
        conn.execute(
            "UPDATE weekly_goals SET target_hours = ?1 WHERE id = ?2",
            rusqlite::params![th, id],
        )
        .map_err(|e| format!("Update error: {}", e))?;
    }

    let mut stmt = conn
        .prepare(
            "SELECT id, type, label, target_hours, project_id, tag_id, week_start, created_at
             FROM weekly_goals WHERE id = ?1",
        )
        .map_err(|e| format!("Query error: {}", e))?;

    stmt.query_row(rusqlite::params![id], |row| hydrate_goal(&conn, row))
        .map_err(|_| format!("WeeklyGoal {} not found", id))
}

#[tauri::command]
pub fn delete_weekly_goal(db: State<'_, DbPool>, id: i64) -> Result<bool, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    let affected = conn
        .execute("DELETE FROM weekly_goals WHERE id = ?1", rusqlite::params![id])
        .map_err(|e| format!("Delete error: {}", e))?;
    Ok(affected > 0)
}

#[tauri::command]
pub fn get_goal_progress(
    db: State<'_, DbPool>,
    goal_id: i64,
) -> Result<GoalProgress, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;

    let (goal_type, project_id, tag_id, week_start, target_hours): (
        String,
        Option<i64>,
        Option<i64>,
        String,
        f64,
    ) = conn
        .query_row(
            "SELECT type, project_id, tag_id, week_start, target_hours FROM weekly_goals WHERE id = ?1",
            rusqlite::params![goal_id],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?, row.get(4)?)),
        )
        .map_err(|_| format!("WeeklyGoal {} not found", goal_id))?;

    let current_hours =
        compute_current_hours(&conn, &goal_type, project_id, tag_id, &week_start)?;
    let percentage = if target_hours > 0.0 {
        ((current_hours / target_hours) * 100.0).round() as i64
    } else {
        0
    };

    Ok(GoalProgress {
        current_hours,
        percentage,
    })
}

#[tauri::command]
pub fn get_goals_summary(db: State<'_, DbPool>) -> Result<WeeklyGoalSummary, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    let current_week = get_current_week_start();

    let mut stmt = conn
        .prepare(
            "SELECT id, type, label, target_hours, project_id, tag_id, week_start, created_at
             FROM weekly_goals
             WHERE week_start < ?1",
        )
        .map_err(|e| format!("Query error: {}", e))?;

    let rows = stmt
        .query_map(rusqlite::params![current_week], |row| {
            hydrate_goal(&conn, row)
        })
        .map_err(|e| format!("Query error: {}", e))?;

    let mut goals = Vec::new();
    for row in rows {
        goals.push(row.map_err(|e| format!("Row error: {}", e))?);
    }

    let total_created = goals.len() as i64;
    let total_met = goals
        .iter()
        .filter(|g| g.current_hours >= g.target_hours)
        .count() as i64;

    let week_starts: std::collections::HashSet<&str> =
        goals.iter().map(|g| g.week_start.as_str()).collect();
    let total_hours: f64 = goals.iter().map(|g| g.current_hours).sum();
    let avg_hours_per_week = if !week_starts.is_empty() {
        ((total_hours / week_starts.len() as f64) * 10.0).round() / 10.0
    } else {
        0.0
    };

    Ok(WeeklyGoalSummary {
        total_created,
        total_met,
        avg_hours_per_week,
    })
}

#[tauri::command]
pub fn get_goals_history(db: State<'_, DbPool>) -> Result<Vec<WeeklyGoalGroup>, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;

    let mut stmt = conn
        .prepare(
            "SELECT id, type, label, target_hours, project_id, tag_id, week_start, created_at
             FROM weekly_goals
             ORDER BY week_start DESC, id ASC",
        )
        .map_err(|e| format!("Query error: {}", e))?;

    let rows = stmt
        .query_map([], |row| hydrate_goal(&conn, row))
        .map_err(|e| format!("Query error: {}", e))?;

    let mut by_week: std::collections::BTreeMap<String, Vec<WeeklyGoal>> =
        std::collections::BTreeMap::new();
    for row in rows {
        let goal = row.map_err(|e| format!("Row error: {}", e))?;
        by_week
            .entry(goal.week_start.clone())
            .or_default()
            .push(goal);
    }

    let groups: Vec<WeeklyGoalGroup> = by_week
        .into_iter()
        .rev()
        .map(|(week_start, goals)| WeeklyGoalGroup { week_start, goals })
        .collect();

    Ok(groups)
}

// ─── Public helpers for cross-module access (used by stats.rs) ──

pub fn get_current_week_start_pub() -> String {
    get_current_week_start()
}

pub fn compute_current_hours_pub(
    conn: &rusqlite::Connection,
    goal_type: &str,
    project_id: Option<i64>,
    tag_id: Option<i64>,
    week_start: &str,
) -> Result<f64, String> {
    compute_current_hours(conn, goal_type, project_id, tag_id, week_start)
}
