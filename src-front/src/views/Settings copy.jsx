import React, { useState } from 'react';
import ColorSettings from './sets/ColorSettings';
import HistorySettings from './sets/HistorySettings';
import ShortcutSettings from './sets/ShortcutSettings';



function Settings() {
    const [color, setColor] = useState('#ffffff');
    const [showKey, setShowKey] = useState('Ctrl+Shift+S');
    const [rollbackKey, setRollbackKey] = useState('Ctrl+Shift+Z');
    const [maxHistory, setMaxHistory] = useState(5);

    return (
        <div className="flex flex-col h-full  justify-between p-2">
            <div className='flex flex-row gap-4 h-10  justify-between'>
                <ShortcutSettings shortcut={showKey} setShortcut={setShowKey} />
                <ShortcutSettings shortcut={rollbackKey} setShortcut={setRollbackKey} />
            </div>
            <ColorSettings color={color} onColorChange={setColor} />
            <div class='flex justify-between gap-4 w-full text-sm font-bold'>
                <div class='flex-2 w-1/3 h-10 bg-slate-50 flex items-center justify-center'>Current Server IP</div>
                <div class='flex-1 w-full h-10 bg-slate-50 flex items-center justify-center'>设为服务器？</div>
                <div class='flex-1 w-full h-10 bg-slate-50 flex items-center justify-center'>123</div>
            </div>

        </div>
    );
}

export default Settings;
