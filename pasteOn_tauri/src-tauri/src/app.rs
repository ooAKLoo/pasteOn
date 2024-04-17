use tauri::{ Window };

#[tauri::command]
pub fn send_server_details(window: Window, ip: String, port: u16) {
    println!("Sending server details to the frontend: ws://{}:{}", ip, port);
    window.emit("server-details", format!("ws://{}:{}", ip, port)).expect("failed to emit event");
}