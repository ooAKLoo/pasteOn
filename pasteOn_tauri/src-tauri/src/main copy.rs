mod app;
mod websocket;
mod mdns;
mod state;
mod client;

use state::Clients;
use std::sync::Arc;
use tokio::sync::Mutex;
use crate::websocket::{ start_websocket_server };
use crate::mdns::{ start_mdns_query, register_mdns_service };
use crate::app::start_tauri_app;
use client::connect_and_listen_to_websocket;
use std::thread;
use tokio::sync::oneshot;

#[tokio::main]
async fn main() {
    let clients: Clients = Arc::new(Mutex::new(std::collections::HashMap::new()));

    // 使用 move 关键字确保 async 块拥有 clients 的所有权
    let mdns_service = tokio::spawn(async move {
        let (tx_mdns, rx_mdns) = oneshot::channel();
        thread::spawn(move || {
            start_mdns_query(tx_mdns);
        });

        // 等待mDNS查询结果
        if rx_mdns.await.is_ok() {
            // 在 async 块内部再次克隆 clients，因为这个块已经通过 move 取得所有权
            let websocket_server = start_websocket_server(clients.clone());
            if let Err(e) = websocket_server.await {
                eprintln!("Error running WebSocket server: {:?}", e);
            }

            // 注册 mDNS 服务
            register_mdns_service();
        }

        // mDNS查询失败，启动WebSocket客户端
        let client = tokio::spawn(async {
            connect_and_listen_to_websocket().await;
        });

        // 等待客户端逻辑执行完毕
        if let Err(e) = client.await {
            eprintln!("Error running WebSocket client: {:?}", e);
        }
    });

    // 主线程启动Tauri应用程序
    println!("Starting Tauri application");
    start_tauri_app(); // 这里直接在主线程上调用
}
