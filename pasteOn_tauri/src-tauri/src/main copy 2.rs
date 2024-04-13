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
    println!("Program started"); // 测试程序启动

    let clients: Clients = Arc::new(Mutex::new(std::collections::HashMap::new()));
    let websocket_server = start_websocket_server(clients.clone());

    // 看看是否有立即的错误
    match websocket_server.await {
        Ok(_) => println!("WebSocket server started successfully"),
        Err(e) => eprintln!("WebSocket server failed to start: {:?}", e),
    }
}

