import React, { useState, useEffect } from 'react';
import copyImg from '../public/assets/copy.png';
import checkImg from '../public/assets/check.png';
import AppModal from './AppModal';
const { clipboard } = window.require('electron');
const { ipcRenderer } = window.require('electron');

function App() {
  const [clipboardHistory, setClipboardHistory] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [maxHistoryLength, setMaxHistoryLength] = useState(5); // 默认最大长度

    // 定义回调函数
    const openMaxLengthDialog = () => {
      setShowModal(true);
    };


// App.js
useEffect(() => {
  const handleRequestClipboardHistory = () => {
    ipcRenderer.send('send-clipboard-history', clipboardHistory);
  };

  // 监听来自 main.js 的请求
  ipcRenderer.on('request-clipboard-history', handleRequestClipboardHistory);

  // 清除监听器
  return () => {
    ipcRenderer.removeListener('request-clipboard-history', handleRequestClipboardHistory);
  };
}, [clipboardHistory]); // 添加 clipboardHistory 作为依赖


// App.js
useEffect(() => {
  const handleCopyFromHistory = (event, text) => {
    if (clipboardHistory.includes(text)) {
      const updatedHistory = clipboardHistory.filter(item => item !== text);
      updatedHistory.push(text); // 将选中的文本移动到数组末尾
      setClipboardHistory(updatedHistory); // 更新状态
    }
  };
  
  ipcRenderer.on('copy-from-history', handleCopyFromHistory);
  
  // 在组件卸载时，清除监听器
  return () => {
    ipcRenderer.removeListener('copy-from-history', handleCopyFromHistory);
  };
  
}, [clipboardHistory]);


  
  useEffect(() => {
    const savedMaxLength = localStorage.getItem("maxHistoryLength");
    if (savedMaxLength) {
      setMaxHistoryLength(parseInt(savedMaxLength, 10));
    }
  
    ipcRenderer.on('open-max-length-dialog', openMaxLengthDialog);

    // 清除监听器
    return () => {
      ipcRenderer.removeListener('open-max-length-dialog', openMaxLengthDialog);
    };
  }, []);
  

  useEffect(() => {
    const interval = setInterval(() => {
      const text = clipboard.readText();
      const trimmedText = text.trim(); // 用于检查的去除空白的临时变量
  
      if (trimmedText) { // 检查去除空白后的text是否为空
        setClipboardHistory(prevHistory => {
          // 检查原始text是否已经存在于clipboardHistory中
          if (!prevHistory.includes(text)) {
            let newHistory = [...prevHistory, text]; // 使用原始text
            if (newHistory.length > maxHistoryLength) {
              newHistory.shift(); // 移除最旧的项
            }
            return newHistory;
          } else {
            return prevHistory; // 如果text已存在，保持当前历史不变
          }
        });
      }
    }, 1000);
  
    return () => clearInterval(interval);
  }, [clipboardHistory]);
  



  // 复制文本到剪贴板的函数
  const copyToClipboard = (text, index) => {
    clipboard.writeText(text);
    setCopiedIndex(index); // 设置复制的项索引
    setTimeout(() => setCopiedIndex(null), 500); // 两秒后清除索引
  };

  return (
    <div className="flex flex-col h-full p-5 overflow-auto">
      <div className="space-y-4">
        {clipboardHistory.map((item, index) => (
          <div 
            key={index} 
            className="group relative p-4 bg-white rounded-lg border-2 border-stone-600 hover:border-transparent hover:shadow cursor-pointer"
            onClick={() => copyToClipboard(item, index)}
          >
            <p className="text-gray-800 line-clamp-3 group-hover:text-gray-400">{item}</p>
            {/* 根据复制状态显示复制图标或复制成功图标 */}
            <span className="absolute top-1/2 right-4 transform -translate-y-1/2 opacity-0 group-hover:opacity-100">
              {copiedIndex === index ? (
                <img src={checkImg} alt="Check" className="w-6 h-6" />
              ) : (
                <img src={copyImg} alt="Copy" className="w-4 h-4" />
              )}
            </span>
          </div>
        ))}
      </div>

<AppModal 
  isOpen={showModal} 
  onClose={() => setShowModal(false)} 
/>

    </div>
  );
}

export default App;
