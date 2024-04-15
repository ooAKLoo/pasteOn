import React, { createContext, useContext, useState, useEffect } from 'react';
import { os, fs, path } from '@tauri-apps/api'; // 引入需要的 Tauri API

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
    const [config, setConfig] = useState(defaultConfig);

    // 新添加的函数用于更新配置
const setNewConfig = (newSettings) => {
    setConfig(prevConfig => {
        const updatedConfig = {
            ...prevConfig,
            ...newSettings
        };
        console.log("Updating config to:", updatedConfig);
        return updatedConfig;
    });
};
const updateConfig = () => {
    // 先打印旧的配置引用和内容
    console.log("Old config object reference:", config);
    console.log("Old shortcut setting:", config.shortcutSettings.toggleVisibility);

    // 创建新的配置对象
    const newConfig = { 
        ...config, 
        shortcutSettings: { 
            ...config.shortcutSettings, 
            toggleVisibility: shortcut 
        } 
    };

    // 检查新的配置对象是否确实是一个新的引用
    console.log("New config object reference:", newConfig);
    console.log("New shortcut setting:", newConfig.shortcutSettings.toggleVisibility);

    // 更新配置
    setConfig(newConfig);
    setIsFocused(false);
};


    useEffect(() => {
        async function loadConfig() {
            const osType = await os.type();
            const ctrlKey = osType === 'darwin' ? 'Cmd' : 'Control';
            const appDir = await path.appDir();
            const configFile = path.join(appDir, 'config.json');

            try {
                const storedConfig = await fs.readTextFile(configFile);
                setNewConfig(JSON.parse(storedConfig)); // 使用新的 setNewConfig
            } catch (error) {
                console.error("Error loading configuration:", error);
                // 如果没有找到配置文件，使用默认配置
                setNewConfig({
                    shortcutSettings: {
                        toggleVisibility: `${ctrlKey}+Shift+A`,
                        scrollUp: 'Up',
                        scrollDown: 'Down'
                    }
                });
            }
        }
        loadConfig();
    }, []);

    useEffect(() => {
        console.log("config", config);
        async function saveConfig() {
             updateConfig();
            const appDir = await path.appDir();
            const configFile = path.join(appDir, 'config.json');
            await fs.writeFile({
                path: configFile,
                contents: JSON.stringify(config)
            });
            updateConfig();
        }
        saveConfig();
    }, [config]);

    // 在 Context Provider 中传递 setNewConfig 而不是 setConfig
    return (
        <ConfigContext.Provider value={{ config, setConfig: setNewConfig }}>
            {children}
        </ConfigContext.Provider>
    );
};

