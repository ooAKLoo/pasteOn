function ColorSettings({ color, onColorChange }) {

    return (
        <div className="flex flex-1 items-center justify-between gap-4 w-full">
            <div className="flex-1 h-full rounded-lg bg-white opacity-25 cursor-pointer" onClick={() => onColorChange('transparent')} title="Transparent"></div>
            {/* <div className="flex-1 w-full h-10 rounded bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 cursor-pointer" onClick={handleRandomColor} title="Random Color"></div> */}
            <div className="flex-1 h-full rounded-full cursor-pointer" title='Color Picker'>
                <input type="color" value={color} onChange={(e) => onColorChange(e.target.value)} className="w-full h-full rounded-full" />
            </div>
        </div>
    );
}

export default ColorSettings;