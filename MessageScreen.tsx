import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMessageContext } from './MessageContext';

const MessageScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { messages, total, loading, handleDeleteMessage } = useMessageContext();

  if (loading) {
    return (
      <View>
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      </View>
    );
  }

  if (total === 0) {
    return (
      <View>
        <Text style={styles.noMessagesText}>{t('message.no_items')}</Text>
      </View>
    );
  }

  const renderMessageItem = ({ item }) => {
    const handlePress = () => {
      navigation.navigate('MessageDetail', { id: item.id });
    };

    return (
      <View style={styles.messageItem}>
        <TouchableOpacity onPress={handlePress} style={styles.messageInfo}>
          <Text style={styles.messageTitle}>{item.title}</Text>
          <Text style={styles.messageCreatedAt}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteMessage(item.id)}
        >
          <Text style={styles.deleteButtonText}>{t('common.delete')}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messageList}
        style={{ flexGrow: 1 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  noMessagesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  messageList: {
    padding: 8,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 8,
  },
  messageInfo: {
    flex: 1,
  },
  messageCreatedAt: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
  },
});

export default MessageScreen;