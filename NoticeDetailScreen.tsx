import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { BASE_URL } from './Config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NoticeDetailScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const route = useRoute();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  /*const fetchNoticeRead = async () => {
    try {
      const response = await fetch(`${BASE_URL}/notices/read/${route.params.id}`, {
        method: 'POST',
      });

      if (response.ok) {
      } else {
        throw new Error('Failed to fetch message data');
      }
    } catch (error) {
      console.error('Error fetching message:', error);
    }
  }; */

  const fetchNotice= async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const response = await fetch(`${BASE_URL}/notices/${route.params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Always mark as read when viewing the message
        // fetchNoticeRead();

        setNotice(data);
      } else {
        throw new Error('Failed to fetch notice data');
      }
    } catch (error) {
      console.error('Error fetching notice:', error);
    } finally {
      setLoading(false);
    }
  };

  const goBackToList = () => {
    navigation.setParams({ refresh: true });
  };

  useEffect(() => {
    fetchNotice();
  }, [navigation, route.params.id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!notice) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>{t('common.error')}</Text>
        <Text style={styles.errorMessage}>{t('message.noMessage')}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>{t('common.backToList')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.contentContainer}>
            <Text style={styles.title}>{notice.title}</Text>
            <Text style={styles.contentText}>{notice.content}</Text>
          </View>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>{t('common.backToList')}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  contentContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  backButton: {
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  }
});

export default NoticeDetailScreen;