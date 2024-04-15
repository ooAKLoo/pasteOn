
function HistorySettings({ maxHistory, setMaxHistory }) {
    return (
        <div className="flex items-center">
            <input className="flex-1 p-1 border h-10  rounded" type="number" min="1" max="20" value={maxHistory} onChange={(e) => setMaxHistory(parseInt(e.target.value, 10))} />
        </div>
    );
}

export default HistorySettings;