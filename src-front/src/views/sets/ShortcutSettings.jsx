function ShortcutSettings({ shortcut, setShortcut, icon, altText }) {
    return (
        <div className="flex flex-1  min-w-0">
            <input className="w-full text-center p-1 rounded-lg focus:outline-none"  type="text" value={shortcut} onChange={(e) => setShortcut(e.target.value)} />
        </div>
    );
}

export default ShortcutSettings;