mod app;
mod websocket;
mod mdns;
mod state;

use state::Clients;
use std::sync::Arc;
use tokio::sync::Mutex;

#[tokio::main]
async fn main() {
    // let clients: Clients = Arc::new(Mutex::new(std::collections::HashMap::new()));

    // 启动 Tauri 应用程序，这是异步函数，我们直接等待它完成
    app::start_tauri_app().await;
}
