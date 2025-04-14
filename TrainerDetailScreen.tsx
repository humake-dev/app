import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute } from '@react-navigation/native';

const TrainerDetailScreen = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const trainer = route.params?.trainer;

  if (!trainer) {
    return (
      <View style={styles.container}>
        <Text>{t('common.noData')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {trainer.picture && trainer.picture.picture_url ? (
          <Image
            source={{ uri: `http://10.0.2.2:8000/${trainer.picture.picture_url}` }}
            style={styles.profileImage}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>{trainer.name[0]}</Text>
          </View>
        )}
        <Text style={styles.name}>{trainer.name}</Text>
        <Text style={styles.createdAt}>
          {t('common.joined')} {new Date(trainer.created_at).toLocaleDateString()}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  createdAt: {
    fontSize: 16,
    color: '#666',
  },
});

export default TrainerDetailScreen;