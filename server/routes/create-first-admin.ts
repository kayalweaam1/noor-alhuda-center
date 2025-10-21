import { Router } from 'express';
import bcrypt from 'bcryptjs';
import * as dbApi from '../db';
import { users } from '../../drizzle/schema';

const router = Router();

router.post('/api/create-first-admin', async (req, res) => {
  try {
    const db = await dbApi.getDb();
    if (!db) return res.status(500).json({ success: false, message: 'Database not available' });
    // Check if any users exist
    const existingUsers = await db.select().from(users).limit(1);
    
    if (existingUsers.length > 0) {
      return res.json({ 
        success: false, 
        message: 'Admin already exists or users table is not empty' 
      });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    await db.insert(users).values({
      id: 'admin001',
      name: 'المدير العام',
      phone: '+972542632557',
      password: hashedPassword,
      role: 'admin',
      // fields not in schema removed
    });

    res.json({ 
      success: true, 
      message: 'Admin created successfully',
      credentials: {
        phone: '+972542632557',
        password: '123456'
      }
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating admin',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

