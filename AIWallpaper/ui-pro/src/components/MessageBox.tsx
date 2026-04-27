import React from 'react';

interface MessageBoxProps {
  message: string;
  visible: boolean;
}

const MessageBox: React.FC<MessageBoxProps> = ({ message, visible }) => {
  if (!visible || !message) return null;

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[999]">
      <div className="bg-red-600 border border-red-700 rounded-2xl px-6 py-3 shadow-xl text-sm text-white max-w-[820px]">
        {message}
      </div>
    </div>
  );
};

export default MessageBox;
