import {getDatabase} from './database';

/**
 * 프로필 DB 초기화
 */
export async function initializeProfileDatabase() {
  const db = await getDatabase();

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS body_reference (
      age_group TEXT,
      gender TEXT,
      average_height REAL NOT NULL,
      average_weight REAL NOT NULL,
      PRIMARY KEY (age_group, gender)
    )
  `);

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      age_group TEXT,
      gender TEXT,
      height REAL,
      weight REAL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
}

/**
 * 평균 신체정보 조회
 */
export async function getBodyReference(
  ageGroup: string,
  gender: string,
) {
  if (gender === 'unknown') {
    return null;
  }

  const db = await getDatabase();

  const [result] = await db.executeSql(
    `
      SELECT
        average_height,
        average_weight
      FROM body_reference
      WHERE age_group = ?
        AND gender = ?
      LIMIT 1
    `,
    [ageGroup, gender],
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows.item(0);

  return {
    height: Number(row.average_height),
    weight: Number(row.average_weight),
  };
}

/**
 * 사용자 프로필 저장
 */
export async function saveUserProfile({
  ageGroup,
  gender,
  height,
  weight,
}: {
  ageGroup: string;
  gender: string;
  height: number | null;
  weight: number | null;
}) {
  const db = await getDatabase();

  const now = new Date().toISOString();

  await db.executeSql(`
    DELETE FROM user_profile
  `);

  await db.executeSql(
    `
      INSERT INTO user_profile (
        age_group,
        gender,
        height,
        weight,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      ageGroup,
      gender,
      height,
      weight,
      now,
      now,
    ],
  );
}

const BODY_REFERENCE = [
  // 10대
  ['10s', 'male', 170.0, 62.0],
  ['10s', 'female', 160.0, 53.0],

  // 20대
  ['20s', 'male', 174.0, 70.0],
  ['20s', 'female', 161.0, 56.0],

  // 30대
  ['30s', 'male', 174.0, 72.0],
  ['30s', 'female', 161.0, 57.0],

  // 40대
  ['40s', 'male', 172.0, 73.0],
  ['40s', 'female', 160.0, 58.0],

  // 50대
  ['50s', 'male', 170.0, 72.0],
  ['50s', 'female', 158.0, 58.0],

  // 60대
  ['60s', 'male', 168.0, 69.0],
  ['60s', 'female', 156.0, 57.0],

  // 70대
  ['70s', 'male', 166.0, 66.0],
  ['70s', 'female', 154.0, 55.0],

  // 80대 이상
  ['80s+', 'male', 163.0, 63.0],
  ['80s+', 'female', 151.0, 53.0],
] as const;

/**
 * 평균 신장 / 체중 기준값 입력
 */
export async function seedBodyReference() {
  const db = await getDatabase();

  for (const [
    ageGroup,
    gender,
    averageHeight,
    averageWeight,
  ] of BODY_REFERENCE) {
    await db.executeSql(
      `
        INSERT OR IGNORE INTO body_reference (
          age_group,
          gender,
          average_height,
          average_weight
        )
        VALUES (?, ?, ?, ?)
      `,
      [
        ageGroup,
        gender,
        averageHeight,
        averageWeight,
      ],
    );
  }
}

/**
 * 프로필 DB 초기화 + 기본 데이터 삽입
 */
export async function initializeProfileDatabaseWithSeed() {
  await initializeProfileDatabase();
  await seedBodyReference();
}

