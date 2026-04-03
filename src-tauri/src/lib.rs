mod commands;
mod database;
mod error;
mod models;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        )
        .setup(|app| {
            let db = database::init_db(app)
                .map_err(|e| format!("Failed to initialize database: {}", e))?;
            app.manage(db);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Health
            commands::health::ping,
            // Projects
            commands::projects::get_projects,
            commands::projects::create_project,
            commands::projects::update_project,
            commands::projects::delete_project,
            // Tags
            commands::tags::get_tags,
            commands::tags::create_tag,
            commands::tags::update_tag,
            commands::tags::delete_tag,
            // Sessions
            commands::sessions::save_session,
            commands::sessions::save_session_review,
            commands::sessions::get_session,
            commands::sessions::save_manual_session,
            commands::sessions::get_today_stats,
            commands::sessions::delete_session,
            // Goals
            commands::goals::get_weekly_goals,
            commands::goals::create_weekly_goal,
            commands::goals::update_weekly_goal,
            commands::goals::delete_weekly_goal,
            commands::goals::get_goal_progress,
            commands::goals::get_goals_summary,
            commands::goals::get_goals_history,
            // Stats & Analytics
            commands::stats::get_dashboard_stats,
            commands::stats::get_heatmap,
            commands::stats::get_work_distribution,
            commands::stats::get_study_distribution,
            commands::stats::get_top_rated_work,
            commands::stats::get_top_rated_study,
            commands::stats::get_streak_info,
            commands::stats::get_consistency_days,
            commands::stats::get_calendar_days,
            commands::stats::get_study_tag_ranking,
            // Dashboard / Activities
            commands::dashboard::get_recent_activities,
            commands::dashboard::get_activities_by_date,
            commands::dashboard::get_activities_by_project,
            commands::dashboard::get_activities_by_tag,
            // Settings
            commands::settings::get_settings,
            commands::settings::update_settings,
            commands::settings::export_data_vault,
            commands::settings::import_data_vault,
            commands::settings::wipe_all_data,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
