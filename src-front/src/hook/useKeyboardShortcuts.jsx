// hook/useKeyboardShortcuts.js
import { useState,useEffect } from 'react';
import { globalShortcut } from '@tauri-apps/api';

export function useKeyboardShortcuts(isVisible, setIsVisible,setIndex, adjustIndex, copyToClipboard) {
    const [shouldChange,setShouldChange] = useState(false);
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
            setIsVisible(prev => {
                if (!prev) {
                    setIndex(0);
                }   
                return !prev;
            });
            setShouldChange(prev => !prev);
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
    }, [shouldChange]);

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
