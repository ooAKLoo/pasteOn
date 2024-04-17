import React, { useState, useEffect, useRef } from 'react';
import { useConfig } from '../../hook/ConfigContext ';
import { createHandleKeyDown } from '../../controller/util';

export function ShortcutSettings() {
    const { config, setConfig } = useConfig(); // 使用 useConfig 钩子获取配置，确保能设置配置
    const [isFocused, setIsFocused] = useState(false);
    const [shortcut, setShortcut] = useState('');
    const handleKeyDown = createHandleKeyDown(setShortcut)

    useEffect(() => {
        setShortcut(config.shortcutSettings["toggleVisibility"]); // 从配置中读取快捷键
    }, []);

    const updateConfig = () => {
        if (config.shortcutSettings.toggleVisibility !== shortcut) {
            const newConfig = {shortcutSettings: { toggleVisibility: shortcut } };
            setConfig(newConfig);
        }
        setIsFocused(false);
    };

    return (
        <div className="flex flex-1 min-w-0">
            <input
                className="w-full text-center text-xs p-1 rounded-lg focus:outline-none"
                type="text"
                value={isFocused ? shortcut : ''}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={updateConfig}
                placeholder="Show Shortcuts"
            />
        </div>
    );
};

export function ShortcutSettings2() {
    const { config, setConfig } = useConfig();
    const [isFocused, setIsFocused] = useState(false);
    const [shortcutUp, setShortcutUp] = useState(config.shortcutSettings.scrollUp);
    const [shortcutDown, setShortcutDown] = useState(config.shortcutSettings.scrollDown);
    const containerRef = useRef(null);
    const handleKeyDownUp = createHandleKeyDown(setShortcutUp);
    const handleKeyDownDown = createHandleKeyDown(setShortcutDown);
    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsFocused(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        // 当输入框失去焦点时才检查是否需要更新配置
        if (!isFocused) {
            // 只有当新值与当前配置中的值不同时，才更新配置
            if (config.shortcutSettings.scrollUp !== shortcutUp || config.shortcutSettings.scrollDown !== shortcutDown) {
                const newConfig = {
                    shortcutSettings: {
                        scrollUp: shortcutUp,
                        scrollDown: shortcutDown
                    }
                };
                setConfig(newConfig);
            }
        }
    }, [isFocused]);

    return (
        <div
            className="flex flex-1 min-w-0 bg-white rounded-lg items-center justify-center"
            ref={containerRef}
        >
            {isFocused ? (
                <>
                    <input
                        className="w-full text-center text-xs p-1 rounded-lg focus:outline-none"
                        type="text"
                        value={shortcutUp}
                        onKeyDown={handleKeyDownUp}
                        placeholder="Set Shortcut for Scroll Up"
                    />
                    |
                    <input
                        className="w-full text-center text-xs p-1 rounded-lg focus:outline-none"
                        type="text"
                        value={shortcutDown}
                        onKeyDown={handleKeyDownDown}
                        placeholder="Set Shortcut for Scroll Down"
                    />
                </>
            ) : (
                <div className="flex flex-1 min-w-0">
                    <input
                        className="w-full text-center text-xs p-1 rounded-lg focus:outline-none"
                        type="text"
                        onFocus={() => setIsFocused(true)}
                        placeholder="Rollback shortcuts"
                    />
                </div>
            )}
        </div>
    );
}
