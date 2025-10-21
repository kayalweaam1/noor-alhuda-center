import { Router } from "express";
import { getUserByPhone, upsertUser } from "../db";
import { hashPassword } from "../_core/password";

const router = Router();

// Temporary endpoint to create admin user
router.post("/setup-admin", async (req, res) => {
  try {
    const phone = "0542632557";
    const password = "123456";
    const hashedPassword = await hashPassword(password);

    // Normalize phone to international format used in auth flow
    const normalizedPhone = `+972${phone.startsWith("0") ? phone.substring(1) : phone}`;
    const existingUser = await getUserByPhone(normalizedPhone);

    if (existingUser) {
      return res.json({ 
        success: false, 
        message: "المدير موجود بالفعل",
        userId: existingUser.id 
      });
    }

    // Create admin user
    const userId = `user_admin_${Date.now()}`;
    await upsertUser({
      id: userId,
      name: "المدير العام",
      phone: normalizedPhone,
      password: hashedPassword,
      role: "admin",
      loginMethod: "password",
    });

    res.json({ 
      success: true, 
      message: "تم إنشاء حساب المدير بنجاح",
      userId,
      credentials: {
        phone: normalizedPhone,
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

