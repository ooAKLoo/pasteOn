use tokio::net::TcpListener;
use tokio_tungstenite::{accept_async, tungstenite::protocol::Message};
use tokio::sync::Mutex;
use std::sync::Arc;
use std::collections::HashMap;
use futures_util::{StreamExt, SinkExt};
use rcgen::{generate_simple_self_signed, Certificate};
use tokio_native_tls::TlsAcceptor;
use tokio_native_tls::native_tls::{self, Identity};  // 正确的导入路径
use crate::state::Clients;

// Generate a self-signed certificate for TLS
fn generate_certificate() -> (String, String) {
    let subject_alt_names = vec!["localhost".to_string(), "127.0.0.1".to_string()];
    let cert = generate_simple_self_signed(subject_alt_names).unwrap();
    let key_pem = cert.serialize_private_key_pem();
    let cert_pem = cert.serialize_pem().unwrap();
    (cert_pem, key_pem)
}

// Start a secure WebSocket server
pub async fn start_websocket_server(address: &str, clients: Clients) {
    let (cert_pem, key_pem) = generate_certificate();
    let identity = Identity::from_pem(&cert_pem, &key_pem).expect("Failed to create identity from certificate");
    let tls_acceptor = TlsAcceptor::from(Arc::new(native_tls::TlsAcceptor::builder(identity).build().unwrap()));

    let listener = TcpListener::bind(address).await.expect("Failed to bind WebSocket server");
    let tls_acceptor = Arc::new(tls_acceptor);

    while let Ok((stream, _)) = listener.accept().await {
        let tls_acceptor_clone = tls_acceptor.clone();
        let clients_clone = clients.clone();
        tokio::spawn(async move {
            if let Ok(tls_stream) = tls_acceptor_clone.accept(stream).await {
                handle_connection(tls_stream, clients_clone).await;
            } else {
                eprintln!("Failed to establish a secure TLS connection");
            }
        });
    }
}

// Handle an individual connection
async fn handle_connection(raw_stream: tokio_native_tls::TlsStream<tokio::net::TcpStream>, clients: Clients) {
    let ws_stream = accept_async(raw_stream).await.expect("Failed to accept WebSocket connection");
    let (_, mut read) = ws_stream.split();

    while let Some(message_result) = read.next().await {
        match message_result {
            Ok(msg) => {
                let msg_text = msg.to_text().unwrap();
                println!("Received message: {}", msg_text);

                let mut peers = clients.lock().await;
                for (_, tx) in peers.iter_mut() {
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
