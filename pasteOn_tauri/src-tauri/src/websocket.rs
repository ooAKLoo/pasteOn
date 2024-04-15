// src/websocket.rs

extern crate ws;
extern crate uuid;
extern crate chrono;

use uuid::Uuid;
use chrono::Utc;
use ws::{listen, Handler, Sender, Result, Message, Handshake, CloseCode};
use std::sync::{Arc, Mutex};
use crate::state::Clients;

pub struct Server {
    out: Sender,
    clients: Clients,
}

impl Handler for Server {
    fn on_open(&mut self, _: Handshake) -> Result<()> {
        let now = Utc::now();
        let welcome_msg = format!("Welcome! Current time: {}", now.to_rfc3339());
        self.out.send(Message::text(welcome_msg))?;

        // 因为 Handler 是同步的，我们在这里不能使用 .await
        // 这里需要考虑其他方法，比如使用 std::sync::Mutex
        Ok(())
    }

    // fn on_message(&mut self, msg: Message) -> Result<()> {
    //     // 相同问题，这里也不能使用异步锁
    //     Ok(())
    // }

    fn on_message(&mut self, msg: Message) -> Result<()> {
        println!("Received message: {}", msg);
        self.out.broadcast(msg)?;
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
