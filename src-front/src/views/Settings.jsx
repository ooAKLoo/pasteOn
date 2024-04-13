import React, { useState } from 'react';
import { SwatchesPicker } from 'react-color';
import length from '../assets/lengthImg.svg'
import rollback from '../assets/rollbackImg.svg'
import shortcut from '../assets/shortCutImg.svg'

function Settings() {
    const [color, setColor] = useState('#ffffff'); // 默认白色
    const [showKey, setShowKey] = useState('Ctrl+Shift+S');
    const [rollbackKey, setRollbackKey] = useState('Ctrl+Shift+Z');
    const [maxHistory, setMaxHistory] = useState(5);

    // 生成随机颜色
    const handleRandomColor = () => {
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
        setColor(randomColor);
    };
    // 处理颜色改变
    const handleColorChange = (newColor) => {
        setColor(newColor);
    };

    return (
        <div className="flex flex-col p-2 gap-y-3">
            {/* 颜色设置 */}
            <div className="flex items-center justify-between space-x-4">
                {/* 透明 */}
                <div
                    className="w-1/4 h-10 rounded bg-white opacity-25 cursor-pointer"
                    onClick={() => handleColorChange('transparent')}
                    title="Transparent"
                ></div>

                {/* 随机颜色 */}
                <div
                    className="w-1/4 h-10 rounded bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 cursor-pointer"
                    onClick={handleRandomColor}
                    title="Random Color"
                ></div>

                {/* 颜色选择器 */}
                <div
                    className="w-1/4 h-10 rounded-full cursor-pointer"
                    title='Color Picker'
                > {/* 父容器宽高设置 */}
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="w-full h-full rounded-full "

                    />
                </div>
            </div>

            {/* 快捷键设置 */}
            <div className="flex items-center space-x-4 h-10">
                <div className='bg-red-100 p-1 rounded-md'>
                    <img src={shortcut} alt="length" className='w-6 h-6' />
                </div>
                <input type="text" value={showKey} onChange={e => setShowKey(e.target.value)} className="flex-1 p-1 border rounded" />
            </div>

            {/* 快捷键设置 */}
            <div className="flex items-center space-x-4">
            <div className='bg-red-100 p-1 rounded-md'>
                <img src={rollback} className='w-6 h-6' />
                </div>
                <input type="text" value={rollbackKey} onChange={e => setRollbackKey(e.target.value)} className="flex-1 p-1 border rounded" />
            </div>

            {/* 最大历史记录 */}
            <div className="flex items-center space-x-4">
            <div className='bg-red-100 p-1 rounded-md'>
                <img src={length} className='w-6 h-6' />
                </div>
                <input type="number" min="1" max="20" value={maxHistory} onChange={e => setMaxHistory(parseInt(e.target.value, 10))} className="flex-1 p-1 border rounded" />
            </div>
        </div>
    );
}

export default Settings;
