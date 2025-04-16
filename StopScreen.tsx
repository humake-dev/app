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

const StopScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://10.0.2.2:8000/stops')
      .then(response => response.json())
      .then(data => {
        setStops(data.counsel_list);
        setLoading(false);
      })
      .catch(error => {
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
        <Text style={styles.addButtonText}>{t('stop.add')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
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
    bottom: 20,
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
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default StopScreen;