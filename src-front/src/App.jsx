import React, { useState, useEffect } from 'react';
import { useKeyboardShortcuts } from './hook/useKeyboardShortcuts';
import { useClipboard } from './hook/useClipboard';
import { appWindow } from '@tauri-apps/api/window';

function App() {
  const [isVisible, setIsVisible] = useState(true);
  const [items, setItems] = useState(["1", "2", "3"]);  // Initial content
  const { writeToClipboard, readFromClipboard } = useClipboard();
  const MAX_LENGTH = 5;  // Define the maximum length of the items array

  const adjustIndex = (direction) => {
    setItems(currentItems => {
      console.log(` Direction: ${direction} Items: ${currentItems}`);
      const newIndex = (direction + currentItems.length) % currentItems.length;
      console.log(`New index: ${newIndex}`);
      const newItems = rotateArray(currentItems, newIndex);
      writeToClipboard(newItems[0]); // Update clipboard with the new first item
      return newItems;
    });
  };

  // Rotate the array so that the element at 'newIndex' is moved to the front
  const rotateArray = (array, newIndex) => {
    if (newIndex === 0) return array; // No rotation needed if the new index is already 0
    return [...array.slice(newIndex), ...array.slice(0, newIndex)];
  };

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const text = await readFromClipboard();
      const trimmedText = text.trim();
      if (trimmedText) {
        setItems(prevItems => {
          const existingIndex = prevItems.indexOf(text);
          let newItems = [...prevItems];
          if (existingIndex !== -1) {
            // 如果元素已经存在于数组中，则将其移动到数组首位
            newItems.splice(existingIndex, 1);  // 先从当前位置删除
          }
          newItems.unshift(text);  // 不管是否存在，都添加到数组首位
          if (newItems.length > MAX_LENGTH) {
            newItems = newItems.slice(0, MAX_LENGTH);  // 维护数组的最大长度
          }
          return newItems;
        });
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);


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
