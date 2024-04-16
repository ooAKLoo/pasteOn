import React, { useState, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { NotificationProvider } from './hook/NotificationContext';
import NotificationBar from './views/NotificationBar';
import ItemsManager from './models/itemsManager';
import { useKeyboardShortcuts } from './hook/useKeyboardShortcuts';
import { useClipboard } from './hook/useClipboard';
import { appWindow, LogicalSize } from '@tauri-apps/api/window';
import Settings from './views/Settings';
import { useConfig } from './hook/ConfigContext ';
import { hexToHSL } from './controller/util';
import WebSocketManager from './models/WebSocketManager';


function App() {
  const [isVisible, setIsVisible] = useState(true);
  const { writeToClipboard, readFromClipboard } = useClipboard();
  const [windowSize, setWindowSize] = useState(new LogicalSize(400, 100));
  const [isExpanded, setIsExpanded] = useState(false);
  // const [websocket, setWebSocket] = useState(null);
  const { config } = useConfig();
  const [maxLength, setMaxLength] = useState(config.maxLength);
  const { items, adjustIndex } = ItemsManager({ writeToClipboard, readFromClipboard, maxLength });

  // Main and detail styles initialized
  const [mainStyle, setMainStyle] = useState({ backgroundColor: config.colorScheme });
  const [detailStyle, setDetailStyle] = useState({});

  const [serverIp, setServerIp] = useState('');
  const [serverPort, setServerPort] = useState('');

  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [hasConnected, setHasConnected] = useState(false);

  const { websocket, connectWebSocket } = WebSocketManager({
    serverIp,
    serverPort,
    onMessage: (data) => {
      if (data === "Monitor check successful" || data === "Hello Server!") {
        setConnectionStatus('Connected');
      } else {
        // 处理其他类型的消息
        console.log('Broadcast message:', data);
      }
    },
    onError: (error) => {
      console.error('WebSocket Error:', error);
      setConnectionStatus('Error');
    },
    onClose: () => {
      console.log('WebSocket closed');
      setConnectionStatus('Disconnected');
    }
  });

  useKeyboardShortcuts(isVisible, setIsVisible, adjustIndex, () => writeToClipboard(items[index].toString()));

  useEffect(() => {
    setMaxLength(config.maxLength); // Update when config changes
  }, [config.maxLength]);

  useEffect(() => {
    // Update main style directly with colorScheme
    setMainStyle({ backgroundColor: config.colorScheme });

    // Convert HEX to HSL and adjust for detail style
    const hslColor = hexToHSL(config.colorScheme);
    const { h, s, l } = hslColor;

    const detailHSL = `hsl(${h}, ${Math.min(100, s + 15)}%, ${Math.max(0, l + 20)}%)`;
    setDetailStyle({ backgroundColor: isExpanded ? detailHSL : 'transparent' });
  }, [config.colorScheme, isVisible, isExpanded]);

  // 监听 Tauri 事件并更新 IP 和端口
  useEffect(() => {
    const unlisten = listen('server-details', (event) => {
      console.log('Received server details:', event.payload);
      const match = event.payload.match(/ws:\/\/(.+):(\d+)/);
      if (match) {
        const [_, ip, port] = match;
        setServerIp(ip);
        setServerPort(port);
      }
    });

    return () => {
      unlisten.then((func) => func());
    };
  }, []);

  useEffect(() => {
    if (serverIp && serverPort && !hasConnected) {
      connectWebSocket();
      setHasConnected(true);  // 设置标记为已连接，防止未来重连
    }
  }, [serverIp, serverPort, connectWebSocket, hasConnected]);

  useEffect(() => {
    // 监听 items[0] 的变化
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(items[0]);
      console.log(`Sent to server: ${items[0]}`);
    }
  }, [items[0], websocket]);  // 添加 websocket 作为依赖，以确保使用最新的连接

  useEffect(() => {
    let intervalId;
    if (isExpanded && websocket && websocket.readyState === WebSocket.OPEN) {
      intervalId = setInterval(() => {
        console.log('Sending monitor check');
        websocket.send('monitor check');  // Replace 'monitor check' with your actual monitoring message
      }, 6000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isExpanded, websocket]);

  const toggleWindowSize = () => {
    const expanded = windowSize.height === 100;
    const newHeight = expanded ? 300 : 100;
    const newSize = new LogicalSize(windowSize.width, newHeight);
    appWindow.setSize(newSize)
      .then(() => {
        setWindowSize(newSize);
        setIsExpanded(expanded);
      })
      .catch(error => console.error('Failed to set window size:', error));
  };

  const handleServerDetailsChange = () => {
    const newIp = serverIp
    const newPort = serverPort
    console.log(`Updated server details: ${newIp}:${newPort}`);
    setServerIp(newIp);
    setServerPort(newPort);

    connectWebSocket();
  };

  const handleSetAsServerClick = (ip, port) => {
    console.log(`Set as server with details: ${ip}:${port}`);
    // 实现设置服务器逻辑
  };

  return (
    <NotificationProvider>
      <div
        onDoubleClick={toggleWindowSize}
        data-tauri-drag-region
        style={detailStyle}
        className={`flex flex-col w-full h-screen z-0 overflow-hidden rounded-xl transition-opacity ease-in-out duration-500 ${isVisible ? '' : 'opacity-0 pointer-events-none relative'}`}
      >
        <div
          data-tauri-drag-region
          style={mainStyle}
          className={`flex flex-col w-screen ${isExpanded ? "h-1/3" : "h-screen"} z-10 max-h-200 p-2 text-ellipsis overflow-hidden items-center justify-center rounded-xl relative`}
        >
          <NotificationBar />
          <h1 data-tauri-drag-region className="w-full h-full text-base font-bold line-clamp-3 p-2">{items[0]}</h1>
        </div>

        <div className={`flex-grow no-scrollbar overflow-y-scroll transition-opacity duration-500 ease-in-out ${isExpanded ? 'animate-slide-down' : 'animate-collapse-zoom'}`}>
          {isExpanded && <Settings connectionStatus={connectionStatus} serverIp={serverIp} serverPort={serverPort} setServerIp={setServerIp} setServerPort={setServerPort} onServerDetailsChange={handleServerDetailsChange} onSetAsServerClick={handleSetAsServerClick} />}
        </div>
      </div>
    </NotificationProvider>
  );
}

export default App;
