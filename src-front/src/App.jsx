import React, { useState, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';  // 确保正确导入 Tauri 的事件监听函数
import ItemsManager from './models/itemsManager';
import { useKeyboardShortcuts } from './hook/useKeyboardShortcuts';
import { useClipboard } from './hook/useClipboard';
import { appWindow, LogicalSize } from '@tauri-apps/api/window';
import Settings from './views/Settings';

function App() {
  const [isVisible, setIsVisible] = useState(true);
  const { writeToClipboard, readFromClipboard } = useClipboard();
  const MAX_LENGTH = 5;
  const [windowSize, setWindowSize] = useState(new LogicalSize(400, 100));
  const [isExpanded, setIsExpanded] = useState(false);
  const [websocket, setWebSocket] = useState(null);

  const { items, adjustIndex } = ItemsManager({ isVisible, setIsVisible, writeToClipboard, readFromClipboard, MAX_LENGTH });

  useEffect(() => {
    console.log("12312312")
    // 监听 items[0] 的变化
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(items[0]);
      console.log(`Sent to server: ${items[0]}`);
    }
  }, [items[0], websocket]);  // 添加 websocket 作为依赖，以确保使用最新的连接

  useEffect(() => {
    appWindow.setIgnoreCursorEvents(!isVisible)
      .then(() => console.log(`Cursor events are now ${isVisible ? 'ignored' : 'processed'}.`))
      .catch(error => console.error('Failed to set cursor events:', error));
  }, [isVisible]);

  useEffect(() => {
    const unlisten = listen('server-details', (event) => {
      console.log('Received server details:', event.payload);
      const wsAddress = `ws://${event.payload.ip}:${event.payload.port}`;
    console.log("Attempting to connect to WebSocket server at:", wsAddress);
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

  useKeyboardShortcuts(isVisible, setIsVisible, adjustIndex, () => writeToClipboard(items[index].toString()));

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
    <div
      onDoubleClick={toggleWindowSize}
      data-tauri-drag-region
      className={`flex flex-col w-full h-screen z-0 overflow-hidden rounded-xl transition-opacity ease-in-out duration-500  ${isVisible ? 'bg-red-200' : 'opacity-0 pointer-events-none'}`}
    >
      <div
        data-tauri-drag-region
        className={`flex flex-col w-screen ${isExpanded ? "h-1/3":"h-screen"} z-10 max-h-200 p-2 text-ellipsis overflow-hidden  items-center justify-center bg-red-400 rounded-xl`}
      >
        <h1 data-tauri-drag-region className=" w-full h-full text-base font-bold line-clamp-3 p-2">{items[0]}</h1>
      </div>

      <div className={`flex-grow no-scrollbar overflow-y-scroll transition-opacity duration-500 ease-in-out ${isExpanded ? ' animate-slide-down' : 'animate-collapse-zoom'}`}>
        {isExpanded && <Settings />}
      </div>
    </div>
  );
}

export default App;
