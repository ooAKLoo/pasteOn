use crate::state::Clients;
use warp::Filter;
use std::sync::Arc;
use warp::ws::{WebSocket, Message};
use futures::SinkExt;  // 导入 SinkExt 以获得 send 方法
use chrono::prelude::*;

pub async fn start_websocket_server(clients: Clients)  -> Result<(), warp::Error>{
    // 为 warp 过滤器创建一个克隆的 Arc 引用
    let clients_filter = warp::any().map(move || Arc::clone(&clients));

    // 设置 warp 路由，以处理 WebSocket 连接
    let routes = warp::path("ws")
        .and(warp::ws())
        .and(clients_filter)
        .map(|ws: warp::ws::Ws, clients: Clients| {
            ws.on_upgrade(move |socket| handle_connection(socket, clients))
        });

    // 启动 warp 服务
    println!("Starting WebSocket server on ws://3030/ws");
    warp::serve(routes).run(([0, 0, 0, 0], 3030)).await;
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
