// function App() {
//   return (
//     <div data-tauri-drag-region className="flex items-center justify-center h-screen bg-red-400 rounded-3xl">
//       <h1 className="text-4xl font-bold">Hello, Tauri!</h1>
//     </div>
//   );
// }

// export default App;
import React, { useEffect } from 'react';
import { invoke, globalShortcut } from '@tauri-apps/api';

function App() {
  useEffect(() => {
    // 注册快捷键
    const registerShortcut = async () => {
      const success = await globalShortcut.register('Control+Shift+A', () => {
        console.log('Global shortcut Control+Shift+A was pressed!');
        toggleWindowVisibility();
      });
      if (success) {
        console.log('Shortcut registered successfully');
      } else {
        console.log('Failed to register shortcut');
      }
    };

    // 注销快捷键
    const unregisterShortcut = async () => {
      await globalShortcut.unregister('Control+Shift+A');
      console.log('Shortcut unregistered');
    };

    registerShortcut();
    return () => {
      unregisterShortcut();
    };
  }, []);

  function toggleWindowVisibility() {
    invoke('toggle_window_visibility');
  }

  return (
    <div data-tauri-drag-region className="flex flex-col items-center justify-center h-screen bg-red-400 rounded-3xl">
      <h1 className="text-4xl font-bold">Hello, Tauri!</h1>
      <button 
        className="mt-4 px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-700"
        onClick={toggleWindowVisibility}
      >
        Toggle Window Visibility
      </button>
    </div>
  );
}

export default App;
