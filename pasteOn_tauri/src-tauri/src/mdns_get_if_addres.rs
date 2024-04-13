use mdns_sd::{ServiceDaemon, ServiceEvent,ServiceInfo};
use get_if_addrs::get_if_addrs;
use std::thread;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use std::collections::HashMap;

pub fn start_mdns_query() {
    let mdns = ServiceDaemon::new().expect("Failed to create daemon");
    let service_type = "_http._tcp.local.";
    let receiver = mdns.browse(service_type).expect("Failed to browse");

    // 使用 Arc 和 Mutex 包装一个 bool 值来跟踪服务是否被发现
    let service_found = Arc::new(Mutex::new(false));

    let service_found_thread = service_found.clone();
    thread::spawn(move || {
        while let Ok(event) = receiver.recv() {
            match event {
                ServiceEvent::ServiceResolved(info) => {
                    println!("Resolved a new service: {}", info.get_fullname());
                    let mut found = service_found_thread.lock().unwrap();
                    *found = true;
                },
                other_event => {
                    println!("Received other event: {:?}", other_event);
                }
            }
        }
    });

    // 等待一段时间以接收服务发现事件
    thread::sleep(Duration::from_secs(5));
    let was_service_found = *service_found.lock().unwrap();
    println!("Service discovery status: {}", if was_service_found { "Found" } else { "Not Found" });

    if !was_service_found {
        println!("No service found, registering the service...");
        register_mdns_service();
    }

    mdns.shutdown().unwrap();
}


pub fn register_mdns_service() {
    let mdns = ServiceDaemon::new().expect("Failed to create daemon");
        // 动态获取IP地址
        let ip = get_if_addrs().ok().and_then(|addrs|
            addrs.into_iter()
                 .find(|addr| !addr.is_loopback() && addr.ip().is_ipv4())
                 .map(|addr| addr.ip().to_string())
        ).expect("Failed to get local IP address");
        println!("Local IP address: {}", ip);

        // List all of the machine's network interfaces
for iface in get_if_addrs::get_if_addrs().unwrap() {
    println!("{:#?}", iface);
}
        let properties = [("property_1", "test"), ("property_2", "1234")];
    // 注册WebSocket服务
    let websocket_service_info = ServiceInfo::new(
        "_ws._tcp.local.",
        "Example WebSocket Service",
        "example.local.",
        &ip,
        3030,
        &properties[..],
    ).expect("Failed to create WebSocket service info");

    mdns.register(websocket_service_info).expect("Failed to register WebSocket service");


    // 保持服务运行一段时间
    thread::sleep(Duration::from_secs(5));
    mdns.shutdown().unwrap();
}
