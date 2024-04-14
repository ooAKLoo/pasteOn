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
use crate::app::{ start_tauri_app, send_server_details};
use client::connect_and_listen_to_websocket;
use std::thread;
use tokio::sync::oneshot;
use tokio::runtime::Runtime;
use std::collections::HashMap;
use tauri::{AppHandle, Window};
use tauri::Manager; // 确保导入 Manager trait

#[tokio::main]
async fn main() {
    let clients: Clients = Arc::new(Mutex::new(HashMap::new()));
    let (tx, rx) = oneshot::channel::<Option<(String, u16)>>();

    tauri::Builder::default()
        .setup(move |app| {
            let app_handle = app.app_handle(); // 获取 AppHandle
            tokio::spawn(async move {
                let (tx_mdns, rx_mdns) = oneshot::channel();
                thread::spawn(move || {
                    start_mdns_query(&app_handle, tx_mdns); // 传递 AppHandle 到服务发现函数
                });

                if let Ok(Some((ip, port))) = rx_mdns.await {
                    println!("Service found at IP: {}, Port: {}------------------------------------", ip, port);
                    // let window = app_handle.get_window("main").unwrap(); // 使用 AppHandle 获取主窗口
                    // send_server_details(window, ip.clone(), port); // 发送服务详情到前端
                    // tokio::spawn(async move {
                    //     connect_and_listen_to_websocket(Some(ip), Some(port)).await; // 连接 WebSocket
                    // });
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
