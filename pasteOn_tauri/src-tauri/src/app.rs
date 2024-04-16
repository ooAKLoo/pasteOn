use tauri::{ AppHandle, Window };
use tauri::Manager; // 添加这行
use local_ip_address::local_ip;
use crate::state::Clients;
use std::sync::{Arc, Mutex};

// pub fn start_tauri_app<F: FnOnce(AppHandle) + Send + 'static>(setup_fn: F) {
//     tauri::Builder::default()
//         .setup(move |app| {
//             setup_fn(app.app_handle());
//             Ok(())
//         })
//         .invoke_handler(tauri::generate_handler![send_server_details])
//         .run(tauri::generate_context!())
//         .expect("error while running tauri application");
// }

#[tauri::command]
pub fn send_server_details(window: Window, ip: String, port: u16) {
    println!("Sending server details to the frontend: ws://{}:{}", ip, port);
    window.emit("server-details", format!("ws://{}:{}", ip, port)).expect("failed to emit event");
}