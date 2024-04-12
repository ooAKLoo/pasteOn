// hook/useClipboard.js
import { clipboard } from '@tauri-apps/api';

export const useClipboard = () => {
  const writeToClipboard = async (text) => {
    try {
      await clipboard.writeText(text.toString());
    } catch (error) {
      console.error('Failed to copy text to clipboard:', error);
    }
  };

  const readFromClipboard = async () => {
    try {
      const text = await clipboard.readText();
      return text;
    } catch (error) {
      console.error('Failed to read text from clipboard:', error);
      return null;
    }
  };

  return { writeToClipboard, readFromClipboard };
};
