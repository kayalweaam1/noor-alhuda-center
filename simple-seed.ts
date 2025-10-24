import mysql from 'mysql2/promise';
import { hash } from '@node-rs/argon2';

const DATABASE_URL = "mysql://root:yjHMsndXkVAANTjruBiofkRgVOrVgvkg@metro.proxy.rlwy.net:32558/railway";

async function hashPassword(password: string): Promise<string> {
  return await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
}

async function seed() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  console.log('✓ Connected to database');
  
  // Create admin user
  console.log('Creating admin user...');
  const adminPassword = await hashPassword("123456");
  
  try {
    // First check if admin exists
    const [existing] = await connection.query(`SELECT id FROM users WHERE id = ?`, ['user_admin_main']);
    
    if ((existing as any[]).length === 0) {
      await connection.query(`
        INSERT INTO users (id, name, phone, password, role, loginMethod, createdAt, lastSignedIn)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, ['user_admin_main', 'المدير العام', '+972542632557', adminPassword, 'admin', 'password']);
    } else {
      await connection.query(`
        UPDATE users SET password = ?, phone = ? WHERE id = ?
      `, [adminPassword, '+972542632557', 'user_admin_main']);
    }
    
    console.log('✓ Admin user created');
    console.log('  Phone: +972542632557');
    console.log('  Password: 123456');
  } catch (error: any) {
    console.error('Error creating admin:', error.message);
  }
  
  await connection.end();
  console.log('✓ Seeding completed!');
}

seed().catch(console.error);

