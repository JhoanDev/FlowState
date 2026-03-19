#[allow(dead_code)]
pub fn db_err(e: impl std::fmt::Display) -> String {
    format!("Database error: {}", e)
}
