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


function App() {
  const [isVisible, setIsVisible] = useState(true);
  const { writeToClipboard, readFromClipboard } = useClipboard();
  const [windowSize, setWindowSize] = useState(new LogicalSize(400, 100));
  const [isExpanded, setIsExpanded] = useState(false);
  const [websocket, setWebSocket] = useState(null);
  const { config } = useConfig();
  const [maxLength, setMaxLength] = useState(config.maxLength);
  const { items, adjustIndex } = ItemsManager({ writeToClipboard, readFromClipboard, maxLength });

  // Main and detail styles initialized
  const [mainStyle, setMainStyle] = useState({ backgroundColor: config.colorScheme });
  const [detailStyle, setDetailStyle] = useState({});

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

  useEffect(() => {
    const unlisten = listen('server-details', (event) => {
      const ws = new WebSocket(`${event.payload}`);
      ws.onopen = function() {
        console.log('Connected');
        ws.send('Hello Server!');
      };
      ws.onmessage = function(event) {
        console.log('Received: ' + event.data);
      };
      ws.onclose = function() {
        console.log('Disconnected');
      };
      setWebSocket(ws);
    });

    return () => {
      unlisten.then((func) => func());
      if (websocket) {
        websocket.close();
      }
    };
  }, []);  // 注意添加 websocket 到依赖数组中，如果它是动态变化的

  useEffect(() => {
    // 监听 items[0] 的变化
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(items[0]);
      console.log(`Sent to server: ${items[0]}`);
    }
  }, [items[0], websocket]);  // 添加 websocket 作为依赖，以确保使用最新的连接

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
          {isExpanded && <Settings />}
        </div>
      </div>
    </NotificationProvider>
  );
}

export default App;
