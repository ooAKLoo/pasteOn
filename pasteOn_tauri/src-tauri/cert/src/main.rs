use rcgen::{generate_simple_self_signed, Certificate};
use std::fs::File;
use std::io::Write;

fn main() {
    let subject_alt_names = vec!["localhost".to_string(), "127.0.0.1".to_string()];
    let cert = generate_simple_self_signed(subject_alt_names).unwrap();

    let cert_pem = cert.serialize_pem().unwrap();
    let key_pem = cert.serialize_private_key_pem();

    // 写入证书到文件
    let mut cert_file = File::create("certificate.pem").unwrap();
    let mut key_file = File::create("key.pem").unwrap();

    cert_file.write_all(cert_pem.as_bytes()).unwrap();
    key_file.write_all(key_pem.as_bytes()).unwrap();

    println!("证书和私钥已生成并保存。");
}
