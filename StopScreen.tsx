import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from './Config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StopScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem("accessToken");
      const response = await fetch(`${BASE_URL}/stops`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setStops(data.counsel_list);
      setLoading(false);
    };

    fetchData().catch(error => {
      console.error('Error fetching stops:', error);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.screenContainer}>
        <Text>Loading Stops...</Text>
      </View>
    );
  }

  const renderStopItem = ({ item }) => {
    const handlePress = () => {
      navigation.navigate('StopDetail', { stop: item });
    };

    return (
      <TouchableOpacity onPress={handlePress} style={styles.stopItem}>
        <View style={styles.stopInfo}>
          <Text style={styles.stopTitle}>{item.title}</Text>
          <Text style={styles.stopCreatedAt}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
            <View style={styles.infoContainer}>
        <Text>회원권에 따른 휴회 가능 일수 안내</Text>
        <View>
        <Text>3개월권 미만 : 휴회 가능 일수 0일</Text>
        <Text>3개월권 : 휴회 가능일수 15일</Text>
        <Text>6개월권 : 휴회 가능일수 30일</Text>
        <Text>12개월권 : 휴회 가능일수 60일</Text>
        </View>
    <Text>*그 외 기타 회원권에 따른 휴회문의는 지점으로 직접 문의 부탁드립니다.</Text>
      </View>
      <FlatList
        data={stops}
        renderItem={renderStopItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.stopList}
        style={{ flexGrow: 1 }} 
      />
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('StopForm')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4 ',
  },
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
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  stopList: {
    padding: 8,
  },
  stopTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stopItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 8,
  },
  stopInfo: {
    flex: 1,
  },
  stopCreatedAt: {
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
});

export default StopScreen;