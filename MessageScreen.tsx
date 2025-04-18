import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { useTranslation } from 'react-i18next';

const MessageScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await fetch(`http://10.0.2.2:8000/messages/hide/${messageId}`, {
        method: 'POST',
      });
      
      if (response.status === 401) {
        navigation.navigate('Login');
        return;
      }
      
      if (response.ok) {
        // Refresh the messages list after successful deletion
        fetchMessages();
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch('http://10.0.2.2:8000/messages');
      
      if (response.status === 401) {
        navigation.navigate('Login');
        return;
      }

      const data = await response.json();
      console.log(data);
      setMessages(data.message_list);
      setLoading(false);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  }, [navigation]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  if (loading) {
    return (
      <View style={styles.screenContainer}>
        <Text>Loading Messages...</Text>
      </View>
    );
  }

  if (total === 0) {
    return (
      <View style={styles.screenContainer}>
        <Text style={styles.noMessagesText}>{t('message.no_items')}</Text>
      </View>
    );
  }

  const renderMessageItem = ({ item }) => {
    const handlePress = () => {
      navigation.navigate('MessageDetail', { message: item });
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
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  noMessagesText: {
    fontSize: 16,
    color: '#666',
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
    alignItems: 'center',
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