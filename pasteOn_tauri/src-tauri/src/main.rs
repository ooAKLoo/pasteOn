mod app;
mod websocket; // Ensure this module uses ws for WebSocket handling
mod mdns;
mod state;
mod client;

use state::Clients;
use std::sync::Arc;
use std::thread;
use tokio::runtime::Runtime;
use tokio::sync::{ oneshot, Mutex };
use tauri::{ Manager }; // Ensure Manager trait is imported
use crate::websocket::{ start_websocket_server };
use crate::mdns::{ start_mdns_query, register_mdns_service };
use crate::app::{ send_server_details };
use std::collections::HashMap;
use local_ip_address::local_ip;
use once_cell::sync::Lazy;

// 定义全局的服务器状态标记
static SERVER_RUNNING: Lazy<Mutex<bool>> = Lazy::new(|| Mutex::new(false));

static GLOBAL_CLIENTS: Lazy<Clients> = Lazy::new(|| {
    Arc::new(Mutex::new(HashMap::new()))
});

#[tokio::main]
async fn main() {
    let (tx, rx) = oneshot::channel::<Option<(String, u16)>>();

    let my_local_ip = local_ip().unwrap();

    tauri::Builder
        ::default()
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
                        start_websocket_server(&server_address, GLOBAL_CLIENTS.clone());
                    }); // 使用标准线程库启动新线程

                    println!("WebSocket server started successfully.");
                    let window = app_handle.get_window("main").unwrap();
                    let mut server_running = SERVER_RUNNING.lock().await;
                    if !*server_running {
                        println!("Starting WebSocket server at ");
                        // 这里放置启动服务器的代码
                        *server_running = true;  // 更新服务器运行状态为 true
                    } else {
                        println!("Server already running at ");
                    }
                    send_server_details(window, my_local_ip.to_string(), 3031); // Default port for ws server
                    register_mdns_service();
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![start_server_if_needed])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// Ensure the websocket::start_websocket_server is updated to use ws crate



#[tauri::command]
async fn start_server_if_needed(app_handle: tauri::AppHandle) {
    let local_ip = local_ip().unwrap().to_string();
    let server_address = format!("{}:3031", local_ip);
    let mut server_running = SERVER_RUNNING.lock().await;

    if !*server_running {
        *server_running = true;  // 更新服务器运行状态为 true
        std::thread::spawn(move || {
            start_websocket_server(&server_address,GLOBAL_CLIENTS.clone());
        });
        println!("WebSocket server started successfully.");
        register_mdns_service();
    } else {
        println!("Server already running.");
    }

    if let Some(window) = app_handle.get_window("main") {
        send_server_details(window, local_ip, 3031);
    }
}

// #[tauri::command]
// fn start_server_if_needed() {
//     let local_ip = local_ip().unwrap().to_string();
//     let server_address = format!("{}:3031", local_ip);
//     println!("Starting server if needed.");
//     // 假设我们用某种方式来检查服务器是否已启动
//     if !server_is_running().await {
//         // 启动 WebSocket 服务器
//         std::thread::spawn(move || {
//             start_websocket_server(&server_address, clients);
//         });
//         println!("WebSocket server started at {}", server_address);

//         // 注册 mDNS 服务
//         register_mdns_service(&server_address);
//     } else {
//         println!("Server already running.");
//     }

//     // 发送服务器细节回前端
//     if let Some(window) = app_handle.get_window("main") {
//         send_server_details(window, local_ip, 3031).await;
//     }
// }