import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

/**
 * SQLite 데이터베이스 연결
 */
let database: SQLite.SQLiteDatabase | null = null;

/**
 * DB 가져오기
 *
 * 최초 호출 시 app.db를 열고,
 * 이후에는 같은 DB 연결을 재사용한다.
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (database) {
    return database;
  }

  database = await SQLite.openDatabase({
    name: 'app.db',
    location: 'default',
  });

  return database;
}


