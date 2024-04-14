use crate::state::Clients;
use warp::Filter;
use std::sync::Arc;
use warp::ws::{WebSocket, Message};
use futures::SinkExt;  // 导入 SinkExt 以获得 send 方法
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
    warp::serve(routes).run(([0, 0, 0, 0], 3030)).await; // 这将阻塞当前async block，直到服务器停止
    Ok(())
}


// 处理 WebSocket 连接的异步函数
async fn handle_connection(mut socket: WebSocket, clients: Clients) {
    println!("New WebSocket connection");
    let now = Utc::now();
    let welcome_msg = format!("Welcome! Current time: {}", now.to_rfc3339());

    // 尝试发送欢迎消息
    if let Err(e) = socket.send(Message::text(welcome_msg)).await {
        eprintln!("Error sending welcome message: {:?}", e);
    }

    // 在这里添加其他处理逻辑，例如监听更多消息或处理业务逻辑
}
