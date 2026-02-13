import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  FlatList,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import SQLite from 'react-native-sqlite-storage';

  
// SQLite.DEBUG(true);
SQLite.enablePromise(true);

const openDatabase = async () => {
  // Try multiple strategies and provide detailed logging to help diagnose failures.
  // Many common issues:
  // - Prepopulated DB must be placed in platform-specific bundle locations
  //   Android: android/app/src/main/assets/www/<dbfile>
  //   iOS: add file to Xcode bundle (Copy Bundle Resources)
  // - createFromLocation option may be required to copy from bundle on first run

  const name = 'exercise.db';

  // Attempt 1: use createFromLocation (recommended for prepopulated DB)
  try {
    const opts: any = {
      name,
      location: 'default',
      createFromLocation:
      Platform.OS === 'ios' ? '~exercise.db' : 1,
    };

    // assetFilename is only used in some platforms/versions; include for iOS fallback
    if (Platform.OS === 'ios') {
      opts.assetFilename = name;
    }

    const db = await SQLite.openDatabase(opts);
    console.log('✅ DB 연결 성공 (createFromLocation)');
    return db;
  } catch (err1) {
    console.warn('DB 연결 실패 (createFromLocation):', err1);

    // Attempt 2: try opening without createFromLocation (database may be created/copied by other setup)
    try {
      const db = await SQLite.openDatabase({ name, location: 'default' });
      console.log('✅ DB 연결 성공 (without createFromLocation)');
      return db;
    } catch (err2) {
      console.error('DB 연결 두번째 시도 실패:', err2);
      // Provide actionable hint in the thrown error message
      const hint = `Ensure ${name} is bundled in the native app: Android -> android/app/src/main/assets/www/${name} (or assets/), iOS -> add to Xcode Copy Bundle Resources. See react-native-sqlite-storage docs.`;
      const finalError = new Error(`DB open failed. ${hint} Original errors: ${err1}; ${err2}`);
      // attach original errors
      (finalError as any).original = { err1, err2 };
      throw finalError;
    }
  }
};



const ExerciseScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);

useEffect(() => {
  const init = async () => {
    const data = await fetchCategories();
    setCategories(data);

    if (data.length > 0) {
      setSelectedCategory(data[0].id); // ⭐ 최초 선택
    }
  };

  init();
}, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchExercises(selectedCategory).then(setExercises);
      setSelectedExercise(null); // 카테고리 바뀌면 상세화면 닫기
    }
  }, [selectedCategory]);


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


const fetchExercises = async (categoryId) => {
  try {
    const db = await openDatabase();
    console.log(db);

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        console.log('운동 조회 시작');
        tx.executeSql('SELECT e.*, p.picture_url FROM exercises e LEFT JOIN exercise_pictures p ON p.id = ( SELECT id FROM exercise_pictures WHERE exercise_id = e.id ORDER BY id ASC LIMIT 1) WHERE e.exercise_category_id = ?;', 
          [categoryId],
          (tx, results) => {
            const rows = results.rows;
            const exercises = [];
            for (let i = 0; i < rows.length; i++) {
              exercises.push(rows.item(i));
            }
            console.log('운동 조회 성공:', exercises);
            resolve(exercises);
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


    const renderExerciseItem = ({item}) => {
      console.log('Rendering exercise item:', item);
      return (
   <TouchableOpacity
      style={styles.exerciseItem}
      onPress={() => setSelectedExercise(item)}
    >
          <View style={styles.exerciseImageContainer}>
            {item.picture_url ? (
              <Image
                source={{uri: `https://humake.blob.core.windows.net/humake/exercise/${item.picture_url}`}}
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
            <Text style={{ color : '#ff8d1d', fontWeight: 'bold'}}>{item.content}</Text>
          </View>
        </TouchableOpacity>
      );
    };

  const renderExerciseDetail = () => (
    <View style={styles.detailContainer}>
      <TouchableOpacity onPress={() => setSelectedExercise(null)} style={styles.backButton}>
        <Text style={styles.backButtonText}>← 목록으로</Text>
      </TouchableOpacity>
      <View style={styles.exerciseImageContainer}>
        {selectedExercise.picture_url ? (
          <Image
            source={{ uri: `https://humake.blob.core.windows.net/humake/exercise/medium_thumb_${selectedExercise.picture_url}` }}
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
  container: { flex: 1, backgroundColor: '#fff' },
  categoryScroll: { paddingVertical: 10, maxHeight: 70, height: 70 },
  categoryContainer: { paddingHorizontal: 10 },
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
  itemBox: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  itemText: {
    fontSize: 16,
  },
  itemTextActive: {
    color: '#007AFF',
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
