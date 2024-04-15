import React, { useState } from 'react';

function Settings() {
    const [isOpen, setIsOpen] = useState([false, false, false, false]);

    const togglePanel = (index) => {
        const newIsOpen = [...isOpen];
        newIsOpen[index] = !newIsOpen[index];
        setIsOpen(newIsOpen);
    };

    return (
        <div className="p-5">
            {/* Panel 1 */}
            <div className="mb-4">
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => togglePanel(0)}
                >
                    {isOpen[0] ? 'Close' : 'Open'} Panel 1
                </button>
                <div className={`overflow-hidden ${isOpen[0] ? 'animate-expand-top-left' : 'animate-collapse-bottom-right'}`}>
                    <div className="p-4 border border-gray-200 shadow-lg rounded-md bg-white">
                        <h2 className="text-lg font-semibold">Panel 1</h2>
                        <p>Adjust your settings for Panel 1 here.</p>
                    </div>
                </div>
            </div>

            {/* Panel 2 */}
            <div className="mb-4">
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => togglePanel(1)}
                >
                    {isOpen[1] ? 'Close' : 'Open'} Panel 2
                </button>
                <div className={`overflow-hidden ${isOpen[1] ? 'animate-expand-zoom' : 'animate-collapse-zoom'}`}>
                    <div className="p-4 border border-gray-200 shadow-lg rounded-md bg-white">
                        <h2 className="text-lg font-semibold">Panel 2</h2>
                        <p>Adjust your settings for Panel 2 here.</p>
                    </div>
                </div>
            </div>

            {/* Panel 3 */}
            <div className="mb-4">
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => togglePanel(2)}
                >
                    {isOpen[2] ? 'Close' : 'Open'} Panel 3
                </button>
                <div className={`overflow-hidden ${isOpen[2] ? 'animate-expand-fade' : 'animate-collapse-fade'}`}>
                    <div className="p-4 border border-gray-200 shadow-lg rounded-md bg-white">
                        <h2 className="text-lg font-semibold">Panel 3</h2>
                        <p>Adjust your settings for Panel 3 here.</p>
                    </div>
                </div>
            </div>

            {/* Panel 4 */}
            <div className="mb-4">
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => togglePanel(3)}
                >
                    {isOpen[3] ? 'Close' : 'Open'} Panel 4
                </button>
                <div className={`overflow-hidden ${isOpen[3] ? 'animate-expand-top-left' : 'animate-collapse-bottom-right'}`}>
                    <div className="p-4 border border-gray-200 shadow-lg rounded-md bg-white">
                        <h2 className="text-lg font-semibold">Panel 4</h2>
                        <p>Adjust your settings for Panel 4 here.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;
