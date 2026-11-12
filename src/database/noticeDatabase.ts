import {getDatabase} from './database';

export const initializeNoticeTable = async () => {
  const db = await getDatabase();

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS notices (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT,
      created_at TEXT,
      updated_at TEXT
    )
  `);
};

// SQLite에서 공지사항 조회
export const getNotices = async () => {
  const db = await getDatabase();

  await initializeNoticeTable();

  const [result] = await db.executeSql(`
    SELECT id, title, content, created_at, updated_at
    FROM notices
    ORDER BY created_at DESC, id DESC
  `);

  const items = [];

  for (let i = 0; i < result.rows.length; i++) {
    items.push(result.rows.item(i));
  }

  return items;
};

// 서버 데이터를 SQLite에 반영
export const saveNotices = async (notices: any[]) => {
  const db = await getDatabase();

  await initializeNoticeTable();

  return new Promise<void>((resolve, reject) => {
    db.transaction(
      (tx) => {
        // 서버의 전체 공지사항 목록으로 교체
        tx.executeSql('DELETE FROM notices');

        notices.forEach((item) => {
          tx.executeSql(
            `INSERT OR REPLACE INTO notices
              (id, title, content, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?)`,
            [
              item.id,
              item.title ?? '',
              item.content ?? null,
              item.created_at ?? null,
              item.updated_at ?? null,
            ]
          );
        });
      },
      (error) => reject(error),
      () => resolve()
    );
  });
};

  // ID로 공지사항 조회
export const getNoticeById = async (id) => {
  const db = await getDatabase();

  const [result] = await db.executeSql(
    'SELECT * FROM notices WHERE id = ? LIMIT 1',
    [Number(id)]
  );

  return result.rows.length > 0
    ? result.rows.item(0)
    : null;
};

// 공지사항 상세 내용 저장
export const saveNoticeDetail = async (id, detail) => {
  const db = await getDatabase();

  const [result] = await db.executeSql(
    `UPDATE notices
     SET content = ?
     WHERE id = ?`,
    [detail.content ?? '', Number(id)]
  );

  return result.rowsAffected > 0;
};
