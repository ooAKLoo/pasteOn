import React, { useState, useEffect } from 'react';
import ItemsManager from './models/itemsManager';
import { useKeyboardShortcuts } from './hook/useKeyboardShortcuts';
import { useClipboard } from './hook/useClipboard';
import { appWindow } from '@tauri-apps/api/window';

function App() {
  const [isVisible, setIsVisible] = useState(true);
  const { writeToClipboard, readFromClipboard } = useClipboard();
  const MAX_LENGTH = 5;  // Define the maximum length of the items array

  const { items, adjustIndex } = ItemsManager({ isVisible, setIsVisible, writeToClipboard, readFromClipboard, MAX_LENGTH });

  useEffect(() => {
    appWindow.setIgnoreCursorEvents(!isVisible)
      .then(() => console.log(`Cursor events are now ${isVisible ? 'ignored' : 'processed'}.`))
      .catch(error => console.error('Failed to set cursor events:', error));
  }, [isVisible]);

  useKeyboardShortcuts(isVisible, setIsVisible, adjustIndex, () => writeToClipboard(items[index].toString()));

  return (
    <div data-tauri-drag-region className={`flex flex-col min-h-screen p-2 text-ellipsis overflow-hidden  items-center justify-center ${isVisible ? 'bg-red-400' : 'opacity-0 pointer-events-none'} transition-opacity ease-in-out duration-500 rounded-xl`}>
      <h1 className=" text-base font-bold line-clamp-3">{items[0]}</h1>
    </div>
  );
}

export default App;