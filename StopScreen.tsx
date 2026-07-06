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

  const showConfirm =(stopId) => {
    Alert.alert(
      t('common.deleteConfirmTitle'),
      t('common.deleteConfirmMessage'),
      [
        {
          text: t('common.cancel'),
          onPress: () => console.log('Cancel'),
          style: 'cancel',
        },
        {
          text: t('common.confirm'),
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
          <Text style={styles.approvedText}>{t("stop.status.approved")}</Text>
        </View>
      ) : (
        <>
          <Text style={styles.pendingText}>{t("stop.status.pending")}</Text>
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
    <View>
      <Text>{t("stop.guide.lessThan3Months")}</Text>
      <Text>{t("stop.guide.threeMonths")}</Text>
      <Text>{t("stop.guide.sixMonths")}</Text>
      <Text>{t("stop.guide.twelveMonths")}</Text>
    </View>

    <Text>{t("stop.guide.etc")}</Text>
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