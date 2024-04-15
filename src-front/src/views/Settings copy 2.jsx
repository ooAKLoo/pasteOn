import React, { useState } from 'react';
import ColorSettings from './sets/ColorSettings';
import HistorySettings from './sets/HistorySettings';
import { ShortcutSettings, ShortcutSettings2 } from './sets/ShortcutSettings';
import { useNotification } from '../hook/NotificationContext';

function Settings() {
    const [color, setColor] = useState('#ffffff');
    const [showKey, setShowKey] = useState('Ctrl+Shift+S');
    const [rollbackKey, setRollbackKey] = useState('Ctrl+Shift+Z');
    const [maxHistory, setMaxHistory] = useState(5);
    const { showNotification } = useNotification();

    const handleRandomColor = () => {
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
        setColor(randomColor);
        showNotification("Random color applied successfully!", "success");
    };

    const handleShortcutChange = (newShortcut, type) => {
        if (type === 'showKey') {
            setShowKey(newShortcut);
        } else {
            setRollbackKey(newShortcut);
        }
        showNotification(`Shortcut for ${type === 'showKey' ? 'visibility' : 'rollback'} updated to ${newShortcut}`, "success");
    };

    return (
        <div className="flex flex-col h-full justify-between p-2 gap-2">
            <div className='flex flex-row gap-4 h-10 font-bold justify-between'>
                <ShortcutSettings shortcut={showKey} setShortcut={(newShortcut) => handleShortcutChange(newShortcut, 'showKey')} />
                <ShortcutSettings2 shortcut={rollbackKey} setShortcut={(newShortcut) => handleShortcutChange(newShortcut, 'rollbackKey')} />
            </div>
            <div className='flex grow justify-between gap-4'>
                <div className='flex flex-1 flex-col justify-between gap-4 bg-white p-4 rounded-2xl'>
                    <div className='flex flex-1 bg-gray-200 items-center justify-center rounded-lg'>Current Server IP</div>
                    <div className='flex flex-1 bg-gray-200 items-center justify-center rounded-lg'>设为服务器？</div>
                </div>
                <div className='flex flex-1 flex-col justify-between gap-4 bg-gray-200 p-4 rounded-2xl'>
                    <ColorSettings color={color} onColorChange={(newColor) => {
                        setColor(newColor);
                        showNotification("Color changed successfully!", "success");
                    }} />
                    <div className='flex flex-1 items-center gap-4 justify-center rounded-lg'>
                        <div
                            className="flex-1 h-full rounded-lg bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 cursor-pointer"
                            onClick={handleRandomColor}
                            title="Random Color">
                        </div>
                        <input
                            className="flex-1 h-full rounded-lg text-center font-bold justify-center items-center bg-white"
                            type="number" min="1" max="20"
                            value={maxHistory}
                            onChange={(e) => {
                                setMaxHistory(parseInt(e.target.value, 10));
                                showNotification("History length adjusted!", "success");
                            }}
                            title="History length"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;
