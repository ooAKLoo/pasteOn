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
use tokio::runtime::Runtime;
use std::collections::HashMap;

#[tokio::main]
async fn main() {
    let clients: Clients = Arc::new(Mutex::new(HashMap::new()));

    let (tx, rx) = oneshot::channel::<Option<(String, u16)>>();
    let clients_clone = clients.clone();

    // 异步运行 mDNS 查询
    tokio::spawn(async move {
        let (tx_mdns, rx_mdns) = oneshot::channel();
        thread::spawn(move || {
            // 发送服务信息，而不是只发送成功信号
            start_mdns_query(tx_mdns);
        });

        // 接收 mDNS 查询的结果
        if let Ok(Some((ip, port))) = rx_mdns.await {
            println!("Service found at IP: {}, Port: {}", ip, port);
            // 连接到找到的服务
            connect_and_listen_to_websocket(Some(ip),Some(port)).await;
        } else {
            println!("No service found, starting WebSocket server.");
            // 启动 WebSocket 服务器
            let (tx_ws, rx_ws) = oneshot::channel::<bool>();
            thread::spawn(move || {
                let rt = Runtime::new().unwrap();
                rt.block_on(async {
                    if start_websocket_server(clients_clone, tx_ws).await.is_ok() {
                        println!("WebSocket server started successfully.");
                    }
                });
            });

            // 等待 WebSocket 服务器启动的信号
            if rx_ws.await.unwrap() {
                println!("WebSocket server setup complete.");
                // WebSocket 服务器已启动，准备接收客户端连接
            } else {
                println!("Failed to start WebSocket server.");
            }
        }
    });

    // 继续执行其他任务
    println!("Starting Tauri application");
    start_tauri_app(); 
}
