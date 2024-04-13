use libmdns::Responder;
use std::collections::HashMap; // 导入 HashMap
use std::sync::Arc;
use tokio::sync::Mutex;
use warp::Filter;
use warp::ws::WebSocket;

// 定义 Clients 类型
type Clients = Arc<Mutex<HashMap<String, WebSocket>>>;

#[tokio::main]
async fn main() {
    // 创建全局客户端存储
    let clients: Clients = Arc::new(Mutex::new(HashMap::new()));
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
    let warp_service = warp::serve(routes).run(([0, 0, 0, 0], 3030));

    // 创建 mDNS 响应器
    let responder = Arc::new(Responder::new().unwrap());
    // 注册 mDNS 服务
    let _service = responder.register(
        "_pasteon._tcp".to_owned(),
        "PasteOn Service".to_owned(),
        3030,
        &[] // 空的 TXT 记录
    );

    // 同时运行 warp 服务和 mDNS 服务
    tokio::join!(
        async move { warp_service.await },
        // ...这里添加 mDNS 服务发现的逻辑
    );
}

// 处理 WebSocket 连接的异步函数
async fn handle_connection(socket: WebSocket, clients: Clients) {
    // ...这里添加处理 WebSocket 连接的逻辑
}
