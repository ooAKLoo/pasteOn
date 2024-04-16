import React from 'react';

import ColorSettings from './sets/ColorSettings';
import  {ShortcutSettings,ShortcutSettings2}  from './sets/ShortcutSettings';
import { useNotification } from '../hook/NotificationContext';
import { useConfig } from '../hook/ConfigContext ';

function Settings() {
    const { config, setConfig } = useConfig();
    const { showNotification } = useNotification();

    const handleRandomColor = () => {
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
        setConfig({ colorScheme: randomColor });
        showNotification("Color changed successfully!", "success");
    };
    const handleColorChange = (newColor) => {
        setConfig({ colorScheme: newColor });
        showNotification("Color changed successfully!", "success");
    };
    const handleMaxLengthChange = (newMaxLength) => {
        setConfig({ ...config, maxLength: newMaxLength });
        showNotification("Max history length adjusted!", "success");
    };
    return (
        <div className="flex flex-col h-full justify-between p-2 gap-2">
            <div className='flex flex-row gap-4 h-10 font-bold justify-between'>
                <ShortcutSettings  />
                <ShortcutSettings2 />
            </div>
            <div className='flex grow justify-between gap-4'>
                <div className='flex flex-1 flex-col justify-between gap-4 bg-white p-4 rounded-2xl'>
                    <div className='flex flex-1 bg-gray-200 items-center justify-center rounded-lg'>Current Server IP</div>
                    <div className='flex flex-1 bg-gray-200 items-center justify-center rounded-lg'>设为服务器？</div>
                </div>
                <div className='flex flex-1 flex-col justify-between gap-4 bg-gray-200 p-4 rounded-2xl'>
                    <ColorSettings color={config.colorScheme} onColorChange={handleColorChange} />
                    <div className='flex flex-1 items-center gap-4 justify-center rounded-lg'>
                        <div
                            className="flex-1 h-full rounded-lg bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 cursor-pointer"
                            onClick={handleRandomColor}
                            title="Random Color">
                        </div>
                        <input
                            className="flex-1 h-full rounded-lg text-center font-bold justify-center items-center bg-white"
                            type="number" min="1" max="20"
                            value={config.maxLength}
                            onChange={(e) => {
                                handleMaxLengthChange(parseInt(e.target.value, 10));
                                showNotification("adjusted!", "success");
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
