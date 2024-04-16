import React, { useState, useEffect, useCallback,useRef } from 'react';

function WebSocketManager({ serverIp, serverPort, onMessage, onError, onClose }) {
    const [websocket, setWebSocket] = useState(null);
    const lastDetails = useRef({ ip: null, port: null });

    // 验证服务器细节
    const validateServerDetails = useCallback((ip, port) => {
        const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const portValid = port >= 1 && port <= 65535;
        return ipRegex.test(ip) && portValid;
    }, []);

    // 用于连接 WebSocket
    const connectWebSocket = useCallback(() => {
        // 检查新的 IP 和端口是否与上一次相同
        if (lastDetails.current.ip === serverIp && lastDetails.current.port === serverPort) {
            console.log('Attempted to connect using the same IP and port as before.');
            return;
        }

        if (!validateServerDetails(serverIp, serverPort)) {
            console.error('Invalid server IP or port.');
            onError && onError('Invalid server IP or port.');
            return;
        }

        if (websocket) {
            websocket.close();
            console.log('Closing existing WebSocket connection.');
        }

        const url = `wss://${serverIp}:${serverPort}`;
        const ws = new WebSocket(url);

        ws.onopen = () => {
            console.log('WebSocket connected:', url);
            ws.send('Hello Server!');
            lastDetails.current = { ip: serverIp, port: serverPort };
        };

        ws.onmessage = event => {
            console.log('Message received:', event.data);
            onMessage && onMessage(event.data);
        };

        ws.onerror = error => {
            console.error('WebSocket Error:', error);
            onError && onError(error);
        };

        ws.onclose = event => {
            console.log('WebSocket closed', event);
            onClose && onClose(event);
        };

        setWebSocket(ws);
    }, [serverIp, serverPort, validateServerDetails, websocket, onMessage, onError, onClose]);

    // useEffect 仅在组件挂载时执行
    useEffect(() => {
        connectWebSocket();

        return () => {
            if (websocket) {
                websocket.close();
            }
        };
    }, []); // 空依赖数组，只在挂载时执行

    // 返回连接函数，以便可以手动触发重连
    return { websocket,connectWebSocket };
}

export default WebSocketManager;
