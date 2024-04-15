mod app;
mod websocket;  // Ensure this module uses ws for WebSocket handling
mod mdns;
mod state;
mod client;

use state::Clients;
use std::sync::Arc;
use std::thread;
use tokio::runtime::Runtime;
use tokio::sync::{oneshot, Mutex};
use tauri::{ Manager};  // Ensure Manager trait is imported
use crate::websocket::{ start_websocket_server };
use crate::mdns::{ start_mdns_query, register_mdns_service };
use crate::app::{ send_server_details };
use std::collections::HashMap;
use local_ip_address::local_ip;

#[tokio::main]
async fn main() {
    let clients: Clients = Arc::new(Mutex::new(HashMap::new()));
  // Using Vec for simplicity with ws

    let (tx, rx) = oneshot::channel::<Option<(String, u16)>>();

    let my_local_ip = local_ip().unwrap();

    tauri::Builder::default()
        .setup(move |app| {
            let app_handle = app.app_handle(); // Get AppHandle
            tokio::spawn(async move {
                let (tx_mdns, rx_mdns) = oneshot::channel();
                thread::spawn(move || {
                    start_mdns_query(tx_mdns); // Start mDNS query
                });

                if let Ok(Some((ip, port))) = rx_mdns.await {
                    println!("Service found at IP: {}, Port: {}", ip, port);
                    let window = app_handle.get_window("main").unwrap();
                    send_server_details(window, ip, port);
                } else {
                    println!("No service found, starting WebSocket server.");
                    let rt = Runtime::new().unwrap();
                    
                    thread::spawn(move || {
                        let server_address = format!("{}:{}", my_local_ip, "3031");
                        start_websocket_server(&server_address, clients);
                    });  // 使用标准线程库启动新线程

                    println!("WebSocket server started successfully.");
                    let window = app_handle.get_window("main").unwrap();
                    send_server_details(window, my_local_ip.to_string(), 3031); // Default port for ws server
                    register_mdns_service();
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// Ensure the websocket::start_websocket_server is updated to use ws crate
