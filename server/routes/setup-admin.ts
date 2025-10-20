import { Router } from "express";
import { db } from "../db";
import { users } from "../../drizzle/schema";
import { hashPassword } from "../lib/auth";

const router = Router();

// Temporary endpoint to create admin user
router.post("/setup-admin", async (req, res) => {
  try {
    const phone = "0542632557";
    const password = "123456";
    const hashedPassword = await hashPassword(password);

    // Check if admin already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.phone, phone),
    });

    if (existingUser) {
      return res.json({ 
        success: false, 
        message: "المدير موجود بالفعل",
        userId: existingUser.id 
      });
    }

    // Create admin user
    const [newUser] = await db.insert(users).values({
      name: "المدير العام",
      phone,
      password: hashedPassword,
      role: "admin",
      status: "active",
    }).returning();

    res.json({ 
      success: true, 
      message: "تم إنشاء حساب المدير بنجاح",
      userId: newUser.id,
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

