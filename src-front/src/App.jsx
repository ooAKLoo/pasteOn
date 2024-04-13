import React, { useState, useEffect } from 'react';
import ItemsManager from './models/itemsManager';
import { useKeyboardShortcuts } from './hook/useKeyboardShortcuts';
import { useClipboard } from './hook/useClipboard';
import { appWindow, LogicalSize  } from '@tauri-apps/api/window';

function App() {
  const [isVisible, setIsVisible] = useState(true);
  const { writeToClipboard, readFromClipboard } = useClipboard();
  const MAX_LENGTH = 5;  // Define the maximum length of the items array
  const [windowSize, setWindowSize] = useState(new LogicalSize(400, 100));

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
      })
      .catch(error => console.error('Failed to set window size:', error));
  };

  return (
    <div
      onDoubleClick={toggleWindowSize}
      data-tauri-drag-region
      className={`flex flex-col min-h-screen p-2 text-ellipsis overflow-hidden  items-center justify-center ${isVisible ? 'bg-red-400' : 'opacity-0 pointer-events-none'} transition-opacity ease-in-out duration-500 rounded-xl`}
    >
      <h1 className=" text-base font-bold line-clamp-3">{items[0]}</h1>
    </div>
  );
}

export default App;