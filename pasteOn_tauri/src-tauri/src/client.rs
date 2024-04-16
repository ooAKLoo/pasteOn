use futures_util::StreamExt; // 确保包括这行来获得`.next()`方法
use local_ip_address::local_ip;
use std::sync::{Arc, Mutex};
use crate::state::Clients;
use tauri::Manager;

pub async fn connect_and_listen_to_websocket(ip: Option<String>, port: Option<u16>) {
    let ip = ip.as_deref().unwrap_or("localhost");
    let port = port.unwrap_or(3031);
    let url = format!("ws://{}:{}/ws", ip, port);

    match tokio_tungstenite::connect_async(&url).await {
        Ok((mut socket, _)) => {
            println!("WebSocket client connected.");
            while let Some(msg) = socket.next().await {
                match msg {
                    Ok(msg) => {
                        if msg.is_text() || msg.is_binary() {
                            println!("Received message: {}", msg.to_text().unwrap());
                        }
                    },
                    Err(e) => {
                        eprintln!("Error receiving message: {:?}", e);
                        break;
                    }
                }
            }
        },
        Err(e) => {
            eprintln!("Failed to connect: {:?}", e);
        }
    }
}
