import { useEffect } from 'react';
import { globalShortcut } from '@tauri-apps/api';

// Custom hook for managing keyboard shortcuts
export function useKeyboardShortcuts(isVisible, setIsVisible, adjustIndex) {
    useEffect(() => {
        registerVisibilityToggle();
        return () => {
            globalShortcut.unregister('Control+Shift+A');
            console.log('Control+Shift+A shortcut unregistered');
        };
    }, []);

    function registerVisibilityToggle() {
        globalShortcut.register('Control+Shift+A', () => {
            console.log('Global shortcut Control+Shift+A was pressed!');
            setIsVisible(prev => !prev);
        });
    }

    useEffect(() => {
        if (isVisible) {
            registerArrows();
        } else {
            unregisterArrows();
        }

        // Clean up
        return () => unregisterArrows();
    }, [isVisible]);


    const registerArrows = async () => {
        await globalShortcut.register('Up', () => adjustIndex(-1));
        console.log('Up arrow shortcut registered.');
        await globalShortcut.register('Down', () => adjustIndex(1));
        console.log('Down arrow shortcut registered.');
    };

    const unregisterArrows = async () => {
        await globalShortcut.unregister('Up');
        console.log('Up arrow shortcut unregistered.');
        await globalShortcut.unregister('Down');
        console.log('Down arrow shortcut unregistered.');
    };
}
