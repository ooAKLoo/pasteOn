mod app;
mod websocket;
mod mdns;
mod state;

use state::Clients;
use std::sync::Arc;
use tokio::sync::Mutex;
use crate::websocket::start_websocket_server;

#[tokio::main]
async fn main() {
    let clients: Clients = Arc::new(Mutex::new(std::collections::HashMap::new()));

    // 启动 Tauri 应用程序
    let tauri_app = app::start_tauri_app();

     // 同步启动 mDNS 服务查询和注册
     mdns::start_mdns_query();


    // 启动 WebSocket 服务器
    let websocket_server = start_websocket_server(clients.clone());

    // 同时运行所有服务，并处理可能的错误
    let (tauri_result, websocket_result) = tokio::join!(tauri_app, websocket_server);

    if let Err(e) = tauri_result {
        eprintln!("Error running Tauri app: {:?}", e);
    }

    if let Err(e) = websocket_result {
        eprintln!("Error running WebSocket server: {:?}", e);
    }
}
