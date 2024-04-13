mod app;
mod websocket;
mod mdns;
mod state;

use state::Clients;
use std::sync::Arc;
use tokio::sync::Mutex;

#[tokio::main]
async fn main() {
    // 创建共享的客户端集合
    let clients: Clients = Arc::new(Mutex::new(std::collections::HashMap::new()));

    // 首先尝试服务发现，确定是否需要启动 WebSocket 服务器
    let service_found = mdns::start_mdns_service().await;

    // 如果没有发现服务，则启动 WebSocket 服务器
    if !service_found {
        // 启动 WebSocket 服务器
        let websocket_server = websocket::start_websocket_server(clients.clone());
        tokio::spawn(websocket_server);
    }

    // 启动 Tauri 应用程序
    app::start_tauri_app().await.expect("Tauri app failed to run");
}
