declare module 'react-native-sqlite-storage' {
  export interface ResultSet {
    rows: {
      length: number;
      item(index: number): any;
      raw(): any[];
    };
    rowsAffected: number;
    insertId?: number;
  }

  export interface SQLiteDatabase {
    executeSql(
      sql: string,
      params?: any[],
    ): Promise<[ResultSet]>;

    transaction(
      callback: (tx: SQLiteDatabase) => void,
    ): Promise<void>;

    close(): Promise<void>;
  }

  export interface OpenParams {
    name: string;
    location?: string;
    createFromLocation?: number | string;
  }

  const SQLite: {
    enablePromise(enable: boolean): void;

    openDatabase(
      params: OpenParams,
    ): SQLiteDatabase;
  };

  export default SQLite;
}