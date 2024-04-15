use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use ws::{Sender};

// 定义 Clients 类型
// pub type Clients = Arc<Mutex<HashMap<String, Arc<Mutex<WebSocket>>>>>;
pub type Clients =  Arc<Mutex<HashMap<String, Sender>>>;
// pub type Clients = Arc<HashMap<String, WebSocket>>;
// pub type Clients = Arc<Mutex<HashMap<String, WebSocket>>>;
// pub type Clients = Arc<RwLock<HashMap<String, WebSocket>>>;