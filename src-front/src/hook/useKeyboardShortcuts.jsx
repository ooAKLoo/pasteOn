import { useEffect } from 'react';
import { globalShortcut } from '@tauri-apps/api';

export function useKeyboardShortcuts(isVisible, setIsVisible, adjustIndex, copyToClipboard) {
    useEffect(() => {
        const toggleVisibility = () => {
            console.log('Global shortcut Control+Shift+A was pressed!');
            setIsVisible(prev => !prev);
        };

        globalShortcut.register('Control+Shift+A', toggleVisibility).catch(console.error);

        return () => {
            globalShortcut.unregister('Control+Shift+A').catch(console.error);
            console.log('Control+Shift+A shortcut unregistered');
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
        console.log('Up arrow shortcut registered.');
        await globalShortcut.register('Down', () => {
            adjustIndex(1);
            copyToClipboard();
        });
        console.log('Down arrow shortcut registered.');
    };

    const unregisterArrows = async () => {
        await globalShortcut.unregister('Up');
        console.log('Up arrow shortcut unregistered.');
        await globalShortcut.unregister('Down');
        console.log('Down arrow shortcut unregistered.');
    };
}
