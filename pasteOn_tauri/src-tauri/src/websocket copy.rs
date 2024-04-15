use crate::state::Clients;
use warp::Filter;
use std::sync::Arc;
use warp::ws::{WebSocket, Message};
use futures::{StreamExt,SinkExt};  // 导入 SinkExt 以获得 send 方法
use chrono::prelude::*;
use tokio::sync::oneshot;
use tokio::sync::Mutex;
use std::collections::HashMap;

pub async fn start_websocket_server(clients: Arc<Mutex<HashMap<String, WebSocket>>>, tx: oneshot::Sender<bool>) -> Result<(), warp::Error> {
    let clients_filter = warp::any().map(move || Arc::clone(&clients));

    let routes = warp::path("ws")
        .and(warp::ws())
        .and(clients_filter)
        .map(|ws: warp::ws::Ws, clients: Arc<Mutex<HashMap<String, WebSocket>>>| {
            ws.on_upgrade(move |socket| handle_connection(socket, clients))
        });

    println!("Starting WebSocket server on ws://localhost:3030/ws");
    let _ = tx.send(true); // 发送服务器即将开始监听的信号
    warp::serve(routes).run(([0, 0, 0, 0], 3031)).await; // 这将阻塞当前async block，直到服务器停止
    Ok(())
}


// 处理 WebSocket 连接的异步函数
async fn handle_connection(mut socket: WebSocket, clients: Arc<Mutex<HashMap<String, WebSocket>>>) {
    println!("New WebSocket connection");
    let now = Utc::now();
    let welcome_msg = format!("Welcome! Current time: {}", now.to_rfc3339());

    // 发送欢迎消息
    if let Err(e) = socket.send(Message::text(welcome_msg)).await {
        eprintln!("Error sending welcome message: {:?}", e);
    }

    // 循环监听客户端消息
    while let Some(result) = socket.next().await {
        match result {
            Ok(message) => {
                // 如果接收到消息，则处理消息
                if message.is_text() || message.is_binary() {
                    let received_text = message.to_str().unwrap_or_default();
                    println!("Received message: {}", received_text);
                    let response = format!("Echo: {}", received_text);
                    // 发送回响消息
                    if let Err(e) = socket.send(Message::text(response)).await {
                        eprintln!("Error sending message: {:?}", e);
                        break;
                    }
                } else if message.is_close() {
                    // 如果接收到关闭消息，则断开连接
                    println!("Client requested to close connection.");
                    break;
                }
            },
            Err(e) => {
                eprintln!("Error receiving message: {:?}", e);
                break;
            }
        }
    }
    println!("WebSocket connection closed.");
}
