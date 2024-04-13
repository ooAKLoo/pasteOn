use zeroconf::prelude::*;
use zeroconf::{MdnsBrowser, ServiceDiscovery, ServiceType};
use std::sync::Arc;
use std::time::Duration;
use tokio::time::timeout;
use std::any::Any;

const SERVICE_TYPE: &str = "_http._tcp.local.";

pub async fn start_mdns_service() -> bool {
    let service_type = ServiceType::new(SERVICE_TYPE, "tcp").expect("Invalid service type");
    let mut browser = MdnsBrowser::new(service_type);

    browser.set_service_discovered_callback(Box::new(on_service_discovered));

    let event_loop = browser.browse_services().expect("Failed to browse services");

    // Try to find the service within 5 seconds
    let timeout_duration = Duration::from_secs(5);
    match timeout(timeout_duration, async move {
        loop {
            // Poll the event loop to keep the browser alive and discover services
            event_loop.poll(Duration::from_secs(0)).expect("Failed to poll event loop");
            // In a real application, you would use a condition to exit this loop
        }
    }).await {
        Ok(_) => true,  // Service found
        Err(_) => false,  // Timeout occurred
    }
}

fn on_service_discovered(result: zeroconf::Result<ServiceDiscovery>, _context: Option<Arc<dyn Any>>) {
    match result {
        Ok(discovery) => {
            // Handle the discovered service
            println!("Service discovered: {:?}", discovery);
        },
        Err(e) => {
            // Handle the error
            eprintln!("Error discovering service: {:?}", e);
        }
    }
}
