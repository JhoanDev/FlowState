use tauri::State;

use crate::database::DbPool;
use crate::models::{
    CalendarDay, ConsistencyDay, DashboardStats, DistributionChart, DistributionSlice, HeatmapDay,
    StreakInfo, TopRatedItem,
};

// ─── Streak Helpers ─────────────────────────────────────────────

fn compute_streak(conn: &rusqlite::Connection) -> Result<StreakInfo, String> {
    // Get all distinct active dates (descending)
    let mut stmt = conn
        .prepare(
            "SELECT DISTINCT DATE(started_at) AS d
             FROM sessions
             WHERE status = 'COMPLETED'
             ORDER BY d DESC",
        )
        .map_err(|e| format!("Query error: {}", e))?;

    let dates: Vec<String> = stmt
        .query_map([], |row| row.get(0))
        .map_err(|e| format!("Query error: {}", e))?
        .filter_map(|r| r.ok())
        .collect();

    if dates.is_empty() {
        return Ok(StreakInfo {
            current_streak: 0,
            best_streak: 0,
        });
    }

    let today = chrono::Utc::now().date_naive();
    let today_str = today.format("%Y-%m-%d").to_string();

    let date_set: std::collections::HashSet<&str> = dates.iter().map(|s| s.as_str()).collect();

    // Current streak
    let mut current_streak = 0i64;
    let check_start = if date_set.contains(today_str.as_str()) {
        today
    } else {
        let yesterday = today - chrono::Duration::days(1);
        let yesterday_str = yesterday.format("%Y-%m-%d").to_string();
        if date_set.contains(yesterday_str.as_str()) {
            yesterday
        } else {
            return Ok(StreakInfo {
                current_streak: 0,
                best_streak: compute_best_streak(&dates),
            });
        }
    };

    let mut check_date = check_start;
    loop {
        let ds = check_date.format("%Y-%m-%d").to_string();
        if date_set.contains(ds.as_str()) {
            current_streak += 1;
            check_date -= chrono::Duration::days(1);
        } else {
            break;
        }
    }

    let best_streak = std::cmp::max(current_streak, compute_best_streak(&dates));

    Ok(StreakInfo {
        current_streak,
        best_streak,
    })
}

fn compute_best_streak(dates: &[String]) -> i64 {
    if dates.is_empty() {
        return 0;
    }

    let mut sorted: Vec<chrono::NaiveDate> = dates
        .iter()
        .filter_map(|d| chrono::NaiveDate::parse_from_str(d, "%Y-%m-%d").ok())
        .collect();
    sorted.sort();

    let mut best = 1i64;
    let mut current = 1i64;

    for i in 1..sorted.len() {
        let diff = (sorted[i] - sorted[i - 1]).num_days();
        if diff == 1 {
            current += 1;
            if current > best {
                best = current;
            }
        } else if diff > 1 {
            current = 1;
        }
    }

    best
}

// ─── Dashboard Stats ────────────────────────────────────────────

#[tauri::command]
pub fn get_dashboard_stats(db: State<'_, DbPool>) -> Result<DashboardStats, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;

    // Work hours (last 30 days)
    let work_hours: f64 = conn
        .query_row(
            "SELECT COALESCE(SUM(duration_seconds) / 3600.0, 0)
             FROM sessions
             WHERE status = 'COMPLETED' AND type = 'WORK'
               AND DATE(started_at) >= DATE('now', '-30 days')",
            [],
            |row| row.get(0),
        )
        .map_err(|e| format!("Query error: {}", e))?;

    // Work hours previous period (30-60 days ago)
    let work_prev: f64 = conn
        .query_row(
            "SELECT COALESCE(SUM(duration_seconds) / 3600.0, 0)
             FROM sessions
             WHERE status = 'COMPLETED' AND type = 'WORK'
               AND DATE(started_at) >= DATE('now', '-60 days')
               AND DATE(started_at) < DATE('now', '-30 days')",
            [],
            |row| row.get(0),
        )
        .map_err(|e| format!("Query error: {}", e))?;

    // Study hours (last 30 days)
    let study_hours: f64 = conn
        .query_row(
            "SELECT COALESCE(SUM(duration_seconds) / 3600.0, 0)
             FROM sessions
             WHERE status = 'COMPLETED' AND type = 'STUDY'
               AND DATE(started_at) >= DATE('now', '-30 days')",
            [],
            |row| row.get(0),
        )
        .map_err(|e| format!("Query error: {}", e))?;

    // Study hours previous period
    let study_prev: f64 = conn
        .query_row(
            "SELECT COALESCE(SUM(duration_seconds) / 3600.0, 0)
             FROM sessions
             WHERE status = 'COMPLETED' AND type = 'STUDY'
               AND DATE(started_at) >= DATE('now', '-60 days')
               AND DATE(started_at) < DATE('now', '-30 days')",
            [],
            |row| row.get(0),
        )
        .map_err(|e| format!("Query error: {}", e))?;

    let work_trend = if work_prev > 0.0 {
        ((work_hours - work_prev) / work_prev * 100.0).round()
    } else if work_hours > 0.0 {
        100.0
    } else {
        0.0
    };

    let study_trend = if study_prev > 0.0 {
        ((study_hours - study_prev) / study_prev * 100.0).round()
    } else if study_hours > 0.0 {
        100.0
    } else {
        0.0
    };

    let streak = compute_streak(&conn)?;

    // Goals met this week
    let week_start = crate::commands::goals::get_current_week_start_pub();
    let goals_total: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM weekly_goals WHERE week_start = ?1",
            rusqlite::params![week_start],
            |row| row.get(0),
        )
        .unwrap_or(0);

    // For goals_met, we need to check each goal's progress
    let mut goals_met = 0i64;
    if goals_total > 0 {
        let mut gstmt = conn
            .prepare(
                "SELECT type, project_id, tag_id, target_hours
                 FROM weekly_goals WHERE week_start = ?1",
            )
            .map_err(|e| format!("Query error: {}", e))?;

        let goal_rows = gstmt
            .query_map(rusqlite::params![week_start], |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, Option<i64>>(1)?,
                    row.get::<_, Option<i64>>(2)?,
                    row.get::<_, f64>(3)?,
                ))
            })
            .map_err(|e| format!("Query error: {}", e))?;

        for row in goal_rows {
            if let Ok((gtype, pid, tid, target)) = row {
                let current = crate::commands::goals::compute_current_hours_pub(
                    &conn,
                    &gtype,
                    pid,
                    tid,
                    &week_start,
                )
                .unwrap_or(0.0);
                if current >= target {
                    goals_met += 1;
                }
            }
        }
    }

    Ok(DashboardStats {
        work_hours: (work_hours * 10.0).round() / 10.0,
        work_trend,
        study_hours: (study_hours * 10.0).round() / 10.0,
        study_trend,
        current_streak: streak.current_streak,
        best_streak: streak.best_streak,
        goals_met,
        goals_total,
    })
}

// ─── Heatmap ────────────────────────────────────────────────────

#[tauri::command]
pub fn get_heatmap(db: State<'_, DbPool>) -> Result<Vec<HeatmapDay>, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;

    let mut stmt = conn
        .prepare(
            "SELECT DATE(started_at) AS date,
                    SUM(duration_seconds) AS total_seconds,
                    COUNT(*) AS session_count
             FROM sessions
             WHERE status = 'COMPLETED'
               AND started_at >= DATE('now', '-6 months')
             GROUP BY DATE(started_at)
             ORDER BY date",
        )
        .map_err(|e| format!("Query error: {}", e))?;

    let rows = stmt
        .query_map([], |row| {
            let total_seconds: i64 = row.get(1)?;
            let hours = total_seconds as f64 / 3600.0;
            let intensity = if hours < 1.0 {
                1
            } else if hours < 3.0 {
                2
            } else if hours < 5.0 {
                3
            } else {
                4
            };
            Ok(HeatmapDay {
                date: row.get(0)?,
                total_seconds,
                session_count: row.get(2)?,
                intensity,
            })
        })
        .map_err(|e| format!("Query error: {}", e))?;

    let mut days = Vec::new();
    for row in rows {
        days.push(row.map_err(|e| format!("Row error: {}", e))?);
    }
    Ok(days)
}

// ─── Distribution Charts ────────────────────────────────────────

#[tauri::command]
pub fn get_work_distribution(db: State<'_, DbPool>) -> Result<DistributionChart, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;

    let mut stmt = conn
        .prepare(
            "SELECT COALESCE(p.name, 'No Project') AS label,
                    COALESCE(p.color, '#6b7280') AS color,
                    SUM(s.duration_seconds) / 3600.0 AS hours
             FROM sessions s
             LEFT JOIN projects p ON s.project_id = p.id
             WHERE s.type = 'WORK' AND s.status = 'COMPLETED'
             GROUP BY s.project_id
             ORDER BY hours DESC",
        )
        .map_err(|e| format!("Query error: {}", e))?;

    let rows = stmt
        .query_map([], |row| {
            Ok(DistributionSlice {
                label: row.get(0)?,
                color: row.get(1)?,
                value: row.get(2)?,
                slice_type: "WORK".to_string(),
            })
        })
        .map_err(|e| format!("Query error: {}", e))?;

    let mut slices = Vec::new();
    let mut total = 0.0;
    for row in rows {
        let slice = row.map_err(|e| format!("Row error: {}", e))?;
        total += slice.value;
        slices.push(slice);
    }

    Ok(DistributionChart {
        title: "Work Distribution".to_string(),
        total: (total * 10.0).round() / 10.0,
        slices,
    })
}

#[tauri::command]
pub fn get_study_distribution(db: State<'_, DbPool>) -> Result<DistributionChart, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;

    let mut stmt = conn
        .prepare(
            "SELECT t.name AS label,
                    t.color AS color,
                    SUM(s.duration_seconds) / 3600.0 AS hours
             FROM sessions s
             INNER JOIN session_tags st ON st.session_id = s.id
             INNER JOIN tags t ON t.id = st.tag_id
             WHERE s.type = 'STUDY' AND s.status = 'COMPLETED'
             GROUP BY st.tag_id
             ORDER BY hours DESC",
        )
        .map_err(|e| format!("Query error: {}", e))?;

    let rows = stmt
        .query_map([], |row| {
            Ok(DistributionSlice {
                label: row.get(0)?,
                color: row.get(1)?,
                value: row.get(2)?,
                slice_type: "STUDY".to_string(),
            })
        })
        .map_err(|e| format!("Query error: {}", e))?;

    let mut slices = Vec::new();
    let mut total = 0.0;
    for row in rows {
        let slice = row.map_err(|e| format!("Row error: {}", e))?;
        total += slice.value;
        slices.push(slice);
    }

    Ok(DistributionChart {
        title: "Study Distribution".to_string(),
        total: (total * 10.0).round() / 10.0,
        slices,
    })
}

// ─── Top Rated ──────────────────────────────────────────────────

#[tauri::command]
pub fn get_top_rated_work(db: State<'_, DbPool>) -> Result<Vec<TopRatedItem>, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;

    let mut stmt = conn
        .prepare(
            "SELECT p.id, p.name, p.color,
                    AVG(s.rating) AS avg_rating,
                    COUNT(*) AS session_count
             FROM sessions s
             INNER JOIN projects p ON s.project_id = p.id
             WHERE s.type = 'WORK' AND s.status = 'COMPLETED' AND s.rating IS NOT NULL
             GROUP BY s.project_id
             HAVING session_count >= 1
             ORDER BY avg_rating DESC
             LIMIT 5",
        )
        .map_err(|e| format!("Query error: {}", e))?;

    let rows = stmt
        .query_map([], |row| {
            Ok(TopRatedItem {
                id: row.get(0)?,
                label: row.get(1)?,
                color: row.get(2)?,
                avg_rating: row.get(3)?,
                session_count: row.get(4)?,
            })
        })
        .map_err(|e| format!("Query error: {}", e))?;

    let mut items = Vec::new();
    for row in rows {
        items.push(row.map_err(|e| format!("Row error: {}", e))?);
    }
    Ok(items)
}

#[tauri::command]
pub fn get_top_rated_study(db: State<'_, DbPool>) -> Result<Vec<TopRatedItem>, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;

    let mut stmt = conn
        .prepare(
            "SELECT t.id, t.name, t.color,
                    AVG(s.rating) AS avg_rating,
                    COUNT(*) AS session_count
             FROM sessions s
             INNER JOIN session_tags st ON st.session_id = s.id
             INNER JOIN tags t ON t.id = st.tag_id
             WHERE s.type = 'STUDY' AND s.status = 'COMPLETED' AND s.rating IS NOT NULL
             GROUP BY st.tag_id
             HAVING session_count >= 1
             ORDER BY avg_rating DESC
             LIMIT 5",
        )
        .map_err(|e| format!("Query error: {}", e))?;

    let rows = stmt
        .query_map([], |row| {
            Ok(TopRatedItem {
                id: row.get(0)?,
                label: row.get(1)?,
                color: row.get(2)?,
                avg_rating: row.get(3)?,
                session_count: row.get(4)?,
            })
        })
        .map_err(|e| format!("Query error: {}", e))?;

    let mut items = Vec::new();
    for row in rows {
        items.push(row.map_err(|e| format!("Row error: {}", e))?);
    }
    Ok(items)
}

// ─── Streak & Consistency ───────────────────────────────────────

#[tauri::command]
pub fn get_streak_info(db: State<'_, DbPool>) -> Result<StreakInfo, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    compute_streak(&conn)
}

#[tauri::command]
pub fn get_consistency_days(
    db: State<'_, DbPool>,
    days: Option<i64>,
) -> Result<Vec<ConsistencyDay>, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    let num_days = days.unwrap_or(30);

    let mut stmt = conn
        .prepare(
            "SELECT DISTINCT DATE(started_at)
             FROM sessions
             WHERE status = 'COMPLETED'
               AND DATE(started_at) >= DATE('now', ?1)",
        )
        .map_err(|e| format!("Query error: {}", e))?;

    let offset = format!("-{} days", num_days);
    let active_dates: std::collections::HashSet<String> = stmt
        .query_map(rusqlite::params![offset], |row| row.get::<_, String>(0))
        .map_err(|e| format!("Query error: {}", e))?
        .filter_map(|r| r.ok())
        .collect();

    let today = chrono::Utc::now().date_naive();
    let mut result = Vec::new();
    for i in (0..num_days).rev() {
        let d = today - chrono::Duration::days(i);
        let ds = d.format("%Y-%m-%d").to_string();
        result.push(ConsistencyDay {
            has_activity: active_dates.contains(&ds),
            date: ds,
        });
    }

    Ok(result)
}

// ─── Calendar ───────────────────────────────────────────────────

#[tauri::command]
pub fn get_calendar_days(
    db: State<'_, DbPool>,
    year: i32,
    month: u32,
) -> Result<Vec<CalendarDay>, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {}", e))?;

    // month comes 0-indexed from JS
    let m = month + 1;
    let start = format!("{:04}-{:02}-01", year, m);
    let end = if m == 12 {
        format!("{:04}-01-01", year + 1)
    } else {
        format!("{:04}-{:02}-01", year, m + 1)
    };

    let mut stmt = conn
        .prepare(
            "SELECT DATE(started_at) AS date,
                    SUM(duration_seconds) AS total_seconds
             FROM sessions
             WHERE status = 'COMPLETED'
               AND DATE(started_at) >= ?1
               AND DATE(started_at) < ?2
             GROUP BY DATE(started_at)",
        )
        .map_err(|e| format!("Query error: {}", e))?;

    let activity: std::collections::HashMap<String, i64> = stmt
        .query_map(rusqlite::params![start, end], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, i64>(1)?))
        })
        .map_err(|e| format!("Query error: {}", e))?
        .filter_map(|r| r.ok())
        .collect();

    // Calculate days in month
    let days_in_month = if m == 12 {
        chrono::NaiveDate::from_ymd_opt(year + 1, 1, 1)
    } else {
        chrono::NaiveDate::from_ymd_opt(year, m + 1, 1)
    }
    .and_then(|d| d.pred_opt())
    .map(|d| chrono::Datelike::day(&d))
    .unwrap_or(30);

    let mut result = Vec::new();
    for day in 1..=days_in_month {
        let date_str = format!("{:04}-{:02}-{:02}", year, m, day);
        if let Some(&total_seconds) = activity.get(&date_str) {
            let hours = total_seconds as f64 / 3600.0;
            let intensity = if hours < 1.0 {
                1
            } else if hours < 3.0 {
                2
            } else if hours < 5.0 {
                3
            } else {
                4
            };
            result.push(CalendarDay {
                date: date_str,
                has_activity: true,
                intensity,
                total_seconds,
            });
        } else {
            result.push(CalendarDay {
                date: date_str,
                has_activity: false,
                intensity: 0,
                total_seconds: 0,
            });
        }
    }

    Ok(result)
}
