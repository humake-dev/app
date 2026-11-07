
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import NetInfo from '@react-native-community/netinfo';
import { useTranslation } from 'react-i18next';

import { authFetch } from './src/utils/api';

import {
  getNotices,
  saveNotices,
  initializeNoticeTable,
} from './src/database/noticeDatabase';

const NoticeScreen = ({ navigation }) => {
  const { t } = useTranslation();

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const syncingRef = useRef(false);
  const mountedRef = useRef(true);

  // 서버 동기화
  const syncNotices = useCallback(async () => {
    if (syncingRef.current) return;

    syncingRef.current = true;

    try {
      const response = await authFetch('/notices', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (!Array.isArray(data.notice_list)) {
        return;
      }

      // SQLite 갱신
      await saveNotices(data.notice_list);

      // 갱신된 SQLite 데이터 다시 조회
      const localNotices = await getNotices();

      if (mountedRef.current) {
        setNotices(localNotices);
      }

    } catch (error) {
      console.log('Notice sync failed:', error);
      // 오류 발생 시 기존 SQLite 데이터 유지
    } finally {
      syncingRef.current = false;
      if (mountedRef.current) {
        setRefreshing(false);
      }
    }
  }, []);

  // 로컬 데이터 먼저 조회
  const loadLocalNotices = useCallback(async () => {
    try {
      await initializeNoticeTable();

      const localNotices = await getNotices();

      if (mountedRef.current) {
        setNotices(localNotices);
        setLoading(false);
      }

    } catch (error) {
      console.error('SQLite read error:', error);

      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // 수동 새로고침
  const handleRefresh = useCallback(async () => {
    const state = await NetInfo.fetch();

    if (
      state.isConnected &&
      state.isInternetReachable !== false
    ) {
      setRefreshing(true);
      await syncNotices();
    }
  }, [syncNotices]);

  useEffect(() => {
    mountedRef.current = true;

    // 네트워크 연결 감지
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (
        state.isConnected &&
        state.isInternetReachable !== false
      ) {
        syncNotices();
      }
    });

    // SQLite 먼저 읽고 서버 동기화
    const initialize = async () => {
      await loadLocalNotices();

      const state = await NetInfo.fetch();

      if (
        state.isConnected &&
        state.isInternetReachable !== false
      ) {
        syncNotices();
      }
    };

    initialize();

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [loadLocalNotices, syncNotices]);

  const renderNoticeItem = ({ item }) => {
    return (
      <View style={styles.noticeItem}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('NoticeDetail', {
              id: item.id,
            });
          }}
          style={styles.noticeInfo}
        >
          <Text style={styles.noticeTitle}>
            {item.title}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#007AFF"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notices}
        renderItem={renderNoticeItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={
          notices.length === 0
            ? styles.emptyContainer
            : styles.noticeList
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        ListEmptyComponent={
          <Text style={styles.noNoticesText}>
            {t('notice.no_items')}
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noticeList: {
    padding: 16,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  noticeItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 8,
  },
  noticeInfo: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  noNoticesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default NoticeScreen;
