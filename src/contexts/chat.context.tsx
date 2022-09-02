import React, { useState } from 'react';

interface ChatContextInterface {
    currentGroup: string;
    setCurrentGroup: (group: string) => void;
}

const ChatContextDefaultValues: ChatContextInterface = {
  currentGroup: '',
  setCurrentGroup: () => null,
}

export const ChatContext = React.createContext<ChatContextInterface>(ChatContextDefaultValues);

const ChatProvider = ({ children }: { children?: React.ReactNode }) => {
    const [currentGroup, setCurrentGroup] = useState('');
  return (
    <ChatContext.Provider
      value={{
        currentGroup,
        setCurrentGroup,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
