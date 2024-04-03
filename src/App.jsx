import React, { useState, useEffect } from 'react';
import copyImg from '/assets/copy.png';
import checkImg from '/assets/check.png';
import AppModal from './AppModal';
const { clipboard, ipcRenderer } = window.electron;


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

  // 更新剪贴板历史和系统剪贴板的逻辑
  // 从Electron主进程接收剪贴板更新
  useEffect(() => {
    const updateClipboardHistory = (data) => {
      setClipboardHistory(prevHistory => {
        console.log("12434234------------------")
        const textIndex = prevHistory.indexOf(data);
        if (textIndex === -1) {
          // 如果接收到的文本不存在于历史中，添加到历史并可能更新系统剪贴板
          let newHistory = [data, ...prevHistory];
          if (newHistory.length > maxHistoryLength) {
            newHistory = newHistory.slice(0, maxHistoryLength); // 保留最新的条目
          }
          // 可选：更新系统剪贴板内容
          window.electron.writeClipboardText(data);
          return newHistory;
        } else if (textIndex > 0) {
          // 如果文本已存在但不在队首，移动到队首
          let updatedHistory = [data, ...prevHistory.filter((_, index) => index !== textIndex)];
          window.electron.writeClipboardText(data);
          return updatedHistory;
        }
        // 如果文本已存在且已在队首，或其他情况，不更新
        return prevHistory;
      });
    };

    ipcRenderer.on('clipboard-update', updateClipboardHistory);

    return () => {
      ipcRenderer.removeAllListeners('clipboard-update');
    };
  }, [clipboardHistory, maxHistoryLength]);



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
      const text = window.electron.readClipboardText();
      const trimmedText = text.trim(); // 用于检查的去除空白的临时变量

      if (trimmedText) {
        setClipboardHistory(prevHistory => {
          const textIndex = prevHistory.indexOf(text);
          if (textIndex === -1) {
            // 如果text不存在，添加到历史中，并且通过socket发送消息
            let newHistory = [text, ...prevHistory]; // 先添加到数组开始
            if (newHistory.length > maxHistoryLength) {
              newHistory.pop(); // 移除最旧的项（现在是数组的末尾）
            }

            ipcRenderer.send('broadcast-clipboard', text); // 只在新条目添加时发送

            return newHistory;
          } else if (textIndex === 0) {
            // 如果text已存在且已经在队首，不进行任何操作
            return prevHistory;
          } else {
            // 如果text已存在，但不在队首，移动到队首
            let updatedHistory = [...prevHistory];
            updatedHistory.splice(textIndex, 1); // 先移除
            updatedHistory.unshift(text); // 然后添加到数组开始
            ipcRenderer.send('broadcast-clipboard', text); // 只在新条目添加时发送
            return updatedHistory;
          }
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [clipboardHistory]);





  // 复制文本到剪贴板的函数
  const copyToClipboard = (text, index) => {
    window.electron.writeClipboardText(text); // 使用预加载脚本暴露的方法
    setCopiedIndex(index); // 设置复制的项索引
    setTimeout(() => setCopiedIndex(null), 500); // 两秒后清除索引
  };

  // 判断操作系统
  const osShortcut = window.electron.platform === 'darwin' ? 'Command+Shift+C' : 'Ctrl+Shift+C';



  return (
    <div className="flex flex-col h-full p-5 overflow-auto">
      {/* 剪贴板历史内容显示区域 */}
      <div className="space-y-4">
        {clipboardHistory.map((item, index) => (
          <div
            key={index}
            className="group relative p-4 bg-white rounded-lg shadow cursor-pointer"
            onClick={() => copyToClipboard(item, index)}
          >
            <p className="text-gray-800 line-clamp-1 group-hover:text-gray-200">{item}</p>
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

      {/* 固定在视图底部前面的快捷键提示信息 */}
      <div className="text-center fixed bottom-0 left-0 right-0 p-4 bg-opacity-50 text-slate-300">
        <p>Press <span className="font-bold">{osShortcut}</span> to open clipboard history.</p>
      </div>

      <AppModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />

    </div>
  );
}

export default App;