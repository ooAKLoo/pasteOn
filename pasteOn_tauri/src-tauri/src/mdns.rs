use mdns_sd::{ServiceDaemon, ServiceEvent, ServiceInfo};
use local_ip_address::local_ip;
use std::thread;
use std::sync::{Arc, Mutex};
use std::time::Duration;

pub fn start_mdns_query() {
    let mdns = ServiceDaemon::new().expect("Failed to create daemon");
    let service_type = "_ws._tcp.local.";  // 专注于WebSocket服务
    let receiver = mdns.browse(service_type).expect("Failed to browse");

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
    let my_local_ip = local_ip().unwrap();
    println!("Local IP address: {}", my_local_ip);

    let properties = [("version", "1.0"), ("support", "basic")];
    let websocket_service_info = ServiceInfo::new(
        "_ws._tcp.local.",
        "PasteOn WebSocket Service",
        "pasteon.local.",
        &my_local_ip.to_string(),
        3030,
        &properties[..],
    ).expect("Failed to create WebSocket service info");

    mdns.register(websocket_service_info).expect("Failed to register WebSocket service");

    thread::sleep(Duration::from_secs(5));
    mdns.shutdown().unwrap();
}
