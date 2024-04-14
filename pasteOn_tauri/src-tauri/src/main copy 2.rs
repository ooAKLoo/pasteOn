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

    // 创建一个通道，用于同步服务器和客户端的启动
    let (tx, rx) = oneshot::channel::<()>();

    let mdns_service = tokio::spawn(async move {
        let (tx_mdns, rx_mdns) = oneshot::channel();
        thread::spawn(move || {
            start_mdns_query(tx_mdns);
        });

        if rx_mdns.await.is_ok() {
            // 启动WebSocket服务器
            let websocket_server = tokio::spawn(async move {
                if start_websocket_server(clients.clone()).await.is_ok() {
                    println!("WebSocket server started.");
                    // 服务器启动成功，发送信号
                    tx.send(()).unwrap();
                }
            });

            // 等待服务器启动
            websocket_server.await.unwrap();
        }

        // mDNS查询失败或服务未找到，启动WebSocket客户端
        let client = tokio::spawn(async {
            // 等待服务器启动信号
            rx.await.unwrap();
            connect_and_listen_to_websocket().await;
        });

        client.await.unwrap();
    });

    println!("Starting Tauri application");
    start_tauri_app();
    mdns_service.await.unwrap();
}
