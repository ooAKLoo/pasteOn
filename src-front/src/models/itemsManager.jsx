import React, { useState, useEffect } from 'react';

function ItemsManager({ isVisible, setIsVisible, writeToClipboard, readFromClipboard, MAX_LENGTH }) {
  const [items, setItems] = useState(["1", "2", "3"]);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const text = await readFromClipboard();
      const trimmedText = text.trim();
      if (trimmedText) {
        setItems(prevItems => {
          const existingIndex = prevItems.indexOf(text);
          let newItems = [...prevItems];
          if (existingIndex !== -1) {
            newItems.splice(existingIndex, 1);
          }
          newItems.unshift(text);
          if (newItems.length > MAX_LENGTH) {
            newItems = newItems.slice(0, MAX_LENGTH);
          }
          return newItems;
        });
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [readFromClipboard, MAX_LENGTH]);

  const adjustIndex = (direction) => {
    setItems(currentItems => {
      const newIndex = (direction + currentItems.length) % currentItems.length;
      const newItems = rotateArray(currentItems, newIndex);
      writeToClipboard(newItems[0]);
      return newItems;
    });
  };

  const rotateArray = (array, newIndex) => {
    if (newIndex === 0) return array;
    return [...array.slice(newIndex), ...array.slice(0, newIndex)];
  };

  // 将items数组和调整函数暴露给父组件
  return { items, adjustIndex };
}

export default ItemsManager;
