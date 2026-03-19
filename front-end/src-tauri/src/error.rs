use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct AppError {
    pub message: String,
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.message)
    }
}

impl From<String> for AppError {
    fn from(msg: String) -> Self {
        AppError { message: msg }
    }
}

impl From<&str> for AppError {
    fn from(msg: &str) -> Self {
        AppError {
            message: msg.to_string(),
        }
    }
}

impl From<tauri_plugin_sql::Error> for AppError {
    fn from(err: tauri_plugin_sql::Error) -> Self {
        AppError {
            message: format!("Database error: {}", err),
        }
    }
}
