import React, { useState, useEffect } from 'react';
import { globalShortcut } from '@tauri-apps/api';
import { appWindow } from '@tauri-apps/api/window';

// NumberDisplay Component (View)
const NumberDisplay = ({ number }) => (
  <div className="text-4xl font-bold">{number}</div>
);

// App Component (Controller)
function App() {
  const [isVisible, setIsVisible] = useState(true);
  const [index, setIndex] = useState(0);
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  useEffect(() => {
    console.log('Visibility changed:', isVisible);
    appWindow.setIgnoreCursorEvents(!isVisible)
      .then(() => console.log(`Cursor events are now ${isVisible ? 'ignored' : 'processed'}.`))
      .catch(error => console.error('Failed to set cursor events:', error));

    setupArrowKeys(isVisible);
  }, [isVisible]);

  useEffect(() => {
    registerVisibilityToggle();
    return () => {
      globalShortcut.unregister('Control+Shift+A');
      console.log('Control+Shift+A shortcut unregistered');
    };
  }, []);

  function registerVisibilityToggle() {
    globalShortcut.register('Control+Shift+A', () => {
      console.log('Global shortcut Control+Shift+A was pressed!');
      setIsVisible(prev => !prev);
    });
  }

  function setupArrowKeys(active) {
    if (active) {
      registerArrows();
    } else {
      unregisterArrows();
    }
  }

  const registerArrows = async () => {
    await globalShortcut.register('Up', () => adjustIndex(-1));
    await globalShortcut.register('Down', () => adjustIndex(1));
  };

  const unregisterArrows = async () => {
    await globalShortcut.unregister('Up');
    await globalShortcut.unregister('Down');
  };

  function adjustIndex(direction) {
    setIndex(prevIndex => (prevIndex + direction + numbers.length) % numbers.length);
  }

  return (
    <div data-tauri-drag-region className={`flex flex-col items-center justify-center h-screen ${isVisible ? 'bg-blue-400' : 'opacity-0 pointer-events-none'} transition-opacity ease-in-out duration-500 rounded-3xl`}>
      <NumberDisplay number={numbers[index]} />
    </div>
  );
}

export default App;
