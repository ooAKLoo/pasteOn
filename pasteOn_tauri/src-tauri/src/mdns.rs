use mdns_sd::{ServiceDaemon, ServiceEvent, ServiceInfo};
use local_ip_address::local_ip;
use std::thread;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tokio::sync::oneshot;

pub fn start_mdns_query(sender: oneshot::Sender<Option<(String, u16)>>) {
    let mdns = ServiceDaemon::new().expect("Failed to create daemon");
    let service_type = "_ws._tcp.local.";  // Focused on WebSocket services
    let receiver = mdns.browse(service_type).expect("Failed to browse");

    let service_info = Arc::new(Mutex::new(None));

    let service_info_thread = service_info.clone();
    thread::spawn(move || {
        while let Ok(event) = receiver.recv() {
            println!("Received event: {:?}", event);
            match event {
                ServiceEvent::ServiceResolved(info) => {
                    println!("Resolved a new service: {}", info.get_fullname());
                    // Iterating through HashSet and taking any IP
                    let ip = info.get_addresses().iter().next().map(|a| a.to_string());
                    let port = info.get_port();
                    if let Some(ip) = ip {
                        let mut service = service_info_thread.lock().unwrap();
                        *service = Some((ip, port));
                    }
                },
                other_event => {
                    println!("Received other event: {:?}", other_event);
                }
            }
        }
    });

    thread::sleep(Duration::from_secs(5));
    let service = service_info.lock().unwrap().clone();
    if let Some((ip, port)) = &service {
        println!("Service discovery successful: IP: {}, Port: {}", ip, port);
        // let window = app_handle.get_window("main").unwrap();
        // send_server_details(window,ip.clone(), port.clone());
    } else {
        println!("No service found.");
    }
    sender.send(service).expect("Failed to send service info");
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
