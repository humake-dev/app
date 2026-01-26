import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { authFetch } from './src/utils/api';

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);

const fetchMessages = useCallback(async () => {
if (fetchedRef.current) return; // ✅ 진짜 차단


fetchedRef.current = true;
setLoading(true);


try {
const response = await authFetch("/messages");
if (response.ok) {
const data = await response.json();
setTotal(data.total);
setMessages(data.total ? data.message_list : []);
}
} catch (e) {
fetchedRef.current = false; // 실패 시 다시 허용
} finally {
setLoading(false);
}
}, []);

const refreshMessages = async () => {
fetchedRef.current = false; // 🔓 잠금 해제
await fetchMessages(); // 🔄 다시 불러오기
};

  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await authFetch(`/messages/hide/${messageId}`, {
        method: 'POST',
      });
      if (response.ok) {
        refreshMessages();
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  return (
    <MessageContext.Provider value={{
      messages, total, loading, fetchMessages, handleDeleteMessage, refreshMessages
    }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessageContext = () => useContext(MessageContext);