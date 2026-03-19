use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub theme: String,
    pub language: String,
    pub time_format: String,
    pub date_format: String,
    pub strict_mode_default: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            theme: "system".to_string(),
            language: "en".to_string(),
            time_format: "24h".to_string(),
            date_format: "BR".to_string(),
            strict_mode_default: true,
        }
    }
}
