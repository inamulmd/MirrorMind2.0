import React, { createContext, useContext, useState } from 'react';

const MirrorContext = createContext();

export const useMirror = () => {
  return useContext(MirrorContext);
};

export const MirrorProvider = ({ children }) => {
  const [messages, setMessages] = useState([]); // Ensure this is an array

  const addMessage = (sender, text) => {
    setMessages((prevMessages) => [...prevMessages, { sender, text }]);
  };

  return (
    <MirrorContext.Provider value={{ messages, addMessage }}>
      {children}
    </MirrorContext.Provider>
  );
};
