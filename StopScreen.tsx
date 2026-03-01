import React, { useState, useCallback } from 'react';
import {
  Alert,
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { authFetch } from './src/utils/api';

const StopScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
  useCallback(() => {
    // 화면이 포커스될 때마다 실행
    fetchStops();
  }, [])
  );

  const handleDeleteStop = async (stopId) => {
    try {
      const response = await authFetch(`/stops/hide/${stopId}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        // Refresh the messages list after successful deletion
        fetchStops();
      }
    } catch (error) {
      console.error('Error deleting counsel:', error);
    }
  };  

  const fetchStops = async () => {
    try {
      const response = await authFetch(`/stops`, {
        headers: { "Content-Type": "application/json" },
      });
  
      const data = await response.json();
      setStops(data.stop_list);
      setLoading(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

    const showConfirm = (stopId) => {
    Alert.alert(
      '삭제 확인',
      '정말로 삭제하시겠습니까?',
      [
        {
          text: '취소',
          onPress: () => console.log('Cancel'),
          style: 'cancel',
        },
        {
          text: '확인',
          onPress: () => handleDeleteStop(stopId),
        },
      ],
      { cancelable: true }
    );
  };


  if (loading) {
    return (
      <View style={styles.screenContainer}>
        <Text>Loading Stops...</Text>
      </View>
    );
  }

const renderStopItem = ({ item }) => {
  const handlePress = () => {
    navigation.navigate('StopDetail', { id: item.id });
  };

  return (
  <View style={styles.stopItem}>
    <TouchableOpacity onPress={handlePress} style={styles.stopInfo}>
      <Text style={styles.stopTitle}>
        {item.stop_start_date} ~ {item.stop_end_date}
      </Text>
      <Text style={styles.stopCreatedAt}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>

    <View style={styles.rightSection}>
      {item.complete ? (
        <View style={styles.approvedBadge}>
          <Text style={styles.approvedText}>승인 됨</Text>
        </View>
      ) : (
        <>
          <Text style={styles.pendingText}>승인 대기중</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => showConfirm(item.id)}
          >
            <Text style={styles.deleteButtonText}>
              {t('common.delete')}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  </View>
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
stopItem: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 12,
  borderBottomWidth: 1,
  borderBottomColor: '#ccc',
  marginBottom: 8,
  marginLeft: 14,
  marginRight: 14,
  backgroundColor: '#fff',
  borderRadius: 8,
},

stopInfo: {
  flex: 1,
},

stopTitle: {
  fontSize: 16,
  fontWeight: 'bold',
},

stopCreatedAt: {
  fontSize: 12,
  color: '#666',
  marginTop: 4,
},

deleteButton: {
  backgroundColor: '#ff4444',
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 6,
  marginLeft: 10,
},

deleteButtonText: {
  color: 'white',
  fontSize: 14,
  fontWeight: '600',
},
rightSection: {
  alignItems: 'flex-end',
  justifyContent: 'center',
},

approvedBadge: {
  backgroundColor: '#E6F4EA',
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 20,
},

approvedText: {
  color: '#2E7D32',
  fontWeight: '700',
  fontSize: 13,
},

pendingText: {
  color: '#FF8C00',
  fontSize: 12,
  marginBottom: 6,
  fontWeight: '600',
},
});

export default StopScreen;