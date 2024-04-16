use tokio::net::TcpListener;
use tokio_tungstenite::tungstenite::protocol::Message;
use tokio_tungstenite::accept_async;
use tokio::sync::Mutex;
use std::sync::Arc;
use std::collections::HashMap;
use futures_util::{StreamExt, SinkExt};
use crate::state::Clients;
// pub type Clients = Arc<Mutex<HashMap<String, tokio::sync::mpsc::UnboundedSender<Message>>>>;

pub async fn start_websocket_server(address: &str, clients: Clients) {
    let try_socket = TcpListener::bind(address).await;
    let listener = try_socket.expect("Failed to bind WebSocket server");

    while let Ok((stream, _)) = listener.accept().await {
        tokio::spawn(handle_connection(stream, clients.clone()));
    }
}

async fn handle_connection(raw_stream: tokio::net::TcpStream, clients: Clients) {
    let ws_stream = accept_async(raw_stream).await.expect("Failed to accept WebSocket connection");
    let (mut write, mut read) = ws_stream.split();

    while let Some(message_result) = read.next().await {
        match message_result {
            Ok(msg) => {
                let msg_text = msg.to_text().unwrap();
                println!("Received message: {}", msg_text);

                let mut peers = clients.lock().await;
                // Iterate over the peers and send the message asynchronously
                for (_, tx) in peers.iter_mut() {
                    // `send()` is async and requires mutable access, must use `await` and then check the result
                    if let Err(e) = tx.send(msg.clone()).await {
                        println!("Error sending message to peer: {:?}", e);
                    }
                }
            },
            Err(e) => {
                println!("Error reading message: {:?}", e);
                break;
            }
        }
    }
}

