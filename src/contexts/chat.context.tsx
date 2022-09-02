import React, { useState } from 'react';

interface ChatContextInterface {
    currentGroup: string;
    setCurrentGroup: (group: string) => void;
}

export const ChatContext = React.createContext<ChatContextInterface>({} as ChatContextInterface);

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