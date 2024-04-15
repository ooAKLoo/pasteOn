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
            <div className='flex justify-between gap-4'>
                <HistorySettings maxHistory={maxHistory} setMaxHistory={setMaxHistory} />
               <div className='flex-1 w-10 h-10 bg-slate-50'></div>
               <div className='flex-1  w-10 h-10 bg-slate-50'></div>
            </div>
        </div>
    );
}

export default Settings;
