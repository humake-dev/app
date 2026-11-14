
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import NetInfo from '@react-native-community/netinfo';

import { authFetch } from '../utils/api';

import {
  initializeMessageTable,
  getMessages,
  saveMessages,
  saveMessageDetail,
  getMessageById,
  deleteMessageFromDB
} from '../database/messageDatabase';

const MessageContext = createContext(null);

export const MessageProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const syncingRef = useRef(false);
  const mountedRef = useRef(false);

// 공지사항 상세 조회 (SQLite 우선)
const fetchMessageDetail = useCallback(async (id) => {
  const messageId = String(id);

  // 1. SQLite에서 먼저 조회
  let localMessage = null;

  try {
    localMessage = await getMessageById(messageId);
  } catch (error) {
    console.error('SQLite message lookup error:', error);
  }

  // 2. 네트워크 확인
  let isOnline = false;

  try {
    const networkState = await NetInfo.fetch();

    isOnline =
      networkState.isConnected === true &&
      networkState.isInternetReachable !== false;
  } catch (error) {
    console.error('Network check error:', error);
  }

  // 3. 오프라인이면 SQLite 데이터 반환
  if (!isOnline) {
    return localMessage;
  }

  // 4. 온라인이면 서버에서 최신 데이터 조회
  try {
    const response = await authFetch(`/messages/${messageId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const detail = data.message || data;

    // 5. SQLite에 상세 데이터 저장
    await saveMessageDetail(messageId, detail);

    // 6. SQLite에서 최신 데이터 조회
    const updatedMessage = await getMessageById(messageId);

    // 7. Context 목록 갱신
    if (mountedRef.current && updatedMessage) {
      setMessages(prev =>
        prev.map(item =>
          String(item.id) === messageId
            ? updatedMessage
            : item
        )
      );
    }

    return updatedMessage || localMessage;

  } catch (error) {
    console.error('Server message detail error:', error);

    // 서버 오류 시 SQLite 데이터 사용
    return localMessage;
  }
}, []);


  // SQLite에서 공지사항 로딩
  const loadLocalMessages = useCallback(async () => {
    try {
      await initializeMessageTable();

      const data = await getMessages();

      if (mountedRef.current) {
        setMessages(data || []);
        setTotal(data?.length || 0);
      }
    } catch (error) {
      console.error('Error loading local messages:', error);
    }
  }, []);

   // 메시지 삭제
  const handleDeleteMessage = useCallback(async (messageId) => {
     try {
      const response = await authFetch(
        `/messages/hide/${messageId}`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {        // 서버 삭제 성공 후 SQLite 삭제
        await deleteMessageFromDB(messageId);

        const localMessages = await getMessages();

        if (mountedRef.current) {
          setMessages(localMessages);
          setTotal(localMessages.length);
        }
      }
      await syncMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;          
    } finally {
      if (mountedRef.current) {
        setRefreshing(false);
       }
    }

  }, [syncMessages]);


  // 서버에서 공지사항 동기화
  const syncMessages = useCallback(async () => {
    if (syncingRef.current) return;

    syncingRef.current = true;

    try {
      const networkState = await NetInfo.fetch();

      const isOnline =
        networkState.isConnected &&
        networkState.isInternetReachable !== false;

      if (!isOnline) return;

      const response = await authFetch('/messages', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();

      if (!Array.isArray(data.message_list)) {
        throw new Error('Invalid message data');
      }

      // SQLite 저장
      await saveMessages(data.message_list);

      // SQLite에서 다시 읽기
      const localMessages = await getMessages();

      if (mountedRef.current) {
        setMessages(localMessages || []);
        setTotal(data.total ?? localMessages.length);
      }
    } catch (error) {
      console.error('Error syncing messages:', error);S
    } finally {
      syncingRef.current = false;
    }
  }, []);

  // 메시지 가져오기
  const fetchMessages = useCallback(async () => {
    await syncMessages();
  }, [syncMessages]);

  // 새로고침
  const refreshMessages = useCallback(async () => {
    setRefreshing(true);

    try {
      await syncMessages();
    } finally {
      if (mountedRef.current) {
        setRefreshing(false);
      }
    }
  }, [syncMessages]);

  useEffect(() => {
    mountedRef.current = true;

    const initialize = async () => {
      try {
        // 1. SQLite 먼저 로딩
        await loadLocalMessages();
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }

      // 2. 인터넷 연결 시 서버 동기화
      await syncMessages();
    };

    initialize();

    // 3. 인터넷 연결 복구 시 자동 동기화
    const unsubscribe = NetInfo.addEventListener(state => {
      const isOnline =
        state.isConnected &&
        state.isInternetReachable !== false;

      if (isOnline) {
        syncMessages();
      }
    });

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
        refreshMessages,
        fetchMessageDetail, // 추가
        handleDeleteMessage
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};



export const useMessageContext = () => {
  const context = useContext(MessageContext);

  if (!context) {
    throw new Error(
      'useMessageContext must be used within MessageProvider'
    );
  }

  return context;
};
