use serde::Serialize;

#[derive(Serialize)]
pub struct HealthCheck {
    pub status: String,
    pub version: String,
}

#[tauri::command]
pub fn ping() -> Result<HealthCheck, String> {
    Ok(HealthCheck {
        status: "ok".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}
