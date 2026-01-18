import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useUser } from './UserContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { authFetch } from './src/utils/api';

const TrainerScreen = ({navigation}) => {
    const { t } = useTranslation();
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const userContext = useUser();
    const user = userContext?.user;
  
useEffect(() => {
  const fetchTrainers = async () => {
    try {
      const response = await authFetch(`/trainers`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trainers data');
      }

      const data = await response.json();
      setTrainers(data.trainer_list);
    } catch (error) {
      console.error('Error fetching trainers:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchTrainers();
}, []);
  
    if (loading) {
      return (
        <View style={styles.screenContainer}>
          <Text>Loading trainers...</Text>
        </View>
      );
    }
  
    const renderTrainerItem = ({item}) => {
      const handlePress = () => {
        navigation.navigate('TrainerDetail', { id: item.id });
      };

      const isUserTrainer = user?.trainer?.id === item.id;
      
      return (
        <TouchableOpacity onPress={handlePress} style={[styles.trainerItem,isUserTrainer && styles.highlightedTrainerItem]}>
          <View style={styles.trainerImageContainer}>
            {item.picture && item.picture.picture_url ? (
              <Image
                source={{uri: `https://humake.blob.core.windows.net/humake/employee/${item.branch_id}/${item.picture.picture_url}`}}
                style={styles.trainerImage}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={require('./assets/photo_none.gif')}
                style={styles.trainerImage}
                resizeMode="cover"
              />
            )}
          </View>
          <View style={styles.trainerInfo}>
            <Text style={[styles.trainerName,isUserTrainer && { color : '#ff8d1d', fontWeight: 'bold'}]}>{item.name}</Text>
          </View>
          {isUserTrainer && (
            <Ionicons 
              name="checkmark-circle" 
              size={24} 
              color="green" 
              style={styles.checkIcon}
            />
          )}
        </TouchableOpacity>
      );
    };
    
  
    return (
      <View style={{ flex: 1 }}>
      <FlatList
        data={trainers}
        renderItem={renderTrainerItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.trainerList}
        style={{ flexGrow: 1 }} 
      />
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
trainerList: {
    padding: 8,
  },
trainerItem: {
  flexDirection: 'row',
  padding: 12,
  borderBottomWidth: 1,
  borderBottomColor: '#ccc',
  marginBottom: 8,
  position: 'relative', // Add position relative to make space for icon
},
trainerImageContainer: {
  width: 60,
  height: 60,
  borderRadius: 30,
  marginRight: 12,
  overflow: 'hidden',
},
trainerImage: {
  width: '100%',
  height: '100%',
},
trainerInfo: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8, // Add margin to make space for icon
  },
  trainerName: {
    fontSize: 16,
    color : '#333'
  },
  trainerCreatedAt: {
    fontSize: 12,
    color: '#666',
  },
  highlightedTrainerItem: {
    backgroundColor: '#fff',
    borderRadius : 5
  },
  checkIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
});

export default TrainerScreen;