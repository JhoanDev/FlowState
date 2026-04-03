use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DashboardStats {
    pub work_hours: f64,
    pub work_trend: f64,
    pub study_hours: f64,
    pub study_trend: f64,
    pub current_streak: i64,
    pub best_streak: i64,
    pub goals_met: i64,
    pub goals_total: i64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HeatmapDay {
    pub date: String,
    pub total_seconds: i64,
    pub session_count: i64,
    pub intensity: i64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DistributionSlice {
    pub label: String,
    pub value: f64,
    pub color: String,
    #[serde(rename = "type")]
    pub slice_type: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DistributionChart {
    pub title: String,
    pub total: f64,
    pub slices: Vec<DistributionSlice>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ActivityEntryTag {
    pub name: String,
    pub color: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ActivityEntry {
    pub id: i64,
    #[serde(rename = "type")]
    pub entry_type: String,
    pub project_name: Option<String>,
    pub project_color: Option<String>,
    pub tags: Vec<ActivityEntryTag>,
    pub duration_seconds: i64,
    pub started_at: String,
    pub rating: Option<i64>,
    pub notes: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StreakInfo {
    pub current_streak: i64,
    pub best_streak: i64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConsistencyDay {
    pub date: String,
    pub has_activity: bool,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TopRatedItem {
    pub id: i64,
    pub name: String,
    pub color: String,
    pub average_rating: f64,
    pub total_sessions: i64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CalendarDay {
    pub date: String,
    pub has_activity: bool,
    pub intensity: i64,
    pub total_seconds: i64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StudyTagRankingItem {
    pub label: String,
    pub hours: f64,
    pub color: String,
}
