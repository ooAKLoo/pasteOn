import React, { useState,useEffect } from 'react';
import { useKeyboardShortcuts } from './hook/useKeyboardShortcuts ';
import { appWindow } from '@tauri-apps/api/window';

function App() {
  const [isVisible, setIsVisible] = useState(true);
  const [index, setIndex] = useState(0);
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const adjustIndex = direction => {
    setIndex(prevIndex => (prevIndex + direction + numbers.length) % numbers.length);
  };

  useEffect(() => {
    appWindow.setIgnoreCursorEvents(!isVisible)
      .then(() => console.log(`Cursor events are now ${isVisible ? 'ignored' : 'processed'}.`))
      .catch(error => console.error('Failed to set cursor events:', error));
  }, [isVisible]);

  useKeyboardShortcuts(isVisible,setIsVisible, adjustIndex); // Use the custom hook

  return (
    <div data-tauri-drag-region className={`flex flex-col items-center justify-center h-screen ${isVisible ? 'bg-red-400' : 'opacity-0 pointer-events-none'} transition-opacity ease-in-out duration-500 rounded-3xl`}>
      <h1 className="text-4xl font-bold">{numbers[index]}</h1>
    </div>
  );
}

export default App;
