use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use warp::ws::WebSocket;

// 定义 Clients 类型
pub type Clients = Arc<Mutex<HashMap<String, WebSocket>>>;