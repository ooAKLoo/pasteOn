// utils.js

export function createHandleKeyDown(setShortcut) {
    return (event) => {
        event.preventDefault();  // 阻止默认行为

        const keyName = event.key;
        let parts = new Set();

        if (event.metaKey) parts.add('Cmd');   // Mac平台的Command键
        if (event.altKey) parts.add('Opt');    // Mac平台的Option键
        if (event.shiftKey) parts.add('Shift'); // Shift键
        if (event.ctrlKey) parts.add('Ctrl');  // 控制键

        // 排除键盘修饰键单独作为快捷键的情况
        if (keyName.length === 1 || (keyName !== "Control" && keyName !== "Shift" && keyName !== "Alt" && keyName !== "Meta")) {
            parts.add(keyName);
        }

        setShortcut([...parts].join('+'));
    };
}
