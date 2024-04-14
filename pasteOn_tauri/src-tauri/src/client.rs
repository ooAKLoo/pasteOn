use futures_util::StreamExt; // 确保包括这行来获得`.next()`方法

pub async fn connect_and_listen_to_websocket() {
    let url = "ws://localhost:3030/ws";

    match tokio_tungstenite::connect_async(url).await {
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