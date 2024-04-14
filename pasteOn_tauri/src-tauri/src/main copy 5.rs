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

    // 创建一个新的Tokio Runtime在一个新线程中运行WebSocket服务器
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
    } else {
        println!("Failed to start WebSocket server.");
    }

    // 继续执行其他任务
    println!("Starting Tauri application");
    start_tauri_app(); 
}