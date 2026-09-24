import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';

import db from './src/database/database';
import { initializeExerciseDatabaseWithSeed } from './src/database/exerciseDatabase';

const ExerciseScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * ExerciseScreen 최초 진입 시
   * 운동 DB 초기화 → seed → 카테고리 조회
   */
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        // 운동 DB 초기화 + seed
        await initializeExerciseDatabaseWithSeed();

        // 카테고리 조회
        const data = await fetchCategories();

        setCategories(data);

        // 첫 번째 카테고리 자동 선택
        if (data.length > 0) {
          setSelectedCategory(data[0].id);
        }
      } catch (error) {
        console.error('운동 화면 초기화 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  /**
   * 카테고리가 선택되면 해당 운동 조회
   */
  useEffect(() => {
    if (selectedCategory === null) {
      return;
    }

    const loadExercises = async () => {
      const data = await fetchExercises(selectedCategory);

      setExercises(data);
      setSelectedExercise(null);
    };

    loadExercises();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      console.log('카테고리 조회 시작');

      const result = await db.executeAsync(`
        SELECT *
        FROM exercise_categories
        ORDER BY id ASC
      `);

      const categories = result.rows?._array ?? [];

      console.log('카테고리 조회 성공:', categories);

      return categories;
    } catch (error) {
      console.error('카테고리 조회 실패:', error);
      return [];
    }
  };

  const fetchExercises = async (categoryId: number) => {
    try {
      console.log('운동 조회 시작:', categoryId);

      const result = await db.executeAsync(
        `
          SELECT
            e.*,
            p.picture_url
          FROM exercises e
          LEFT JOIN exercise_pictures p
            ON p.id = (
              SELECT id
              FROM exercise_pictures
              WHERE exercise_id = e.id
              ORDER BY id ASC
              LIMIT 1
            )
          WHERE e.exercise_category_id = ?
          ORDER BY e.id ASC
        `,
        [categoryId],
      );

      const exercises = result.rows?._array ?? [];

      console.log('운동 조회 성공:', exercises);

      return exercises;
    } catch (error) {
      console.error('운동 조회 실패:', error);
      return [];
    }
  };

  const renderCategoryItem = (category: any) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryButton,
        selectedCategory === category.id &&
          styles.categoryButtonActive,
      ]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === category.id &&
            styles.categoryTextActive,
        ]}
      >
        {category.title}
      </Text>
    </TouchableOpacity>
  );

  const renderExerciseItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.exerciseItem}
      onPress={() => setSelectedExercise(item)}
    >
      <View style={styles.exerciseImageContainer}>
        {item.picture_url ? (
          <Image
            source={{
              uri: `https://humake.blob.core.windows.net/humake/exercise/${item.picture_url}`,
            }}
            style={styles.exerciseImage}
            resizeMode="cover"
          />
        ) : (
          <Image
            source={require('./assets/photo_none.gif')}
            style={styles.exerciseImage}
            resizeMode="cover"
          />
        )}
      </View>

      <View style={styles.exerciseInfo}>
        <Text>{item.title}</Text>

        <Text
          style={{
            color: '#ff8d1d',
            fontWeight: 'bold',
          }}
        >
          {item.content}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderExerciseDetail = () => {
    if (!selectedExercise) {
      return null;
    }

    return (
      <View style={styles.detailContainer}>
        <TouchableOpacity
          onPress={() => setSelectedExercise(null)}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>
            ← 목록으로
          </Text>
        </TouchableOpacity>

        <View style={styles.exerciseImageContainer}>
          {selectedExercise.picture_url ? (
            <Image
              source={{
                uri: `https://humake.blob.core.windows.net/humake/exercise/medium_thumb_${selectedExercise.picture_url}`,
              }}
              style={styles.exerciseImage}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={require('./assets/photo_none.gif')}
              style={styles.exerciseImage}
              resizeMode="cover"
            />
          )}
        </View>

        <Text style={styles.itemTextActive}>
          {selectedExercise.content}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          운동 정보를 준비하고 있습니다...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map(renderCategoryItem)}
      </ScrollView>

      {selectedExercise ? (
        renderExerciseDetail()
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={renderExerciseItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  loadingText: {
    marginTop: 12,
    color: '#666',
  },

  categoryScroll: {
    paddingVertical: 10,
    maxHeight: 70,
    height: 70,
  },

  categoryContainer: {
    paddingHorizontal: 10,
  },

  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#eee',
    borderRadius: 20,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
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

  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fafafa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },

  exerciseImageContainer: {
    width: 60,
    height: 70,
    marginRight: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },

  exerciseImage: {
    width: 60,
    height: 60,
  },

  exerciseInfo: {
    flex: 1,
    justifyContent: 'center',
  },

  detailContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },

  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eee',
    borderRadius: 8,
  },

  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  itemTextActive: {
    color: '#ff8d1d',
    backgroundColor: '#eee',
    borderRadius: 8,
    fontWeight: 'bold',
    fontSize: 20,
    marginVertical: 10,
    padding: 16,
  },
});

export default ExerciseScreen;