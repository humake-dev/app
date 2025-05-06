import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from './Config';

const NoticeScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchNotices = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/notices`);
      
      if (response.status === 401) {
        navigation.navigate('Login');
        return;
      }

      const data = await response.json();
      setNotices(data.notice_list);
      setLoading(false);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching notices:', error);
      setLoading(false);
    }
  }, [navigation]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  if (loading) {
    return (
      <View>
        <Text>Loading Notices...</Text>
      </View>
    );
  }

  if (total === 0) {
    return (
      <View>
        <Text style={styles.noNoticesText}>{t('notice.no_items')}</Text>
      </View>
    );
  }

  const renderNoticeItem = ({ item }) => {
    const handlePress = () => {
      navigation.navigate('NoticeDetail', { id: item.id});
    };

    return (
      <View style={styles.noticeItem}>
        <TouchableOpacity onPress={handlePress} style={styles.noticeInfo}>
          <Text style={styles.noticeTitle}>{item.title}</Text>

        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={notices}
        renderItem={renderNoticeItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.noticeList}
        style={{ flexGrow: 1 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  noticeItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 8,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  noticeDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  noNoticesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default NoticeScreen;