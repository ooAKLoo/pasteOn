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

    let (tx, rx) = oneshot::channel::<bool>();
    let clients_clone = clients.clone();

    let mdns_service = tokio::spawn(async move {
        let (tx_mdns, rx_mdns) = oneshot::channel();
        thread::spawn(move || {
            start_mdns_query(tx_mdns);
        });

        if rx_mdns.await.is_ok() {
            // Start WebSocket server in a new thread

            thread::spawn(move || {
                let rt = Runtime::new().unwrap();
                rt.block_on(async {
                    if start_websocket_server(clients_clone, tx).await.is_ok() {
                        println!("WebSocket server started successfully.");
                    }
                });
            });
        
            // 等待接收到服务器启动的信号
            if rx.await.unwrap() {
                println!("WebSocket server setup complete.");
                // Start WebSocket client after server is confirmed to be started
                connect_and_listen_to_websocket().await;
            } else {
                println!("Failed to start WebSocket server.");
            }
        
        }
        println!("WebSocket server started successfully.");
        // mDNS查询失败或服务未找到，启动WebSocket客户端
        // let client = tokio::spawn(async {
        //     // 等待服务器启动信号
        //     rx.await.unwrap();
        //     connect_and_listen_to_websocket().await;
        // });

        // client.await.unwrap();
    });
    // 继续执行其他任务
    println!("Starting Tauri application");
    start_tauri_app(); 
}