// database.ts
import { open } from 'react-native-nitro-sqlite';

const db = open({
  name: 'app.db',
});

export default db;