// use std::collections::HashMap;
// use std::sync::Arc;
// use tokio::sync::Mutex;
// use ws::{Sender};

// // 定义 Clients 类型
// pub type Clients =  Arc<Mutex<HashMap<String, Sender>>>;


use tokio_tungstenite::tungstenite::protocol::Message;
use futures_util::stream::SplitSink;
use tokio::sync::{Mutex};
use std::sync::Arc;
use std::collections::HashMap;
use tokio::net::TcpStream;

// Define the Clients type using tokio-tungstenite types
pub type Clients = Arc<Mutex<HashMap<String, SplitSink<tokio_tungstenite::WebSocketStream<TcpStream>, Message>>>>;
