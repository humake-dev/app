import {getDatabase} from './database';

export const initializeMessageTable = async () => {
  const db = await getDatabase();

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT,
      created_at TEXT,
      updated_at TEXT
    )
  `);
};

// SQLite 메시지 조회
export const getMessages = async () => {
  const db = await getDatabase();

  await initializeMessageTable();

  const [result] = await db.executeSql(`
    SELECT id, title, content, created_at, updated_at
    FROM messages
    ORDER BY created_at DESC, id DESC
  `);

  const items = [];

  for (let i = 0; i < result.rows.length; i++) {
    items.push(result.rows.item(i));
  }

  return items;
};

// 서버 메시지 목록으로 SQLite 갱신
export const saveMessages = async (messages: any[]) => {
  const db = await getDatabase();

  await initializeMessageTable();

  return new Promise<void>((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql('DELETE FROM messages');

        messages.forEach((item) => {
          tx.executeSql(
            `INSERT OR REPLACE INTO messages
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

// 메시지 하나 삭제
export const deleteMessageFromDB = async (messageId: number) => {
  const db = await getDatabase();

  await db.executeSql(
    'DELETE FROM messages WHERE id = ?',
    [messageId]
  );
};

  // ID로 공지사항 조회
export const getMessageById = async (id) => {
  const db = await getDatabase();

  const [result] = await db.executeSql(
    'SELECT * FROM messages WHERE id = ? LIMIT 1',
    [Number(id)]
  );

  return result.rows.length > 0
    ? result.rows.item(0)
    : null;
};

// 메시지 상세 내용 저장
export const saveMessageDetail = async (id, detail) => {
  const db = await getDatabase();

  const [result] = await db.executeSql(
    `UPDATE messages
     SET content = ?
     WHERE id = ?`,
    [detail.content ?? '', Number(id)]
  );

  return result.rowsAffected > 0;
};
