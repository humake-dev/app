
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';

import NetInfo from '@react-native-community/netinfo';

import { authFetch } from '../utils/api';

import {
  initializeMessageTable,
  getMessages,
  saveMessages,
  deleteMessageFromDB,
} from '../database/messageDatabase';

const MessageContext = createContext(null);

export const MessageProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const syncingRef = useRef(false);
  const mountedRef = useRef(true);

  // SQLite 데이터 조회
  const loadLocalMessages = useCallback(async () => {
    try {
      await initializeMessageTable();

      const localMessages = await getMessages();

      if (mountedRef.current) {
        setMessages(localMessages);
        setTotal(localMessages.length);
      }
    } catch (error) {
      console.error('SQLite message read error:', error);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // 서버 동기화
  const syncMessages = useCallback(async () => {
    if (syncingRef.current) return;

    syncingRef.current = true;

    try {
      const response = await authFetch('/messages');

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (!Array.isArray(data.message_list)) {
        return;
      }

      // SQLite 갱신
      await saveMessages(data.message_list);

      // SQLite에서 다시 읽기
      const localMessages = await getMessages();

      if (mountedRef.current) {
        setMessages(localMessages);
        setTotal(localMessages.length);
      }

    } catch (error) {
      console.error('Message sync failed:', error);
    } finally {
      syncingRef.current = false;

      if (mountedRef.current) {
        setRefreshing(false);
      }
    }
  }, []);

  // 외부에서 호출하는 동기화 함수
  const fetchMessages = useCallback(async () => {
    const state = await NetInfo.fetch();

    if (
      state.isConnected &&
      state.isInternetReachable !== false
    ) {
      await syncMessages();
    }
  }, [syncMessages]);

  // 수동 새로고침
  const refreshMessages = useCallback(async () => {
    const state = await NetInfo.fetch();

    if (
      !state.isConnected ||
      state.isInternetReachable === false
    ) {
      return;
    }

    setRefreshing(true);
    await syncMessages();
  }, [syncMessages]);

  // 메시지 삭제
  const handleDeleteMessage = useCallback(async (messageId) => {
    try {
      const response = await authFetch(
        `/messages/hide/${messageId}`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        // 서버 삭제 성공 후 SQLite 삭제
        await deleteMessageFromDB(messageId);

        const localMessages = await getMessages();

        if (mountedRef.current) {
          setMessages(localMessages);
          setTotal(localMessages.length);
        }

        return true;
      }

      return false;

    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // 인터넷 연결 감지
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (
        state.isConnected &&
        state.isInternetReachable !== false
      ) {
        syncMessages();
      }
    });

    // SQLite 먼저 로딩
    const initialize = async () => {
      await loadLocalMessages();

      const state = await NetInfo.fetch();

      if (
        state.isConnected &&
        state.isInternetReachable !== false
      ) {
        syncMessages();
      }
    };

    initialize();

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [loadLocalMessages, syncMessages]);

  return (
    <MessageContext.Provider
      value={{
        messages,
        total,
        loading,
        refreshing,
        fetchMessages,
        handleDeleteMessage,
        refreshMessages,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessageContext = () => useContext(MessageContext);
