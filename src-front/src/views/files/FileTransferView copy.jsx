
import React, { useEffect, useState } from 'react';

import { invoke } from '@tauri-apps/api/tauri';

const FileTransferView = ({ files, config, websocket, toggleFileDragged }) => {
    const [clients, setClients] = useState([]); // 用于存储从服务器接收的客户端信息

    useEffect(() => {
        console.log('FileTransferView mounted', config.colorScheme);
        
        
        async function fetchHostname() {
            try {
              const hostname = await invoke('get_hostname');
              console.log('Hostname:', hostname);
              return hostname;
            } catch (error) {
              console.error('Failed to fetch hostname:', error);
            }
          }
          
          fetchHostname();

        // 发送消息到服务器请求客户端信息
        if (websocket && websocket.readyState === WebSocket.OPEN) {
            websocket.send('get_clients');
            console.log('Request for clients sent to server.');
        }

        // 设置接收消息的处理
        const handleWebSocketMessages = event => {
            console.log('Received message from server:', event.data);
            const data = JSON.parse(event.data);
            if (data.type === 'clients_list') {
                setClients(data.clients);
            }
        };

        websocket.addEventListener('message', handleWebSocketMessages);

        return () => {
            websocket.removeEventListener('message', handleWebSocketMessages);
        };
    }, [websocket]);

    return (
        <div
            style={{ backgroundColor: config.colorScheme }}
            className={`flex flex-col w-screen h-screen z-10 max-h-200 p-2 text-ellipsis overflow-hidden items-center justify-center rounded-xl relative`}
            onClick={toggleFileDragged}
        >
            <ul>
                {files.map((file, index) => (
                    <li key={index}>
                        Name: {file.name}, Path: {file.path}
                    </li>
                ))}
                <li>
                    Connected Clients:
                    {clients.map((client, idx) => (
                        <div key={idx}>{client}</div>
                    ))}
                </li>
            </ul>
        </div>
    );
};

export default FileTransferView;
