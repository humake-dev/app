import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import SQLite from 'react-native-sqlite-storage';

  
SQLite.DEBUG(true);
SQLite.enablePromise(true);

const openDatabase = async () => {
  try {
    const db = await SQLite.openDatabase({ 
      name: 'exercise.db', 
      location: 'default',
      createFromLocation: 1,
      assetFilename: 'exercise.db'
    });
    console.log('✅ DB 연결 성공');
    return db;
  } catch (error) {
    console.error('❌ DB 연결 실패:', error);
    throw error;
  }
};

const fetchCategories = async () => {
  try {
    const db = await openDatabase();
    console.log(db);

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        console.log('카테고리 조회 시작');
        tx.executeSql(
          'SELECT * FROM exercise_categories',
          [],
          (tx, results) => {
            const rows = results.rows;
            const categories = [];
            for (let i = 0; i < rows.length; i++) {
              categories.push(rows.item(i));
            }
            console.log('카테고리 조회 성공:', categories);
            resolve(categories);
          },
          (tx, error) => {
            console.error('쿼리 실패:', error);
            reject(error);
          }
        );
      });
    });
  } catch (err) {
    console.error('전체 실패:', err);
    return [];
  }
};


const ExerciseScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);



  const renderCategoryItem = (category) => (
    <TouchableOpacity
      key={category.id} // 'category' 객체에 id가 있다고 가정
      style={[
        styles.categoryButton,
        selectedCategory === category.id && styles.categoryButtonActive,
      ]}
      onPress={() => setSelectedCategory(category.id)} // id로 selectedCategory 상태 변경
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === category.id && styles.categoryTextActive,
        ]}
      >
        {category.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
{categories.map(category => renderCategoryItem(category))}
      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  categoryScroll: { paddingVertical: 10 },
  categoryContainer: { paddingHorizontal: 10 },
  categoryButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: '#eee',
    borderRadius: 20,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    color: '#333',
  },
  categoryTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  itemBox: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
});

export default ExerciseScreen;
