import mysql from 'mysql2/promise';
import { hash } from '@node-rs/argon2';

const DATABASE_URL = "mysql://root:yjHMsndXkVAANTjruBiofkRgVOrVgvkg@metro.proxy.rlwy.net:32558/railway";

async function resetAdmin() {
  const conn = await mysql.createConnection(DATABASE_URL);
  
  console.log('Deleting old admin...');
  await conn.query('DELETE FROM users WHERE phone = ?', ['+972542632557']);
  
  console.log('Creating new admin...');
  const password = await hash("123456", {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
  
  await conn.query(`
    INSERT INTO users (id, name, phone, password, role, loginMethod, createdAt, lastSignedIn)
    VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
  `, ['admin_001', 'المدير العام', '+972542632557', password, 'admin', 'password']);
  
  console.log('\n✅ Admin created successfully!');
  console.log('Phone: +972542632557 or 0542632557');
  console.log('Password: 123456');
  
  // Verify
  const [users] = await conn.query('SELECT id, name, phone, role FROM users WHERE phone = ?', ['+972542632557']);
  console.log('\nVerification:', users);
  
  await conn.end();
}

resetAdmin().catch(console.error);
