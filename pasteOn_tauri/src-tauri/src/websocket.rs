// src/websocket.rs

extern crate ws;
extern crate uuid;
extern crate chrono;

use chrono::Utc;
use ws::{listen, Handler, Sender, Result, Message, Handshake, CloseCode};
use crate::state::Clients;

pub struct Server {
    out: Sender,
    clients: Clients,
}

impl Handler for Server {
    fn on_open(&mut self, _: Handshake) -> Result<()> {
        // let now = Utc::now();
        // let welcome_msg = format!("Welcome! Current time: {}", now.to_rfc3339());
        // self.out.send(Message::text(welcome_msg))?;
        println!("WebSocket connection opened");
        Ok(())
        
    }
    
    fn on_message(&mut self, msg: Message) -> Result<()> {
        if let Ok(text) = msg.as_text() {
            // println!("Received message: {}", text);
            if text == "monitor check" {
                // 这是一个监控检查消息，只回复发送者
                self.out.send(Message::text("Monitor check successful"))?;
            } else {
                // 这不是监控检查消息，广播给所有客户端
                self.out.broadcast(Message::text(text))?;
            }
        }
        Ok(())
    }

    fn on_close(&mut self, code: CloseCode, reason: &str) {
        // 相同问题，这里也不能使用异步锁
        println!("WebSocket closing for ({:?}) {}", code, reason);
    }
}

// 这个函数启动 WebSocket 服务器
pub fn start_websocket_server(address: &str, clients: Clients) {
    println!("Starting WebSocket server on ws://{}", address);
    if let Err(e) = listen(address, |out| Server { out, clients: clients.clone() }) {
        eprintln!("Failed to start WebSocket server: {}", e);
    }
    
}
