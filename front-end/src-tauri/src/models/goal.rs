use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WeeklyGoal {
    pub id: i64,
    #[serde(rename = "type")]
    pub goal_type: String,
    pub label: String,
    pub target_hours: f64,
    pub project_id: Option<i64>,
    pub tag_id: Option<i64>,
    pub current_hours: f64,
    pub week_start: String,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct WeeklyGoalInput {
    #[serde(rename = "type")]
    pub goal_type: String,
    pub target_hours: f64,
    pub project_id: Option<i64>,
    pub tag_id: Option<i64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GoalProgress {
    pub current_hours: f64,
    pub percentage: i64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WeeklyGoalSummary {
    pub total_created: i64,
    pub total_met: i64,
    pub avg_hours_per_week: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WeeklyGoalGroup {
    pub week_start: String,
    pub goals: Vec<WeeklyGoal>,
}
