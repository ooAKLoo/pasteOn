use warp::Filter;
use std::sync::Arc;
use warp::ws::{WebSocket, Message};
use futures::{StreamExt, SinkExt};
use chrono::prelude::*;
use tokio::sync::{Mutex, oneshot};
use std::collections::HashMap;
use uuid::Uuid;
use crate::state::Clients;

pub async fn start_websocket_server(clients: Clients, tx: oneshot::Sender<bool>) -> Result<(), warp::Error> {
    let clients_filter = warp::any().map(move || Arc::clone(&clients));

    let routes = warp::path("ws")
        .and(warp::ws())
        .and(clients_filter)
        .map(|ws: warp::ws::Ws, clients: Clients| {
            ws.on_upgrade(move |socket| handle_connection(socket, clients))
        });

    println!("Starting WebSocket server on ws://localhost:3030/ws");
    let _ = tx.send(true);
    warp::serve(routes).run(([0, 0, 0, 0], 3031)).await;
    Ok(())
}

async fn handle_connection(socket: WebSocket, clients: Clients) {
    let client_id = Uuid::new_v4().to_string();
    let socket = Arc::new(Mutex::new(socket));

    // 插入新连接
    {
        let mut clients_lock = clients.lock().await;
        clients_lock.insert(client_id.clone(), Arc::clone(&socket));
    }

    println!("New WebSocket connection: {}", client_id);
    let now = Utc::now();
    let welcome_msg = format!("Welcome! Current time: {}", now.to_rfc3339());

    // 仅在发送欢迎消息时持有锁
    {
        let mut socket_lock = socket.lock().await;
        if let Err(e) = socket_lock.send(Message::text(welcome_msg)).await {
            eprintln!("Error sending welcome message: {:?}", e);
        }
    } // 这里释放了对socket的锁

    // 持续监听和处理消息，每次需要时重新获取socket的锁
    loop {
        let next_message;
        {
            let mut socket_lock = socket.lock().await;
            next_message = socket_lock.next().await;
        } // 重新在循环中获取锁，并在获取消息后立即释放

        match next_message {
            Some(Ok(message)) => {
                if message.is_text() || message.is_binary() {
                    let received_text = message.to_str().unwrap_or_default();
                    println!("Received message: {}", received_text);

                    let clients_lock = clients.lock().await;
                    println!("Number of connected clients: {}", clients_lock.len());
                    for (_client_id, client) in clients_lock.iter() {
                        {
                        println!("Attempting to lock client ID: {}", _client_id);  // 尝试锁定前输出
                        let mut client_lock = client.lock().await;
                        println!("Client ID: {}, WebSocket state: {:?}", _client_id, client_lock);  // 打印每个客户端的WebSocket状态信息
                        if let Err(e) = client_lock.send(Message::text(received_text.clone())).await {
                            eprintln!("Error broadcasting message: {:?}", e);
                        }
                    }
                    }
                } else if message.is_close() {
                    println!("Client requested to close connection.");
                    break;
                }
            },
            Some(Err(e)) => {
                eprintln!("Error receiving message: {:?}", e);
                break;
            },
            None => break, // 没有更多消息，退出循环
        }
    }

    // 移除断开连接的客户端
    {
        let mut clients_lock = clients.lock().await;
        clients_lock.remove(&client_id);
    }
    println!("WebSocket connection closed.");
}
