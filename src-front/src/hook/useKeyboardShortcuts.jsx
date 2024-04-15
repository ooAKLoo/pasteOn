import { useEffect } from 'react';
import { globalShortcut, os } from '@tauri-apps/api';

export function useKeyboardShortcuts(isVisible, setIsVisible, adjustIndex, copyToClipboard) {
    useEffect(() => {
        const registerShortcuts = async () => {
            const osType = await os.type(); // Gets the OS type
            const ctrlKey = osType === 'darwin' ? 'Cmd' : 'Control'; // Use Cmd for macOS and Control for others

            const toggleVisibilityShortcut = `${ctrlKey}+Shift+A`;
            await globalShortcut.register(toggleVisibilityShortcut, () => {
                setIsVisible(prev => !prev);
            }).catch(console.error);

            return () => {
                globalShortcut.unregister(toggleVisibilityShortcut).catch(console.error);
            };
        };

        registerShortcuts();

        return () => {
            globalShortcut.unregisterAll().catch(console.error);
        };
    }, []);

    useEffect(() => {
        if (isVisible) {
            registerArrows();
        } else {
            unregisterArrows();
        }
    }, [isVisible]); // Only run this effect when isVisible changes

    const registerArrows = async () => {
        await globalShortcut.register('Up', () => {
            adjustIndex(-1);
            copyToClipboard();
        });
        await globalShortcut.register('Down', () => {
            adjustIndex(1);
            copyToClipboard();
        });
    };

    const unregisterArrows = async () => {
        await globalShortcut.unregister('Up');
        await globalShortcut.unregister('Down');
    };
}
