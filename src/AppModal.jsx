import React, { useState } from 'react';
import Modal from 'react-modal';
import checkImg from '../public/assets/check.png';
import './tailwind.css';

Modal.setAppElement("#root");

function AppModal({ isOpen, onClose }) {
  const [inputValue, setInputValue] = useState("");

  const handleConfirm = () => {
    if (isInputValid()) {
      const parsedValue = parseInt(inputValue, 10);
      localStorage.setItem("maxHistoryLength", parsedValue.toString());
      onClose();
    } else {
      alert("Please enter a valid positive integer.");
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
      background: 'transparent',
      color: '#000'
    },
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
