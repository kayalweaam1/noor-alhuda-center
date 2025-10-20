import Database from 'better-sqlite3';
import { join } from 'path';

const db = new Database(join(process.cwd(), 'data.db'));

// Create super admin
const stmt = db.prepare(`
  INSERT OR REPLACE INTO users (id, phone, password, name, role, loginMethod, createdAt, lastSignedIn)
  VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
`);

stmt.run('admin_1', '+972542632557', '123456', 'المدير العام', 'admin', 'password');

console.log('✅ Super admin created successfully!');
console.log('Phone: +972542632557');
console.log('Password: 123456');

db.close();

