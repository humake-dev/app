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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BASE_URL } from './Config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CounselDetailScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const route = useRoute();
  const [counsel, setCounsel] = useState(null);
  const [loading, setLoading] = useState(true);

  // 상담 ID가 없을 때
  if (!route.params?.id) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>{t('common.error')}</Text>
        <Text style={styles.errorMessage}>{t('counsel.noConsultation')}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>{t('common.backToList')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fetchCounsel = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const response = await fetch(`${BASE_URL}/counsels/${route.params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCounsel(data);
      } else {
        throw new Error('Failed to fetch counsel data');
      }
    } catch (error) {
      console.error('Error fetching counsel:', error);
    } finally {
      setLoading(false);
    }
  };

  const hideCounsel = async () => {
    try {
      const response = await fetch(`${BASE_URL}/counsels/hide/${route.params.id}`, {
        method: 'POST',
      });

      if (response.ok) {
        // Refresh the previous screen before going back
        navigation.setParams({ refresh: true });
        navigation.goBack();
      } else {
        throw new Error('Failed to hide message');
      }
    } catch (error) {
      console.error('Error hiding message:', error);
    }
  };

  useEffect(() => {
    fetchCounsel();
  }, [navigation, route.params.id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!counsel) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>{t('common.error')}</Text>
        <Text style={styles.errorMessage}>{t('counsel.noData')}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>{t('common.backToList')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons 
          name="close-circle" 
          size={24} 
          color="#666"
          style={styles.closeButton}
          onPress={hideCounsel}
        />
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.contentContainer}>
              <Text style={styles.date}>
                {new Date(counsel.created_at).toLocaleDateString()}
              </Text>
            <Text style={styles.contentText}>{counsel.content}</Text>
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
    flex: 1,
  },
  header: {
    height: 50,
    justifyContent: 'flex-end',
    paddingRight: 16,
  },
  closeButton: {
    position: 'absolute',
    right: 8,
    top: 55,
    zIndex: 99,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  date: {
    fontSize: 14,
    color: '#666',
    alignSelf: 'flex-end',
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

export default CounselDetailScreen;