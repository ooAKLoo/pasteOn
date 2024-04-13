// Settings.jsx
import React, { useState } from 'react';

function Settings({}) {

      const [num, setNum] = useState(0);
  const addnum = () => {
    setNum(num + 1);
  }
  return (
    <div
        data-tauri-drag-region
          className={`flex flex-1 p-2 text-ellipsis transition-opacity ease-in-out duration-500 rounded-xl`}
        >
          <button onClick={addnum} className="">{num}</button>
        </div>
  );
}

export default Settings;
