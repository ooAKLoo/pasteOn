import React, { useState, useEffect } from 'react';
import ItemsManager from './models/itemsManager';
import { useKeyboardShortcuts } from './hook/useKeyboardShortcuts';
import { useClipboard } from './hook/useClipboard';
import { appWindow, LogicalSize } from '@tauri-apps/api/window';
import Settings from './views/Settings';

function App() {
  const [isVisible, setIsVisible] = useState(true);
  const { writeToClipboard, readFromClipboard } = useClipboard();
  const MAX_LENGTH = 5;  // Define the maximum length of the items array
  const [windowSize, setWindowSize] = useState(new LogicalSize(400, 100));
  const [isExpanded, setIsExpanded] = useState(false);  // New state to control the expanded area

  const { items, adjustIndex } = ItemsManager({ isVisible, setIsVisible, writeToClipboard, readFromClipboard, MAX_LENGTH });

  useEffect(() => {
    appWindow.setIgnoreCursorEvents(!isVisible)
      .then(() => console.log(`Cursor events are now ${isVisible ? 'ignored' : 'processed'}.`))
      .catch(error => console.error('Failed to set cursor events:', error));
  }, [isVisible]);

  useKeyboardShortcuts(isVisible, setIsVisible, adjustIndex, () => writeToClipboard(items[index].toString()));

  const toggleWindowSize = () => {
    const expanded = windowSize.height === 100; // Check if the window is in minimized state
    const newHeight = expanded ? 300 : 100;  // Expand if minimized, minimize if expanded
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
        className={`flex flex-col w-full ${isExpanded ? "h-1/3":"h-screen"} z-10 max-h-200 p-2 text-ellipsis overflow-hidden  items-center justify-center bg-red-400 rounded-xl`}
      >
        <h1 className=" text-base font-bold line-clamp-3">{items[0]}</h1>
      </div>

      <div className={`flex-grow no-scrollbar overflow-y-scroll transition-opacity duration-500 ease-in-out ${isExpanded ? 'transform-none' : 'transform scale-y-0'}`}>
        {isExpanded && <Settings />}
      </div>
    </div>
  );
}

export default App;