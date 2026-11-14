
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
  initializeNoticeTable,
  getNotices,
  saveNotices,
  saveNoticeDetail,
  getNoticeById,
} from '../database/noticeDatabase';

const NoticeContext = createContext(null);

export const NoticeProvider = ({ children }) => {
  const [notices, setNotices] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const syncingRef = useRef(false);
  const mountedRef = useRef(false);


// 공지사항 상세 조회 (SQLite 우선)
const fetchNoticeDetail = useCallback(async (id) => {
  const noticeId = String(id);

  // 1. SQLite에서 먼저 조회
  let localNotice = null;

  try {
    localNotice = await getNoticeById(noticeId);
  } catch (error) {
    console.error('SQLite notice lookup error:', error);
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
    return localNotice;
  }

  // 4. 온라인이면 서버에서 최신 데이터 조회
  try {
    const response = await authFetch(`/notices/${noticeId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const detail = data.notice || data;

    // 5. SQLite에 상세 데이터 저장
    await saveNoticeDetail(noticeId, detail);

    // 6. SQLite에서 최신 데이터 조회
    const updatedNotice = await getNoticeById(noticeId);

    // 7. Context 목록 갱신
    if (mountedRef.current && updatedNotice) {
      setNotices(prev =>
        prev.map(item =>
          String(item.id) === noticeId
            ? updatedNotice
            : item
        )
      );
    }

    return updatedNotice || localNotice;

  } catch (error) {
    console.error('Server notice detail error:', error);

    // 서버 오류 시 SQLite 데이터 사용
    return localNotice;
  }
}, []);


  // SQLite에서 공지사항 로딩
  const loadLocalNotices = useCallback(async () => {
    try {
      await initializeNoticeTable();

      const data = await getNotices();

      if (mountedRef.current) {
        setNotices(data || []);
        setTotal(data?.length || 0);
      }
    } catch (error) {
      console.error('Error loading local notices:', error);
    }
  }, []);

  // 서버에서 공지사항 동기화
  const syncNotices = useCallback(async () => {
    if (syncingRef.current) return;

    syncingRef.current = true;

    try {
      const networkState = await NetInfo.fetch();

      const isOnline =
        networkState.isConnected &&
        networkState.isInternetReachable !== false;

      if (!isOnline) return;

      const response = await authFetch('/notices', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notices');
      }

      const data = await response.json();

      if (!Array.isArray(data.notice_list)) {
        throw new Error('Invalid notice data');
      }

      // SQLite 저장
      await saveNotices(data.notice_list);

      // SQLite에서 다시 읽기
      const localNotices = await getNotices();

      if (mountedRef.current) {
        setNotices(localNotices || []);
        setTotal(data.total ?? localNotices.length);
      }
    } catch (error) {
      console.error('Error syncing notices:', error);
    } finally {
      syncingRef.current = false;
    }
  }, []);

  // 공지사항 가져오기
  const fetchNotices = useCallback(async () => {
    await syncNotices();
  }, [syncNotices]);

  // 새로고침
  const refreshNotices = useCallback(async () => {
    setRefreshing(true);

    try {
      await syncNotices();
    } finally {
      if (mountedRef.current) {
        setRefreshing(false);
      }
    }
  }, [syncNotices]);

  useEffect(() => {
    mountedRef.current = true;

    const initialize = async () => {
      try {
        // 1. SQLite 먼저 로딩
        await loadLocalNotices();
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }

      // 2. 인터넷 연결 시 서버 동기화
      await syncNotices();
    };

    initialize();

    // 3. 인터넷 연결 복구 시 자동 동기화
    const unsubscribe = NetInfo.addEventListener(state => {
      const isOnline =
        state.isConnected &&
        state.isInternetReachable !== false;

      if (isOnline) {
        syncNotices();
      }
    });

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [loadLocalNotices, syncNotices]);

  return (
    <NoticeContext.Provider
      value={{
        notices,
        total,
        loading,
        refreshing,
        fetchNotices,
        refreshNotices,
        fetchNoticeDetail, // 추가
      }}
    >
      {children}
    </NoticeContext.Provider>
  );
};

export const useNoticeContext = () => {
  const context = useContext(NoticeContext);

  if (!context) {
    throw new Error(
      'useNoticeContext must be used within NoticeProvider'
    );
  }

  return context;
};
