import { Router } from 'express';
import { createDefaultAdmin, getUserByPhone } from '../db';

const router = Router();

router.post('/api/create-first-admin', async (req, res) => {
  try {
    await createDefaultAdmin();

    const admin = await getUserByPhone('+972542632557');
    if (admin) {
      return res.json({
        success: true,
        message: 'Admin created successfully',
        credentials: {
          phone: '+972542632557',
          password: 'admin123',
        },
      });
    }

    return res.json({ success: false, message: 'Failed to create admin' });
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

