pub async fn start_tauri_app()->  Result<(), warp::Error>  {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
