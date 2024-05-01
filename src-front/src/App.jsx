import React, { useState, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { useNotification } from './hook/NotificationContext';
import NotificationBar from './views/NotificationBar';
import ItemsManager from './models/itemsManager';
import { useKeyboardShortcuts } from './hook/useKeyboardShortcuts';
import { useClipboard } from './hook/useClipboard';
import { appWindow, LogicalSize } from '@tauri-apps/api/window';
import Settings from './views/Settings';
import { useConfig } from './hook/ConfigContext ';
import { hexToHSL } from './controller/util';
import WebSocketManager from './models/WebSocketManager';
import { invoke } from '@tauri-apps/api/tauri';
import FileTransferView from './views/files/FileTransferView';

function App() {
  const [isVisible, setIsVisible] = useState(true);
  const { writeToClipboard, readFromClipboard } = useClipboard();
  const [windowSize, setWindowSize] = useState(new LogicalSize(400, 100));
  const [isExpanded, setIsExpanded] = useState(false);
  const { showNotification } = useNotification();
  const { config } = useConfig();
  const [maxLength, setMaxLength] = useState(config.maxLength);
  const { items, adjustIndex } = ItemsManager({ writeToClipboard, readFromClipboard, maxLength });

  // Main and detail styles initialized
  const [mainStyle, setMainStyle] = useState({ backgroundColor: config.colorScheme });
  const [detailStyle, setDetailStyle] = useState({});

  const [serverIp, setServerIp] = useState('');
  const [serverPort, setServerPort] = useState('');

  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [hasConnected, setHasConnected] = useState(false);

  const [isSetting, setIsSetting] = useState(false);

  const { websocket, connectWebSocket } = WebSocketManager({
    serverIp,
    serverPort,
    onMessage: (data) => {
      if (data === "pong" || data === "Hello Server!") {
        setConnectionStatus('Connected');
      } else {
        writeToClipboard(data);
      }
    },
    onError: (error) => {
      setConnectionStatus('Error');
    },
    onClose: () => {
      setConnectionStatus('Disconnected');
    }
  });

  const [isFileDragged, setIsFileDragged] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState([]);

  useKeyboardShortcuts(isVisible, setIsVisible, adjustIndex);

  useEffect(() => {
    setMaxLength(config.maxLength); // Update when config changes
  }, [config.maxLength]);

  useEffect(() => {
    // Update main style directly with colorScheme
    setMainStyle({ backgroundColor: config.colorScheme });

    // Convert HEX to HSL and adjust for detail style
    const hslColor = hexToHSL(config.colorScheme);
    const { h, s, l } = hslColor;

    const detailHSL = `hsl(${h}, ${Math.min(100, s + 15)}%, ${Math.max(0, l + 20)}%)`;
    setDetailStyle({ backgroundColor: isExpanded ? detailHSL : 'transparent' });
  }, [config.colorScheme, isVisible, isExpanded]);

  useEffect(() => {
    appWindow.setIgnoreCursorEvents(!isVisible)
      .then(() => console.log(`Cursor events are now ${isVisible ? 'ignored' : 'processed'}.`))
      .catch(error => console.error('Failed to set cursor events:', error));
  }, [isVisible]);

  // 监听 Tauri 事件并更新 IP 和端口
  useEffect(() => {
    const unlisten = listen('server-details', (event) => {
      console.log('Received server details:', event.payload);
      const match = event.payload.match(/ws:\/\/(.+):(\d+)/);
      if (match) {
        const [_, ip, port] = match;
        setServerIp(ip);
        setServerPort(port);
        setHasConnected(false);  // 重置连接标记
      }
    });

    return () => {
      unlisten.then((func) => func());
    };
  }, []);

  useEffect(() => {
    if (serverIp && serverPort && !hasConnected) {
      connectWebSocket();
      setHasConnected(true);  // 设置标记为已连接，防止未来重连
    }
  }, [serverIp, serverPort, connectWebSocket, hasConnected]);

  useEffect(() => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(items[0]);
      console.log(`Sent to server: ${items[0]}`);
    }
  }, [items[0], websocket]);  // 添加 websocket 作为依赖，以确保使用最新的连接

  const toggleWindowSize = () => {
    const expanded = windowSize.height === 100;
    const newHeight = expanded ? 300 : 100;
    const newSize = new LogicalSize(windowSize.width, newHeight);
    appWindow.setSize(newSize)
      .then(() => {
        setWindowSize(newSize);
        setIsExpanded(expanded);
      })
      .catch(error => console.error('Failed to set window size:', error));
  };

  const handleServerDetailsChange = () => {
    setHasConnected(false);  // 重置连接标记
  };

  const handleSetAsServerClick = async () => {
    console.log("Set as server with details:");
    setIsSetting(true);
    invoke('start_server_if_needed')
      .then((message) => {
        setIsSetting(false);
        websocket.send('ping');
        showNotification("Success", "success");
      })
      .catch((error) => {
        console.error(error);
        setIsSetting(false);
        showNotification("Failed", "error");
      });
  };


  useEffect(() => {
    const unlisten = listen('tauri://file-drop', (event) => {
      // console.log('File dropped', event.payload);  // 查看拖放的文件信息
      setIsFileDragged(true);  // 更新状态为拖放文件状态
      if (event.payload && Array.isArray(event.payload)) {
        const files = event.payload.map(filePath => {
          const parts = filePath.split('\\'); // 假设是 Windows 路径，用反斜杠分割
          const name = parts.pop(); // 获取路径的最后一部分作为文件名
          return { path: filePath, name }; // 仅返回路径和文件名
        });
        // console.log('Files:', files); // 查看解析后的文件信息
        setDroppedFiles(files); // 保存文件信息
        setIsFileDragged(true); // 更新状态为拖放文件状态
        // setIsExpanded(true);
        // toggleWindowSize();
      }
    });

    return () => {
      unlisten.then(removeListener => removeListener());
    };
  }, []);

  return (
    <div
      onDoubleClick={toggleWindowSize}
      data-tauri-drag-region
      style={detailStyle}
      className={`flex flex-col w-full h-screen z-0 overflow-hidden rounded-xl transition-opacity ease-in-out duration-500 ${isVisible ? '' : 'opacity-0 pointer-events-none relative'}`}
    >
      {isFileDragged ? (
        <FileTransferView  files={droppedFiles} config={config} toggleFileDragged={() => setIsFileDragged(false)} websocket={websocket} />
      ) : (
        <>
          <div
            data-tauri-drag-region
            style={mainStyle}
            className={`flex flex-col w-screen ${isExpanded ? "h-1/3" : "h-screen"} z-10 max-h-200 p-2 text-ellipsis overflow-hidden items-center justify-center rounded-xl relative`}
          >
            <NotificationBar />
            <h1 data-tauri-drag-region className="w-full h-full text-base font-bold line-clamp-3 p-2">{items[0]}</h1>
          </div>

          <div className={`flex-grow no-scrollbar overflow-y-scroll transition-opacity duration-500 ease-in-out ${isExpanded ? 'animate-slide-down' : 'animate-collapse-zoom'}`}>
            {isExpanded && <Settings connectionStatus={connectionStatus}
              serverIp={serverIp} serverPort={serverPort}
              setServerIp={setServerIp}
              setServerPort={setServerPort}
              onServerDetailsChange={handleServerDetailsChange}
              onSetAsServerClick={handleSetAsServerClick}
              isSetting={isSetting}
            />}
          </div>
        </>
      )

      }
    </div>
  );
}

export default App;
