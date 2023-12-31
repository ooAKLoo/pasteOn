import React, { useState } from 'react';
import Modal from 'react-modal';
import checkImg from '../public/assets/check.png'; // 确保路径正确
import './tailwind.css'; // 导入 Tailwind CSS

Modal.setAppElement("#root");

function AppModal({ isOpen, onClose }) {
  const [inputValue, setInputValue] = useState("");

  const handleConfirm = () => {
    if (isInputValid()) {
      const parsedValue = parseInt(inputValue, 10); // 使用局部变量
      localStorage.setItem("maxHistoryLength", parsedValue.toString()); // 保存到 localStorage
      onClose();
    } else {
      alert("Please enter a valid positive integer."); // 或者使用更友好的提示方式
    }
  };
  

  const isInputValid = () => {
    const value = parseInt(inputValue, 10);
    return !isNaN(value) && value > 0;
  };

  const customStyles = {
    content: {
      width: '300px',
      height: '50px',
      top: '44%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      padding: 0,
      border: 0,
      background: 'transparent', // 设置内容背景透明
      color: '#000' // 文本颜色，根据需要调整
    },
    // overlay: { backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },

  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={true}
      style={customStyles}
    >
      <div className="flex items-center justify-center space-x-4 p-2"> {/* Flex container */}
        <input 
          type="number"
          className="modalInput border rounded-md p-1 flex-grow" // flex-grow for input
          value={inputValue} 
          onChange={(e) => setInputValue(e.target.value)} 
          placeholder="Enter max length"
        />
        {isInputValid() && (
          <img 
            src={checkImg} 
            alt="Confirm" 
            className="cursor-pointer w-6 h-6" // Adjust size as needed
            onClick={handleConfirm} 
          />
        )}
      </div>
    </Modal>
  );
}

export default AppModal;
