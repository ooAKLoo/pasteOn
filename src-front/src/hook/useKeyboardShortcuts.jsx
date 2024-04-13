import { useEffect } from 'react';
import { globalShortcut } from '@tauri-apps/api';

export function useKeyboardShortcuts(isVisible, setIsVisible, adjustIndex, copyToClipboard) {
    useEffect(() => {
        const toggleVisibility = () => {
            setIsVisible(prev => !prev);
        };

        globalShortcut.register('Control+Shift+A', toggleVisibility).catch(console.error);

        return () => {
            globalShortcut.unregister('Control+Shift+A').catch(console.error)
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
