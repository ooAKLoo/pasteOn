use crate::state::Clients;
use warp::Filter;
use warp::ws::WebSocket;
use std::sync::Arc;

pub async fn start_websocket_server(clients: Clients)  -> Result<(), warp::Error>{
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
    warp::serve(routes).run(([0, 0, 0, 0], 3030)).await;
    Ok(())
}

// 处理 WebSocket 连接的异步函数
async fn handle_connection(socket: WebSocket, clients: Clients) {
    // ...处理 WebSocket 连接的逻辑
}
