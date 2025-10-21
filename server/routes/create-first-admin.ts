import { Router } from 'express';
import * as db from '../db';

const router = Router();

router.post('/api/create-first-admin', async (req, res) => {
  try {
    // Delegate to unified helper in db.ts
    await db.createDefaultAdmin();
    
    res.json({ success: true, message: 'Admin ensured' });
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

