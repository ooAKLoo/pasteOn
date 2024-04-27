import React, { useState, useEffect, useCallback, useRef } from 'react';

function WebSocketManager({ serverIp, serverPort, onMessage, onError, onClose }) {
    const [websocket, setWebSocket] = useState(null);
    const lastDetails = useRef({ ip: null, port: null });
    const heartbeatInterval = useRef(null); // 用于存储心跳检测的定时器
    const reconnectInterval = useRef(null); // 用于存储重连尝试的定时器

    // 验证服务器细节
    const validateServerDetails = useCallback((ip, port) => {
        const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const portValid = port >= 1 && port <= 65535;
        return ipRegex.test(ip) && portValid;
    }, []);

    const websocketRef = useRef(null);

    useEffect(() => {
        websocketRef.current = websocket;
    }, [websocket]);
    
    const sendHeartbeat = useCallback(() => {
        if (websocketRef.current && websocketRef.current.readyState === 1) {
            websocketRef.current.send('ping');
        }
    }, []);  // websocket removed from dependencies


    // 用于连接 WebSocket 的函数
    const connectWebSocket = useCallback(() => {
        if (websocket && websocket.readyState === WebSocket.OPEN && lastDetails.current.ip === serverIp && lastDetails.current.port === serverPort) {
            console.log('Attempted to connect using the same IP and port as before.');
            return;
        }

        if (!validateServerDetails(serverIp, serverPort)) {
            console.error('Invalid server IP or port.');
            onError && onError('Invalid server IP or port.');
            return;
        }

        if (websocket) {
            console.log('Closing existing WebSocket connection.');
            websocket.close();
        }

        const url = `ws://${serverIp}:${serverPort}`;
        const ws = new WebSocket(url);

        ws.onopen = () => {
            console.log('WebSocket connected:', url);
            ws.send('Hello Server!');
            lastDetails.current = { ip: serverIp, port: serverPort };

            clearInterval(reconnectInterval.current); // 清除重连尝试

            // 设置心跳检测
            clearInterval(heartbeatInterval.current);
            heartbeatInterval.current = setInterval(sendHeartbeat, 3000); // 每30秒发送一次心跳
        };

        ws.onmessage = event => {
            onMessage && onMessage(event.data);
        };

        ws.onerror = error => {
            console.error('WebSocket Error:', error);
            onError && onError(error);
        };

        ws.onclose = event => {
            onClose && onClose(event);

            // 清除心跳检测
            clearInterval(heartbeatInterval.current);

            // 尝试重新连接
            if (!reconnectInterval.current) {
                reconnectInterval.current = setInterval(connectWebSocket, 5000); // 每5秒尝试重新连接
            }
        };

        setWebSocket(ws);
    }, [serverIp, serverPort, validateServerDetails,  onError, onMessage, onClose]);

    useEffect(() => {
        connectWebSocket();

        return () => {
            if (websocket) {
                websocket.close();
            }
            clearInterval(heartbeatInterval.current);
            clearInterval(reconnectInterval.current);
        };
    }, []);

    return { websocket, connectWebSocket };
}

export default WebSocketManager;
