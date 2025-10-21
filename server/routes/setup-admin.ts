import { Router } from "express";
import * as dbApi from "../db";
import { users } from "../../drizzle/schema";
import { hashPassword } from "../_core/password";

const router = Router();

// Temporary endpoint to create admin user
router.post("/setup-admin", async (req, res) => {
  try {
    const db = await dbApi.getDb();
    if (!db) return res.status(500).json({ success: false, error: 'Database not available' });
    const phone = "0542632557";
    const password = "123456";
    const hashedPassword = await hashPassword(password);

    // Check if admin already exists
    const existingUser = (await db.select().from(users).where(users.phone as any).limit(1))[0];

    if (existingUser) {
      return res.json({ 
        success: false, 
        message: "المدير موجود بالفعل",
        userId: existingUser.id 
      });
    }

    // Create admin user
    const newUserId = `user_${Date.now()}`;
    await db.insert(users).values({
      id: newUserId,
      name: "المدير العام",
      phone,
      password: hashedPassword,
      role: "admin",
    });

    res.json({ 
      success: true, 
      message: "تم إنشاء حساب المدير بنجاح",
      userId: newUserId,
      credentials: {
        phone: "0542632557",
        password: "123456"
      }
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ 
      success: false, 
      error: "فشل إنشاء حساب المدير" 
    });
  }
});

export default router;

