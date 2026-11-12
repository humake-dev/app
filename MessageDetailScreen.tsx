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
import { useMessageContext } from './src/contexts/MessageContext';
import { authFetch } from './src/utils/api';

const MessageDetailScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const route = useRoute();

  const { messages,fetchMessageDetail } = useMessageContext();

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadMessage = async () => {
      try {
        const data = await fetchMessageDetail(route.params?.id);

        if (mounted) {
          setMessage(data);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (route.params?.id) {
      loadMessage();
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [route.params?.id, fetchMessageDetail]);

  // 상담 ID가 없을 때
  if (!route.params?.id) {
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

  const fetchMessageRead = async () => {
    try {
            const response = await authFetch(`/messages/read/${route.params.id}`, {
              method: 'POST',
              headers: {
                "Content-Type": "application/json",
              },
            });

      if (response.ok) {
      } else {
        throw new Error('Failed to fetch message data');
      }
    } catch (error) {
      console.error('Error fetching message:', error);
    }
  };

  useEffect(() => {
  if (!route.params?.id) {
    setLoading(false);
    return;
  }

  const data = messages.find(
    item => String(item.id) === String(route.params.id)
  );

  setMessage(data || null);
  setLoading(false);
}, [messages, route.params?.id]);

  const goBackToList = () => {
    navigation.setParams({ refresh: true });
  };


  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!message) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>{t('common.error')}</Text>
        <Text style={styles.errorMessage}>{t('message.noData')}</Text>
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
            <Text style={styles.date}>
              {new Date(message.created_at).toLocaleDateString()}
            </Text>
            <Text style={styles.title}>{message.title}</Text>
            <Text style={styles.contentText}>{message.content}</Text>
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
  },
  closeButton: {
    position: 'absolute',
    right: 8,
    top: 10,
    zIndex: 99,
  },  
});

export default MessageDetailScreen;