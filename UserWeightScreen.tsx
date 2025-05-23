import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute } from '@react-navigation/native';
import { BASE_URL } from './Config';

const UserWeightScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [userWeights, setUserWeights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);


  // Handle refresh parameter from navigation
  const route = useRoute();
  useEffect(() => {
    if (route.params?.refresh) {
        fetchUserWeights();
    }
  }, [route.params]);


  const fetchUserWeights =async () => {
    try {
      const response = await fetch(`${BASE_URL}/user_weights`);
      
      if (response.status === 401) {
        navigation.navigate('Login');
        return;
      }

      if(response.ok){
        const data = await response.json();
        setUserWeights(data.user_weights);
        setLoading(false);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
      fetchUserWeights();
  }, []);

  if (loading) {
    return (
      <View style={styles.screenContainer}>
        <Text>Loading Messages...</Text>
      </View>
    );
  }

  if (total === 0) {
    return (
      <View style={styles.screenContainer}>
        <Text style={styles.noMessagesText}>{t('message.no_items')}</Text>
        <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('UserWeightForm')}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
      </View>
    );
  }

  const renderUserWeightItem = ({ item }) => {
    const handlePress = () => {
      navigation.navigate('UserWeightDetail', { id: item.id });
    };

    return (
      <View style={styles.messageItem}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteMessage(item.id)}
        >
          <Text style={styles.deleteButtonText}>{t('common.delete')}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
        <View style={styles.infoContainer}>
          <View>
          <Text>{t('user_weight.weight')}</Text>
            <Image source={require('./assets/ico_weight1.png')} />
          </View>
          <View>
            <Text>{t('user_weight.bmi')}</Text>
            <Image source={require('./assets/ico_weight2.png')} />
          </View>
        </View>
        <View>
          <Text>일간</Text>
          <Text>주간</Text>
          <Text>월간</Text>
        </View>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('UserWeightForm')}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  infoContainer: {
    margin: 20,
    padding: 25,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  
  noMessagesText: {
    fontSize: 16,
    color: '#666',
  },
  messageList: {
    padding: 8,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 8,
    alignItems: 'center',
  },
  messageInfo: {
    flex: 1,
  },
  messageCreatedAt: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 45,  
    fontWeight: 'bold',
    bottom: 3
  },
});

export default UserWeightScreen;