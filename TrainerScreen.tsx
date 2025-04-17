import React, { useState, useEffect } from 'react';
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
      fetch('http://10.0.2.2:8000/trainers')
        .then(response => response.json())
        .then(data => {
          setTrainers(data.trainer_list);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching trainers:', error);
          setLoading(false);
        });
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

      return (
        <TouchableOpacity onPress={handlePress} style={styles.trainerItem}>
          <View style={styles.trainerImageContainer}>
            {item.picture && item.picture.picture_url ? (
              <Image
                source={{uri: `http://10.0.2.2:8000/${item.picture.picture_url}`}}
                style={styles.trainerImage}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>{item.name[0]}</Text>
              </View>
            )}
          </View>
          <View style={styles.trainerInfo}>
            <Text style={styles.trainerName}>{item.name}</Text>
            <Text style={styles.trainerCreatedAt}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
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