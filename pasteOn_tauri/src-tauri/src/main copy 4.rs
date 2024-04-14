mod app;
mod websocket;
mod mdns;
mod state;
mod client;

use state::Clients;
use std::sync::Arc;
use tokio::sync::Mutex;
use crate::websocket::{ start_websocket_server,handle_connection };
use crate::mdns::{ start_mdns_query, register_mdns_service };
use crate::app::start_tauri_app;
use client::connect_and_listen_to_websocket;

use tokio::sync::oneshot;
use tokio::runtime::Runtime;
use std::thread;

use warp::Filter;

use warp::ws::{WebSocket, Message};
use futures::SinkExt;  // 导入 SinkExt 以获得 send 方法
use chrono::prelude::*;


#[tokio::main]
async fn main() {
    let clients: Clients = Arc::new(Mutex::new(std::collections::HashMap::new()));

    // 创建一个通道，用于同步服务器和客户端的启动
    let (tx, rx) = oneshot::channel::<bool>();

    let mdns_service = tokio::spawn(async move {
        let (tx_mdns, rx_mdns) = oneshot::channel();
        thread::spawn(move || {
            start_mdns_query(tx_mdns);
        });

        if rx_mdns.await.is_ok() {
            thread::spawn(move || {
                let rt = Runtime::new().unwrap();
                rt.block_on(async {
                    println!("Attempting to start WebSocket server...");
                    let clients_filter = warp::any().map(move || Arc::clone(&clients));

                    let routes = warp::path("ws")
                        .and(warp::ws())
                        .and(clients_filter)
                        .map(|ws: warp::ws::Ws, clients: Clients| {
                            ws.on_upgrade(move |socket| handle_connection(socket, clients))
                        });

                    println!("Starting WebSocket server on ws://localhost:3030/ws");
                    // 发送服务器启动成功的信号
                    let _ = tx.send(true);
                    warp::serve(routes).run(([0, 0, 0, 0], 3030)).await;
                });
            });

            // 等待服务器启动确认
            if rx.await.unwrap() {
                println!("WebSocket server started successfully.");
            } else {
                println!("Failed to start WebSocket server.");
            }
        }
    });

    println!("Starting Tauri application");
    start_tauri_app();
    mdns_service.await.unwrap();
}

