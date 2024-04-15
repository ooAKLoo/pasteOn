// src/contexts/ConfigProvider.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { os } from '@tauri-apps/api';

const defaultConfig = {
    shortcutSettings: {
        toggleVisibility: 'Control+Shift+A',
        scrollUp: 'Up',
        scrollDown: 'Down'
    }
};
const ConfigContext = createContext({ config: defaultConfig, setConfig: () => {} });

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
    const [config, setConfig] = useState({
        shortcutSettings: {
            toggleVisibility: 'Control+Shift+A',
            scrollUp: 'Up',
            scrollDown: 'Down'
        }
    });

    useEffect(() => {
        const loadConfig = async () => {
            const osType = await os.type(); // 获取操作系统类型
            const ctrlKey = osType === 'darwin' ? 'Cmd' : 'Control';
            setConfig({
                shortcutSettings: {
                    toggleVisibility: `${ctrlKey}+Shift+A`,
                    scrollUp: 'Up',
                    scrollDown: 'Down'
                }
            });
        };
        loadConfig();
    }, []);

    return (
        <ConfigContext.Provider value={{ config, setConfig }}>
            {children}
        </ConfigContext.Provider>
    );
};
