
import React from 'react';

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { useTranslation } from 'react-i18next';
import { useNoticeContext } from './src/contexts/NoticeContext';

const NoticeScreen = ({ navigation }) => {
  const { t } = useTranslation();

  const {
    notices,
    loading,
    refreshing,
    refreshNotices,
  } = useNoticeContext();

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
        keyExtractor={item => String(item.id)}
        contentContainerStyle={
          notices.length === 0
            ? styles.emptyContainer
            : styles.noticeList
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshNotices}
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
