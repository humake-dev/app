import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from './Config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NoticeScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchNotices = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const response = await fetch(`${BASE_URL}/notices`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if(response.ok){
        const data = await response.json();

        setTotal(data.total);

        if(data.total) {
          setNotices(data.notice_list);
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching notices:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  if (loading) {
    return (
      <View>
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
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