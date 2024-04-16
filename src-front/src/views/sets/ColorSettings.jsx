function ColorSettings({ color, onColorChange }) {

    return (
        <div className="flex flex-1 items-center justify-between gap-4 w-full">
            <div className="flex-1 h-full rounded-lg bg-slate-200/30 backdrop-blur-sm shadow-xl shadow-gray-300  cursor-pointer"
                onClick={() => onColorChange('transparent')}
                title="Transparent"
            >
            </div>
            <div className="flex-1 h-full rounded-full cursor-pointer" title='Color Picker'>
                <input
                    type="color"
                    value={color}
                    onChange={(e) => onColorChange(e.target.value)}
                    className="w-full h-full rounded-full shadow-xl shadow-gray-300 cursor-pointer"
                />
            </div>
        </div>
    );
}

export default ColorSettings;