mod app;
mod websocket;
mod mdns;
mod state;

use state::Clients;
use std::sync::Arc;
use tokio::sync::Mutex;

#[tokio::main]
async fn main() {
    let clients: Clients = Arc::new(Mutex::new(std::collections::HashMap::new()));

    // 启动 Tauri 应用程序
    let tauri_app = app::start_tauri_app();

   // 同步启动 mDNS 服务查询和注册
   mdns::start_mdns_query();
   mdns::register_mdns_service();

    // 同时运行所有服务
    tokio::join!(
        tauri_app, // 注意这里没有分号
    );
}
