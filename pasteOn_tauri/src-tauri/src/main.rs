fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![toggle_window_visibility])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn toggle_window_visibility(window: tauri::Window) {
    if window.is_visible().unwrap() {
        window.hide().unwrap();
    } else {
        window.show().unwrap();
    }
}
