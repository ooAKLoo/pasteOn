import React, { useState, useEffect } from 'react';
import { useKeyboardShortcuts } from './hook/useKeyboardShortcuts';
import { useClipboard } from './hook/useClipboard';
import { appWindow } from '@tauri-apps/api/window';

function App() {
  const [isVisible, setIsVisible] = useState(true);
  const [index, setIndex] = useState(0);
  const [items, setItems] = useState(["1", "2", "3"]);  // Initial content
  const { writeToClipboard, readFromClipboard } = useClipboard();
  const MAX_LENGTH = 5;  // Define the maximum length of the items array

  const adjustIndex = direction => {
    setIndex(prevIndex => {
      const newIndex = (prevIndex + direction + items.length) % items.length;
      writeToClipboard(items[newIndex].toString());
      return newIndex;
    });
  };
  useEffect(() => {
    console.log('组件挂载');
  
    return () => {
      console.log('组件卸载');
    };
  }, []);
  
  useEffect(() => {
    const intervalId = setInterval(async () => {
      const text = await readFromClipboard();
      if (text) {
        const trimmedText = text.trim();
        if (trimmedText) {
          writeToClipboard(text);
          setItems(prevItems => {
            const existingIndex = prevItems.indexOf(text);
            let newItems = [...prevItems];
            if (existingIndex !== -1) {
              // Remove the item and add it to the front if it already exists
              newItems.splice(existingIndex, 1);
            }
            // Add the new or moved item to the front
            newItems = [text, ...newItems];
            // Slice to maintain maximum length
            return newItems.slice(0, MAX_LENGTH);
          });
        }
      }
    }, 1000); // Check clipboard every second

    return () => clearInterval(intervalId);
  }, []); 
  
  useEffect(() => {
    appWindow.setIgnoreCursorEvents(!isVisible)
      .then(() => console.log(`Cursor events are now ${isVisible ? 'ignored' : 'processed'}.`))
      .catch(error => console.error('Failed to set cursor events:', error));
  }, [isVisible]);

  useKeyboardShortcuts(isVisible, setIsVisible,setIndex, adjustIndex, () => writeToClipboard(items[index].toString()));

  return (
    <div data-tauri-drag-region className={`flex flex-col min-h-screen p-2 text-ellipsis overflow-hidden  items-center justify-center ${isVisible ? 'bg-red-400' : 'opacity-0 pointer-events-none'} transition-opacity ease-in-out duration-500 rounded-xl`}>
      <h1 className=" text-base font-bold line-clamp-3">{items[index]}</h1>
    </div>
  );
}

export default App;
