
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


  // 공지사항 상세 조회
  const fetchNoticeDetail = useCallback(async (id: string) => {
    const noticeId = String(id);

    try {
      // 1. SQLite에 저장된 상세 내용 확인
      const localNotice = notices.find(
        item => String(item.id) === noticeId
      );

      // 2. 오프라인이면 기존 SQLite 데이터 반환
      const networkState = await NetInfo.fetch();

      const isOnline =
        networkState.isConnected &&
        networkState.isInternetReachable !== false;

      if (!isOnline) {
        return localNotice || null;
      }

      // 3. 서버에서 상세 내용 조회
      const response = await authFetch(`/notices/${noticeId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notice detail');
      }

      const data = await response.json();

      // API 응답 구조에 따라 조정
      const detail = data.notice || data;

      // 4. SQLite에 상세 내용 저장
      await saveNoticeDetail(noticeId, detail);

      // 5. SQLite에서 최신 데이터 조회
      const updatedNotice = await getNoticeById(noticeId);

      // 6. Context 갱신
      if (mountedRef.current && updatedNotice) {
        setNotices(prev =>
          prev.map(item =>
            String(item.id) === noticeId
              ? updatedNotice
              : item
          )
        );
      }

      return updatedNotice;

} catch (error) {
  console.error('Error fetching notice detail:', error);
  return null;
}
  }, [notices]);


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
