import React, { useState, useEffect, useRef } from 'react';
import copyImg from '/assets/copy.png';
import checkImg from '/assets/check.png';
import AppModal from './AppModal';
import LoadingSpinner from './modfier/LoadingSpinner';
const { ipcRenderer } = window.electron;


function App() {
  const [connectionStatus, setConnectionStatus] = useState('连接状态未知');

  const [clipboardHistory, setClipboardHistory] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [maxHistoryLength, setMaxHistoryLength] = useState(5); // 默认最大长度

  const [showConnectionStatus, setShowConnectionStatus] = useState(true);

  const openMaxLengthDialog = () => {
    setShowModal(true);
  };

  const clipboardHistoryRef = useRef(clipboardHistory);

  useEffect(() => {
    clipboardHistoryRef.current = clipboardHistory;
  }, [clipboardHistory]);

  useEffect(() => {
    const handleRequestClipboardHistory = () => {
      ipcRenderer.send('send-clipboard-history', clipboardHistoryRef.current);
    };

    ipcRenderer.on('request-clipboard-history', handleRequestClipboardHistory);

    return () => {
      ipcRenderer.removeListener('request-clipboard-history', handleRequestClipboardHistory);
    };
  }, []);

  useEffect(() => {
    const handleCopyFromHistory = (event, text) => {
      if (clipboardHistoryRef.current.includes(text)) {
        const updatedHistory = clipboardHistoryRef.current.filter(item => item !== text);
        updatedHistory.push(text);
        setClipboardHistory(updatedHistory);
      }
    };

    ipcRenderer.on('copy-from-history', handleCopyFromHistory);

    return () => {
      ipcRenderer.removeListener('copy-from-history', handleCopyFromHistory);
    };
  }, []);

  // 从Electron主进程接收剪贴板更新
  useEffect(() => {
    const updateClipboardHistory = (data) => {
      setClipboardHistory(prevHistory => {
        const textIndex = prevHistory.indexOf(data);
        if (textIndex === -1) {
          let newHistory = [data, ...prevHistory];
          if (newHistory.length > maxHistoryLength) {
            newHistory = newHistory.slice(0, maxHistoryLength);
          }
          window.electron.writeClipboardText(data);
          return newHistory;
        } else if (textIndex > 0) {
          let updatedHistory = [data, ...prevHistory.filter((_, index) => index !== textIndex)];
          window.electron.writeClipboardText(data);
          return updatedHistory;
        }
        return prevHistory;
      });
    };

    ipcRenderer.on('ipc-clipboard-update', updateClipboardHistory);

    return () => {
      ipcRenderer.removeAllListeners('ipc-clipboard-update');
    };
  }, [clipboardHistory, maxHistoryLength]);


  useEffect(() => {
    const savedMaxLength = localStorage.getItem("maxHistoryLength");
    if (savedMaxLength) {
      setMaxHistoryLength(parseInt(savedMaxLength, 10));
    }

    ipcRenderer.on('open-max-length-dialog', openMaxLengthDialog);

    return () => {
      ipcRenderer.removeListener('open-max-length-dialog', openMaxLengthDialog);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const text = window.electron.readClipboardText();
      const trimmedText = text.trim();

      if (trimmedText) {
        setClipboardHistory(prevHistory => {
          const textIndex = prevHistory.indexOf(text);
          if (textIndex === -1) {
            let newHistory = [text, ...prevHistory];
            if (newHistory.length > maxHistoryLength) {
              newHistory.pop();
            }

            ipcRenderer.send('broadcast-clipboard', text);

            return newHistory;
          } else if (textIndex === 0) {
            return prevHistory;
          } else {
            let updatedHistory = [...prevHistory];
            updatedHistory.splice(textIndex, 1);
            updatedHistory.unshift(text);
            ipcRenderer.send('broadcast-clipboard', text);
            return updatedHistory;
          }
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [clipboardHistory]);

  const copyToClipboard = (text, index) => {
    window.electron.writeClipboardText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 500);
  };

  // 判断操作系统
  const osShortcut = window.electron.platform === 'darwin' ? 'Command+Shift+C' : 'Ctrl+Shift+C';

  // 监听connection-status事件
  useEffect(() => {
    const handleConnectionStatusUpdate = (status) => {
      setConnectionStatus(status);
      if (status === '连接到服务器成功' || status === '连接到服务器失败') {
        setTimeout(() => {
          setShowConnectionStatus(false);
        }, 500);
      }
    };

    ipcRenderer.on('connection-status', handleConnectionStatusUpdate);

    // 组件卸载时，移除监听器
    return () => {
      ipcRenderer.removeListener('connection-status', handleConnectionStatusUpdate);
    };
  }, []);
  useEffect(() => {
  }, [connectionStatus]);

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
        {showConnectionStatus ? (
          <div className="flex flex-row justify-center p-5 rounded-lg bg-slate-200 text-gray-500 gap-4 font-bold ease-out transition-opacity duration-500">
            {connectionStatus}
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <p>Press <span className="font-bold">{osShortcut}</span> to open clipboard history.</p>
          </>)
        }
      </div>

      <AppModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />

    </div>
  );
}

export default App;