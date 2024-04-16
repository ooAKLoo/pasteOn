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
  const [windowSize, setWindowSize] = useState(new LogicalSize(400, 100));
  const [isExpanded, setIsExpanded] = useState(false);
  const [websocket, setWebSocket] = useState(null);
  const { config } = useConfig();
  const [maxLength, setMaxLength] = useState(config.maxLength);
    // 确保在状态中初始化style
  const [mainStyle, setMainStyle] = useState({ backgroundColor: config.colorScheme });
  const [detailStyle, setDetailStyle] = useState({ backgroundColor: 'transparent' });
  const { items, adjustIndex } = ItemsManager({ isVisible, setIsVisible, writeToClipboard, readFromClipboard, maxLength });


  useKeyboardShortcuts(isVisible, setIsVisible, adjustIndex, () => writeToClipboard(items[index].toString()));

  useEffect(() => {
    setMaxLength(config.maxLength); // Update when config changes
  }, [config.maxLength]);

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
  useEffect(() => {
    const hslColor = hexToHSL(config.colorScheme);
  
    // 假设我们调整饱和度和亮度来区分主要风格和细节风格
    const hslParts = hslColor.match(/hsl\((\d+), (\d+)%, (\d+)%\)/);
    const h = hslParts[1];
    let s = parseInt(hslParts[2], 10);
    let l = parseInt(hslParts[3], 10);
  
    // 主风格稍微提亮和降低饱和度
    const mainHSL = `hsl(${h}, ${s - 10}%, ${l + 10}%)`;
    // 细节风格稍微提高饱和度和降低亮度
    const detailHSL = `hsl(${h}, ${s + 10}%, ${l - 10}%)`;
  
    setMainStyle({ backgroundColor: isVisible ? mainHSL : 'transparent' });
    setDetailStyle({ backgroundColor: isExpanded ? detailHSL : 'transparent' });
  
  }, [config.colorScheme, isVisible, isExpanded]);
  

  return (
    <NotificationProvider>
      <div
        onDoubleClick={toggleWindowSize}
        data-tauri-drag-region
        // style={mainStyle}
        className={`flex flex-col w-full h-screen z-0 overflow-hidden rounded-xl transition-opacity ease-in-out duration-500 ${isVisible ? ' bg-green-400' : 'opacity-0 pointer-events-none relative'}`}
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
