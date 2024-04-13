import React, { useState } from 'react';
import { SwatchesPicker } from 'react-color';

function Settings() {
  const [color, setColor] = useState('#ffffff'); // 默认白色
  const [showKey, setShowKey] = useState('Ctrl+Shift+S');
  const [rollbackKey, setRollbackKey] = useState('Ctrl+Shift+Z');
  const [maxHistory, setMaxHistory] = useState(5);

  const handleColorChange = (color) => {
    setColor(color.hex);
  };

  return (
    <div className="flex flex-col space-y-4 p-4 bg-white rounded-lg shadow-lg">
      {/* 颜色设置 */}
      <div className="flex items-center justify-between">
        <SwatchesPicker color={color} onChangeComplete={handleColorChange} />
      </div>
      
      {/* 快捷键设置 */}
      <div className="flex items-center space-x-4">
        <svg className="h-6 w-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4zm2 2v12h14V6H5zm2 2h10v8H7V8z"/>
        </svg>
        <input type="text" value={showKey} onChange={e => setShowKey(e.target.value)} className="flex-1 p-1 border rounded" />
      </div>

      {/* 回滚快捷键 */}
      <div className="flex items-center space-x-4">
        <svg className="h-6 w-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15v-3h-2v3a1 1 0 1 1-2 0v-4a1 1 0 1 1 2 0v1h2v-2h-2V9h4v2h-2v2h2v4a1 1 0 1 1-2 0zm-1-13a8 8 0 1 1 0 16 8 8 0 0 1 0-16z"/>
        </svg>
        <input type="text" value={rollbackKey} onChange={e => setRollbackKey(e.target.value)} className="flex-1 p-1 border rounded" />
      </div>

      {/* 最大历史记录 */}
      <div className="flex items-center space-x-4">
        <svg className="h-6 w-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15v-3h-2v3a1 1 0 1 1-2 0v-4a1 1 0 1 1 2 0v1h2v-2h-2V9h4v2h-2v2h2v4a1 1 0 1 1-2 0zm-1-13a8 8 0 1 1 0 16 8 8 0 0 1 0-16z"/>
        </svg>
        <input type="number" min="1" max="20" value={maxHistory} onChange={e => setMaxHistory(parseInt(e.target.value, 10))} className="flex-1 p-1 border rounded" />
      </div>
    </div>
  );
}

export default Settings;
