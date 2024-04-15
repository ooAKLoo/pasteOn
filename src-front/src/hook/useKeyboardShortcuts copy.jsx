import { useEffect } from 'react';
import { globalShortcut } from '@tauri-apps/api';
import { useConfig } from './ConfigContext ';

export function useKeyboardShortcuts(isVisible, setIsVisible, adjustIndex, copyToClipboard) {
    const { config } = useConfig();  // Use the config from ConfigContext

    // Register and unregister visibility toggle shortcut
    useEffect(() => {
        const registerVisibilityShortcut = async () => {
            console.log("config.shortcutSettings.toggleVisibility--------------");
            await globalShortcut.register(config.shortcutSettings.toggleVisibility, () => {
                setIsVisible(prev => !prev);
            }).catch(console.error);

            return () => {
                globalShortcut.unregister(config.shortcutSettings.toggleVisibility).catch(console.error);
            };
        };

        registerVisibilityShortcut();

        return () => {
            globalShortcut.unregister(config.shortcutSettings.toggleVisibility).catch(console.error);
        };
    }, [config.shortcutSettings.toggleVisibility]); // Re-run when the shortcut changes

    // Register and unregister arrow shortcuts based on visibility
    useEffect(() => {
        const registerArrows = async () => {
            await globalShortcut.register(config.shortcutSettings.scrollUp, () => {
                adjustIndex(-1);
                copyToClipboard();
            }).catch(console.error);
            await globalShortcut.register(config.shortcutSettings.scrollDown, () => {
                adjustIndex(1);
                copyToClipboard();
            }).catch(console.error);
        };

        const unregisterArrows = async () => {
            await globalShortcut.unregister(config.shortcutSettings.scrollUp).catch(console.error);
            await globalShortcut.unregister(config.shortcutSettings.scrollDown).catch(console.error);
        };

        if (isVisible) {
            registerArrows();
        } else {
            unregisterArrows();
        }

        return () => {
            unregisterArrows();
        };
    }, [isVisible, config.shortcutSettings.scrollUp, config.shortcutSettings.scrollDown, adjustIndex, copyToClipboard]); // Also re-run when shortcuts change

    // Cleanup all shortcuts when component unmounts
    useEffect(() => {
        return () => {
            globalShortcut.unregisterAll().catch(console.error);
        };
    }, []);
}
