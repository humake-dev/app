import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute } from '@react-navigation/native';

const StopDetailScreen = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const counsel = route.params?.counsel;

  if (!counsel) {
    return (
      <View style={styles.container}>
        <Text>{t('common.noData')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{counsel.title}</Text>
        <Text style={styles.date}>
          {t('common.sent')} {new Date(counsel.created_at).toLocaleDateString()}
        </Text>
        <Text style={styles.contentText}>{counsel.content}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default StopDetailScreen;