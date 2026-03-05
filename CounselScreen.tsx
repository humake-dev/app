import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Alert,
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Animated
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { authFetch } from "./src/utils/api";

const CounselScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [counsels, setCounsels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
const [highlightId, setHighlightId] = useState(null);

const fadeAnim = useRef(new Animated.Value(0)).current;
const flatListRef = useRef(null);

  useFocusEffect(
  useCallback(() => {
    // 화면이 포커스될 때마다 실행
    fetchCounsels();
  }, [])
  );

  useEffect(() => {

  if (navigation?.getState()?.routes?.slice(-1)[0]?.params?.highlightId) {

    const id = navigation.getState().routes.slice(-1)[0].params.highlightId;

    setHighlightId(id);

    fadeAnim.setValue(1);

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1500,
      useNativeDriver: false
    }).start();

    setTimeout(() => {
      flatListRef.current?.scrollToOffset({
        offset: 0,
        animated: true
      });
    }, 200);

  }

}, []);

  const handleDeleteCounsel = async (counselId) => {
    try {
      const response = await authFetch(`/counsels/hide/${counselId}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        // Refresh the messages list after successful deletion
        fetchCounsels();
      }
    } catch (error) {
      console.error('Error deleting counsel:', error);
    }
  };

const fetchCounsels = async () => {
  try {
    const response = await authFetch(`/counsels`, {
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    setCounsels(data.counsel_list);
    setTotal(data.total || 0);
  } catch (e) {
    console.error(e);
  } finally {
    setLoading(false);
  }
};

    const showConfirm = (counselId) => {
    Alert.alert(
      '삭제 확인',
      '정말로 삭제하시겠습니까?',
      [
        {
          text: '취소',
          onPress: () => console.log('Cancel'),
          style: 'cancel',
        },
        {
          text: '확인',
          onPress: () => handleDeleteCounsel(counselId),
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.screenContainer}>
        <Text>Loading Counsels...</Text>
      </View>
    );
  }

  if (total === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('counsel.no_items')}</Text>
        <TouchableOpacity 
          style={styles.emptyButton}
          onPress={() => navigation.navigate('CounselForm')}
        >
          <Text style={styles.emptyButtonText}>{t('counsel.add')}</Text>
        </TouchableOpacity>
      </View>
    );
  }  

const renderCounselItem = ({ item }) => {

  const handlePress = () => {
    navigation.navigate('CounselDetail', { id: item.id });
  };

  const isHighlight = item.id === highlightId;

  const bgColor = isHighlight
    ? fadeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["#fff", "#FFF3A0"]
      })
    : "#fff";

  return (
    <Animated.View
      style={[
        styles.counselItem,
        { backgroundColor: bgColor }
      ]}
    >
      
      <TouchableOpacity onPress={handlePress} style={styles.counselInfo}>
        <View style={styles.titleRow}>
          <Text style={styles.counselTitle}>{item.title}</Text>

          {item.has_response ? (
            <View style={styles.responseBadge}>
              <Text style={styles.responseBadgeText}>
                {t('counsel.response')}
              </Text>
            </View>
          ) : (
            <View style={styles.waitingBadge}>
              <Text style={styles.waitingBadgeText}>
                {t('counsel.waiting')}
              </Text>
            </View>
          )}

        </View>

        <Text style={styles.counselCreatedAt}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => showConfirm(item.id)}
      >
        <Text style={styles.deleteButtonText}>{t('common.delete')}</Text>
      </TouchableOpacity>

    </Animated.View>
  );
};

  return (
    <View style={{ flex: 1 }}>
<FlatList
  ref={flatListRef}
  data={counsels}
  renderItem={renderCounselItem}
  keyExtractor={(item) => item.id.toString()}
  contentContainerStyle={styles.counselList}
/>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('CounselForm')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    width: 200,
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
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noCounselsText: {
    fontSize: 16,
    color: '#666',
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
    alignItems: 'center',
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
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
  },
rightActions: {
  flexDirection: "row",
  alignItems: "center",
},

responseBadge: {
  backgroundColor: "#4CAF50",
  marginTop: 5,
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 10,
  marginRight: 8,
},

responseBadgeText: {
  color: "#fff",
  fontSize: 12,
  fontWeight: "600",
},
titleRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between"
},
waitingBadge: {
  marginLeft: 8,
  backgroundColor: "#FFF3CD",
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: 6
},

waitingBadgeText: {
  fontSize: 11,
  color: "#856404",
  fontWeight: "600"
},
});

export default CounselScreen;