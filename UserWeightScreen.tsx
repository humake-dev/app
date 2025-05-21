import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
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
        <TouchableOpacity onPress={handlePress} style={styles.messageInfo}>
          <Text style={styles.messageTitle}>{item.title}</Text>
          <Text style={styles.messageCreatedAt}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </TouchableOpacity>
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
      <FlatList
        data={userWeights}
        renderItem={renderUserWeightItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messageList}
        style={{ flexGrow: 1 }}
      />
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