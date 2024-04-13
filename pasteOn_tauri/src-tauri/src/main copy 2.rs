mod app;
mod websocket;
mod mdns;
mod state;

use state::Clients;
use std::sync::Arc;
use tokio::sync::Mutex;
use crate::websocket::{start_websocket_server};
use crate::mdns::{start_mdns_query, register_mdns_service};
use crate::app::start_tauri_app;
use std::thread;
use tokio::sync::oneshot;

#[tokio::main]
async fn main() {
    let clients: Clients = Arc::new(Mutex::new(std::collections::HashMap::new()));

    // 启动WebSocket服务器和mDNS服务的异步任务
    let websocket_server = tokio::spawn(async move {
        start_websocket_server(clients.clone()).await
    });

    let mdns_service = tokio::spawn(async {
        let (tx_mdns, rx_mdns) = oneshot::channel();
        thread::spawn(move || {
            start_mdns_query(tx_mdns);
        });

        // 等待mDNS查询结果
        if rx_mdns.await.is_err() {
            register_mdns_service();
        }
    });

    // 等待后台服务完成启动
    //let _ = tokio::join!(websocket_server, mdns_service);

    // 主线程启动Tauri应用程序
    println!("Starting Tauri application");
    start_tauri_app(); // 这里直接在主线程上调用
}

