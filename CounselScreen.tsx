import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,

} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './Config';

const CounselScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [counsels, setCounsels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const handleDeleteCounsel = async (counselId) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");      
      const response = await fetch(`${BASE_URL}/counsels/hide/${counselId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        // Refresh the messages list after successful deletion
        fetchCounsels();
      }
    } catch (error) {
      console.error('Error deleting counsel:', error);
    }
  };

  const fetchCounsels = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const response = await fetch(`${BASE_URL}/counsels`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setCounsels(data.counsel_list);
      setLoading(false);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching counsels:', error);
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCounsels();
  }, [fetchCounsels]);

  if (loading) {
    return (
      <View style={styles.screenContainer}>
        <Text>Loading Counsels...</Text>
      </View>
    );
  }

  if (total === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('counsel.no_items')}</Text>
        <TouchableOpacity 
          style={styles.emptyButton}
          onPress={() => navigation.navigate('CounselForm')}
        >
          <Text style={styles.emptyButtonText}>{t('counsel.add')}</Text>
        </TouchableOpacity>
      </View>
    );
  }  

  const renderCounselItem = ({ item }) => {
    const handlePress = () => {
      navigation.navigate('CounselDetail', { id: item.id });
    };

    return (
      <View style={styles.counselItem}>
      <TouchableOpacity onPress={handlePress} style={styles.counselInfo}>
          <Text style={styles.counselTitle}>{item.title}</Text>
          <Text style={styles.counselCreatedAt}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
      </TouchableOpacity>
              <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteCounsel(item.id)}
            >
              <Text style={styles.deleteButtonText}>{t('common.delete')}</Text>
            </TouchableOpacity>
        </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={counsels}
        renderItem={renderCounselItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.counselList}
      />
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('CounselForm')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    width: 200,
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
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noCounselsText: {
    fontSize: 16,
    color: '#666',
  },
  counselList: {
    padding: 8,
  },
  counselTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  counselItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 8,
    alignItems: 'center',
  },
  counselInfo: {
    flex: 1,
  },
  counselCreatedAt: {
    fontSize: 12,
    color: '#666',
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
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
  },
});

export default CounselScreen;