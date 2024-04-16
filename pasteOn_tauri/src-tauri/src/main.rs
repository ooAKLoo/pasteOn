use tauri::{Manager};
use tokio::sync::{Mutex, mpsc, oneshot};
use std::sync::Arc;
use std::collections::HashMap;
use once_cell::sync::Lazy;
use local_ip_address::local_ip;
use std::thread;
use tokio::runtime::Runtime;

mod websocket;
mod mdns;
mod state;

use state::Clients;
use crate::websocket::{start_websocket_server};

// 全局服务器状态和客户端列表
static SERVER_RUNNING: Lazy<Mutex<bool>> = Lazy::new(|| Mutex::new(false));
static GLOBAL_CLIENTS: Lazy<Clients> = Lazy::new(|| {
    Arc::new(Mutex::new(HashMap::new()))
});

#[tokio::main]
async fn main() {
    let my_local_ip = local_ip().unwrap().to_string();
    let server_address = format!("{}:{}", my_local_ip, "3031");

    tauri::Builder::default()
        .setup(move |app| {
            let app_handle = app.app_handle();
            tokio::spawn(async move {
                start_websocket_server(&server_address, GLOBAL_CLIENTS.clone()).await;
                println!("WebSocket server started successfully at {}", server_address);
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}