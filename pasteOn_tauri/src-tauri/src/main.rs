// #![windows_subsystem = "windows"]
mod app;
mod websocket; // Ensure this module uses ws for WebSocket handling
mod mdns;
mod state;

use state::Clients;
use std::sync::Arc;
use std::thread;
use tokio::sync::{ oneshot, Mutex };
use tauri::{ Manager }; // Ensure Manager trait is imported
use crate::websocket::{ start_websocket_server };
use crate::mdns::{ start_mdns_query, register_mdns_service };
use crate::app::{ send_server_details };
use std::collections::HashMap;
use local_ip_address::local_ip;
use once_cell::sync::Lazy;
use tauri::{ CustomMenuItem, SystemTray, SystemTrayEvent, SystemTrayMenu };

// 定义全局的服务器状态标记
static SERVER_RUNNING: Lazy<Mutex<bool>> = Lazy::new(|| Mutex::new(false));

static GLOBAL_CLIENTS: Lazy<Clients> = Lazy::new(|| { Arc::new(Mutex::new(HashMap::new())) });

pub static SERVICE_REGISTERED: Lazy<Mutex<bool>> = Lazy::new(|| Mutex::new(false));

#[tokio::main]
async fn main() {
    let my_local_ip = local_ip().unwrap();

    // 创建系统托盘菜单
    let tray_menu = SystemTrayMenu::new().add_item(CustomMenuItem::new("quit", "Quit"));

    let tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder
        ::default()
        .system_tray(tray)
        .on_system_tray_event(|app, event| {
            match event {
                SystemTrayEvent::MenuItemClick { id, .. } => {
                    let window = app.get_window("main").unwrap();
                    match id.as_str() {
                        "quit" => {
                            std::process::exit(0);
                        }
                        _ => {}
                    }
                }
                _ => {}
            }
        })
        .setup(move |app| {
            // app.set_activation_policy(tauri::ActivationPolicy::Accessory); // 设置应用程序的激活策略only for macOS
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

                    thread::spawn(move || {
                        let server_address = format!("{}:{}", my_local_ip, "3031");
                        start_websocket_server(&server_address, GLOBAL_CLIENTS.clone());
                    }); // 使用标准线程库启动新线程

                    println!("WebSocket server started successfully.");
                    let window = app_handle.get_window("main").unwrap();
                    {
                        let mut server_running = SERVER_RUNNING.lock().await;
                        if !*server_running {
                            println!("Starting WebSocket server at ");
                            // 这里放置启动服务器的代码
                            *server_running = true; // 更新服务器运行状态为 true
                        } else {
                            println!("Server already running at ");
                        }
                    }
                    send_server_details(window, my_local_ip.to_string(), 3031); // Default port for ws server
                    register_mdns_service().await;
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![start_server_if_needed, send_server_details,get_hostname])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// Ensure the websocket::start_websocket_server is updated to use ws crate

#[tauri::command]
async fn start_server_if_needed(app_handle: tauri::AppHandle) {
    println!("Starting server if needed.");
    let local_ip = local_ip().unwrap().to_string();
    let server_address = format!("{}:3031", local_ip);

    {
        println!("Starting WebSocket server at {}", server_address);
        let mut server_running = SERVER_RUNNING.lock().await;
        if !*server_running {
            *server_running = true; // 更新服务器运行状态为 true
            std::thread::spawn(move || {
                start_websocket_server(&server_address, GLOBAL_CLIENTS.clone());
            });
            println!("WebSocket server started successfully.");
        } else {
            println!("Server already running.");
        }
    }

    if let Some(window) = app_handle.get_window("main") {
        send_server_details(window, local_ip, 3031);
        register_mdns_service().await;
    }
}

#[tauri::command]
fn get_hostname() -> String {
    hostname::get().unwrap().into_string().unwrap()
}

#[tauri::command]
fn get_local_ip() -> String {
    match local_ip() {
        Ok(ip) => ip.to_string(),
        Err(_) => "Unable to get IP".to_string(),
    }
}