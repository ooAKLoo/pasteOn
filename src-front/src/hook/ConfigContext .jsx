import React, { createContext, useContext, useState, useEffect } from 'react';
import { os, fs, path } from '@tauri-apps/api'; // 引入需要的 Tauri API

const defaultConfig = {
    shortcutSettings: {
        toggleVisibility: 'Control+Shift+A',
        scrollUp: 'Up',
        scrollDown: 'Down'
    },
    colorScheme: '#ffffff', // 默认颜色方案
    maxLength: 5
};
const ConfigContext = createContext({ config: defaultConfig, setConfig: () => { } });

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
    const [config, setConfigState] = useState(defaultConfig);

    // 专门更新快捷键配置
    const updateShortcutSettings = async (newShortcutSettings) => {
        const newConfig = {
            ...config,
            shortcutSettings: {
                ...config.shortcutSettings,
                ...newShortcutSettings
            }
        };
        await saveConfig(newConfig);
    };

    // 专门更新颜色配置
    const updateColorScheme = async (newColorScheme) => {
        const newConfig = {
            ...config,
            colorScheme: newColorScheme
        };
        await saveConfig(newConfig);
    };

    // Update ConfigProvider to handle maxLength updates
const updateMaxLength = async (newMaxLength) => {
    const newConfig = {
        ...config,
        maxLength: newMaxLength
    };
    await saveConfig(newConfig);
};

    // 保存配置到文件
    const saveConfig = async (newConfig) => {
        setConfigState(newConfig); // 更新状态

        const appDir = await path.appDir();
        const configFile = path.join(appDir, 'config.json');
        await fs.writeFile({
            path: configFile,
            contents: JSON.stringify(newConfig)
        });
    };

    // 用于外部调用的统一配置更新方法
    const setConfig = (newSettings) => {
        if (newSettings.shortcutSettings) {
            updateShortcutSettings(newSettings.shortcutSettings);
        }
        if (newSettings.colorScheme !== undefined) {
            updateColorScheme(newSettings.colorScheme);
        }
        if (newSettings.maxLength !== undefined) {
            updateMaxLength(newSettings.maxLength);
        }
    };

    useEffect(() => {
        loadConfig(); // 加载配置的方法不变
    }, []);

    const loadConfig = async () => {
        const appDir = await path.appDir();
        const configFile = path.join(appDir, 'config.json');
        try {
            const storedConfig = await fs.readTextFile(configFile);
            setConfigState({ ...defaultConfig, ...JSON.parse(storedConfig) });
        } catch (error) {
            console.error("Error loading configuration:", error);
            setConfigState(defaultConfig);
        }
    };

    return (
        <ConfigContext.Provider value={{ config, setConfig }}>
            {children}
        </ConfigContext.Provider>
    );
};


