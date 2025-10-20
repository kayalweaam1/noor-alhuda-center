import { Router } from 'express';
import * as db from '../db';

const router = Router();

router.get('/api/setup-admin', async (req, res) => {
  try {
    console.log('[Setup] Creating default admin...');
    await db.createDefaultAdmin();
    
    res.json({ 
      success: true, 
      message: 'Admin setup completed',
      credentials: {
        phone: '+972542632557',
        password: 'admin123'
      }
    });
  } catch (error) {
    console.error('[Setup] Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error setting up admin',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/api/check-db', async (req, res) => {
  try {
    const users = await db.getAllUsers();
    res.json({ 
      success: true, 
      userCount: users.length,
      users: users.map(u => ({ id: u.id, name: u.name, phone: u.phone, role: u.role }))
    });
  } catch (error) {
    console.error('[Check DB] Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error checking database',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

