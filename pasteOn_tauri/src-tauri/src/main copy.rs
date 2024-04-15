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
use crate::app::{ start_tauri_app, send_server_details };
use client::connect_and_listen_to_websocket;
use std::thread;
use tokio::sync::oneshot;
use tokio::runtime::Runtime;
use std::collections::HashMap;
use tauri::{ AppHandle, Window };
use tauri::Manager; // 确保导入 Manager trait
use warp::ws::WebSocket;

#[tokio::main]
async fn main() {
    let clients: Clients = Arc::new(Mutex::new(HashMap::new())); 
    // let clients: Clients = Arc::new(Mutex::new(HashMap::new()));
    // let clients: Clients = Arc::new(RwLock::new(HashMap::new()));

    let (tx, rx) = oneshot::channel::<Option<(String, u16)>>();
    let clients_clone = clients.clone();
    tauri::Builder
        ::default()
        .setup(move |app| {
            let app_handle = app.app_handle(); // 获取 AppHandle
            tokio::spawn(async move {
                let (tx_mdns, rx_mdns) = oneshot::channel();
                thread::spawn(move || {
                    start_mdns_query(tx_mdns); // 传递 AppHandle 到服务发现函数
                });

                // 接收 mDNS 查询的结果
                if let Ok(Some((ip, port))) = rx_mdns.await {
                    println!("Service found at IP: {}, Port: {}", ip, port);
                    let window = app_handle.get_window("main").unwrap();
                    send_server_details(window,ip.clone(), port.clone());
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
                        let window = app_handle.get_window("main").unwrap();
                        let port = "3031".parse::<u16>();
                        send_server_details(window,"localhost".to_string(), port.unwrap());
                        // 进行 mDNS 注册
                        register_mdns_service();
                    } else {
                        println!("Failed to start WebSocket server.");
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
