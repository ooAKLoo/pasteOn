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

export function hexToHSL(H) {
    // Convert hex to RGB first
    let r = 0, g = 0, b = 0;
    if (H.length === 4) {
        r = parseInt(H[1] + H[1], 16);
        g = parseInt(H[2] + H[2], 16);
        b = parseInt(H[3] + H[3], 16);
    } else if (H.length === 7) {
        r = parseInt(H[1] + H[2], 16);
        g = parseInt(H[3] + H[4], 16);
        b = parseInt(H[5] + H[6], 16);
    }
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if(max === min){
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (min + max);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h *= 60;
    }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}
