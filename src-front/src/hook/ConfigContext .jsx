import React, { createContext, useContext, useState, useEffect } from 'react';
import { os, fs, path } from '@tauri-apps/api'; // 引入需要的 Tauri API

const defaultConfig = {
    shortcutSettings: {
        toggleVisibility: 'Control+Shift+A',
        scrollUp: 'Up',
        scrollDown: 'Down'
    }
};
const ConfigContext = createContext({ config: defaultConfig, setConfig: () => { } });

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
    const [config, setConfig] = useState(defaultConfig);

    // 新添加的函数用于更新配置
    const setNewConfig = (newSettings) => {
        console.log("newSettings", newSettings);
        setConfig(prevConfig => {
            const updatedConfig = {
                ...prevConfig,
                ...newSettings
            };
            console.log("Updating config to:", updatedConfig);
            return updatedConfig;
        });
    };


    useEffect(() => {
        async function loadConfig() {
            const osType = await os.type();
            const ctrlKey = osType === 'darwin' ? 'Cmd' : 'Control';
            const appDir = await path.appDir();
            const configFile = path.join(appDir, 'config.json');

            try {
                console.log("find configFile", configFile);
                const storedConfig = await fs.readTextFile(configFile);
                console.log("storedConfig", JSON.parse(storedConfig));
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
            const appDir = await path.appDir();
            const configFile = path.join(appDir, 'config.json');
            await fs.writeFile({
                path: configFile,
                contents: JSON.stringify(config)
            });
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

