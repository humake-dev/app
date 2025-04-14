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

const CounselScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [counsels, setCounsels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://10.0.2.2:8000/counsels')
      .then(response => response.json())
      .then(data => {
        setCounsels(data.counsel_list);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching counsels:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={styles.screenContainer}>
        <Text>Loading Counsels...</Text>
      </View>
    );
  }

  const renderCounselItem = ({ item }) => {
    const handlePress = () => {
      navigation.navigate('CounselDetail', { counsel: item });
    };

    return (
      <TouchableOpacity onPress={handlePress} style={styles.counselItem}>
        <View style={styles.counselInfo}>
          <Text style={styles.counselTitle}>{item.title}</Text>
          <Text style={styles.counselCreatedAt}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={counsels}
        renderItem={renderCounselItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.counselList}
        style={{ flexGrow: 1 }} 
      />
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('CounselForm')}
      >
        <Text style={styles.addButtonText}>{t('counsel.add')}</Text>
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

export default CounselScreen;