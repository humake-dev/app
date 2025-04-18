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

const TrainerScreen = ({navigation}) => {
    const { t } = useTranslation();
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      fetchTrainers();
    }, [fetchTrainers]);

    const fetchTrainers = useCallback(async () => {
      try {
        const response = await fetch('http://10.0.2.2:8000/trainers');
        
        if (response.status === 401) {
          navigation.navigate('Login');
          return;
        }

        const data = await response.json();
        setTrainers(data.trainer_list);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching trainers:', error);
        setLoading(false);
      }
    }, [navigation]);
  
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

      return (
        <TouchableOpacity onPress={handlePress} style={styles.trainerItem}>
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
            <Text style={styles.trainerName}>{item.name}</Text>
          </View>
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
    justifyContent: 'center'
  },
  trainerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  trainerCreatedAt: {
    fontSize: 12,
    color: '#666',
  },
});

export default TrainerScreen;