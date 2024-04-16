import React, { useState, useEffect } from 'react';
import { NotificationProvider } from './hook/NotificationContext';
import NotificationBar from './views/NotificationBar';
import ItemsManager from './models/itemsManager';
import { useKeyboardShortcuts } from './hook/useKeyboardShortcuts';
import { useClipboard } from './hook/useClipboard';
import { appWindow, LogicalSize } from '@tauri-apps/api/window';
import Settings from './views/Settings';
import { useConfig } from './hook/ConfigContext ';

function App() {
  const [isVisible, setIsVisible] = useState(true);
  const { writeToClipboard, readFromClipboard } = useClipboard();
  const MAX_LENGTH = 5;
  const [windowSize, setWindowSize] = useState(new LogicalSize(400, 100));
  const [isExpanded, setIsExpanded] = useState(false);
  const [websocket, setWebSocket] = useState(null);
  const { config } = useConfig();
  const { items, adjustIndex } = ItemsManager({ isVisible, setIsVisible, writeToClipboard, readFromClipboard, MAX_LENGTH });


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
  // 使用 useEffect 监听 colorScheme 的变化，并更新 className
  const mainStyle = {
    backgroundColor: isVisible ? config.colorScheme : 'transparent', // Use 'transparent' to handle the 'opacity-0 pointer-events-none'
  };

  const detailStyle = {
    backgroundColor: isExpanded ? config.colorScheme : '#ff0000' // Assume 'bg-red-400' translates to '#ff0000'
  };
  useEffect(() => {
    console.log('config.colorScheme--------------',config.colorScheme, isVisible, isExpanded);
    const mainStyle = {
      backgroundColor: isVisible ? config.colorScheme : 'transparent', // Use 'transparent' to handle the 'opacity-0 pointer-events-none'
    };
  
    const detailStyle = {
      backgroundColor: isExpanded ? config.colorScheme : '#ff0000' // Assume 'bg-red-400' translates to '#ff0000'
    };
    // 假设你有一种方法可以更新背景颜色，这里只是示例
    // updateBackgroundColors(mainBgColor, detailBgColor); 可能需要你实际实现
  }, [config.colorScheme, isVisible, isExpanded]); // 确保添加所有依赖
return (
    <NotificationProvider>
      <div
        onDoubleClick={toggleWindowSize}
        data-tauri-drag-region
        style={mainStyle}
        className={`flex flex-col w-full h-screen z-0 overflow-hidden rounded-xl transition-opacity ease-in-out duration-500`}
      > 
        <div
          data-tauri-drag-region
          style={detailStyle}
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
