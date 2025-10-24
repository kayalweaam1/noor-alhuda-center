import { hash } from '@node-rs/argon2';
import { getDb } from './db';
import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

export async function setupAdmin() {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const phone = '+972542632557';
  const password = '123456';

  // Hash password
  const hashedPassword = await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  // Delete existing admin if exists
  await db.delete(users).where(eq(users.phone, phone));

  // Insert new admin
  await db.insert(users).values({
    id: 'admin_001',
    name: 'المدير العام',
    phone: phone,
    password: hashedPassword,
    role: 'admin',
    loginMethod: 'password',
    createdAt: new Date(),
    lastSignedIn: new Date(),
  });

  return {
    success: true,
    message: 'Admin user created successfully',
    phone: phone,
    password: password,
  };
}

