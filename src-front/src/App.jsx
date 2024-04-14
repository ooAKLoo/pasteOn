import React, { useState, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
function App() {
  const [webSocket, setWebSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  

  useEffect(() => {
      const unlisten = listen('server-details', (event) => {
          console.log('Received server details:', event.payload);
          const ws = new WebSocket(event.payload);
          // 设置 WebSocket 连接的相关逻辑
      });
  
      return () => {
          unlisten.then((func) => func());
      };
  }, []);
  
  useEffect(() => {
    // 创建 WebSocket 连接
    const ws = new WebSocket('ws://192.168.1.130:3030/ws');
    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };
    ws.onmessage = (event) => {
      console.log('Message from server ', event.data);
      setMessages(prevMessages => [...prevMessages, event.data]);
    };
    ws.onerror = (error) => {
      console.error('WebSocket error: ', error);
    };
    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    setWebSocket(ws);

    // 清理函数
    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = (message) => {
    if (webSocket) {
      webSocket.send(message);
    }
  };

  return (
    <div>
      <h1>WebSocket Messages</h1>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
      <button onClick={() => sendMessage("Hello, Server!")}>Send Message</button>
    </div>
  );
}

export default App;
