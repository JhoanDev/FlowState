use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Session {
    pub id: i64,
    #[serde(rename = "type")]
    pub session_type: String,
    pub project_id: Option<i64>,
    pub timer_mode: String,
    pub status: String,
    pub planned_duration_seconds: Option<i64>,
    pub duration_seconds: i64,
    pub started_at: String,
    pub finished_at: Option<String>,
    pub rating: Option<i64>,
    pub notes: String,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveSessionInput {
    #[serde(rename = "type")]
    pub session_type: String,
    pub project_id: Option<i64>,
    pub timer_mode: String,
    pub status: String,
    pub planned_duration_seconds: Option<i64>,
    pub duration_seconds: i64,
    pub started_at: String,
    pub finished_at: Option<String>,
    pub rating: Option<i64>,
    pub notes: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionProjectRef {
    pub id: i64,
    pub name: String,
    pub color: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionTagRef {
    pub id: i64,
    pub name: String,
    pub color: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionWithRelations {
    #[serde(flatten)]
    pub session: Session,
    pub project: Option<SessionProjectRef>,
    pub tags: Vec<SessionTagRef>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TodayStats {
    pub session_count: i64,
    pub total_seconds: i64,
    pub avg_seconds: i64,
}
