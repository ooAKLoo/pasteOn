use mdns_sd::{ServiceDaemon, ServiceEvent, ServiceInfo};
use std::thread;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use std::collections::HashMap;

pub fn start_mdns_query() {
    let mdns = ServiceDaemon::new().expect("Failed to create daemon");
    let service_type = "_http._tcp.local.";
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

    let service_type = "_http._tcp.local.";
    let instance_name = "Example Service";
    let host_name = "example.local.";
    let ip = "192.168.1.50";
    let port = 8080;
    let properties = [("path", "/")];

    let service_info = ServiceInfo::new(
        service_type,
        instance_name,
        host_name,
        ip,
        port,
        &properties[..],
    ).expect("Failed to create service info");

    mdns.register(service_info).expect("Failed to register service");
    println!("Service registered successfully.");

    // 保持服务运行一段时间
    thread::sleep(Duration::from_secs(5));
    mdns.shutdown().unwrap();
}
