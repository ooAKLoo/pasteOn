import React, { useState, useEffect } from 'react';
import { globalShortcut } from '@tauri-apps/api';

function App() {
  const [isVisible, setIsVisible] = useState(true); // 控制可见性的状态

  useEffect(() => {
    // 监听 isVisible 状态的变化
    console.log('Visibility changed:', isVisible);
  }, [isVisible]); // 依赖项数组中加入 isVisible，只有当 isVisible 改变时才触发

  useEffect(() => {
    // 注册快捷键
    const registerShortcut = async () => {
      const success = await globalShortcut.register('Control+Shift+A', () => {
        console.log('Global shortcut Control+Shift+A was pressed!');
        toggleVisibility();
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

  function toggleVisibility() {
    setIsVisible(prevState => !prevState); // 切换可见性状态，使用函数式更新确保总是基于最新状态
  }

  return (
    <div data-tauri-drag-region className={`flex flex-col items-center justify-center h-screen ${isVisible ? ' opacity-0 pointer-events-none' : 'bg-red-400'} transition-opacity ease-in-out duration-500 rounded-3xl`}>
      <h1 className="text-4xl font-bold">
        Hello, Tauri!
      </h1>
    </div>
  );
}

export default App;
