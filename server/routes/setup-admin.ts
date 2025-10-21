import { Router } from "express";
import * as db from "../db";

const router = Router();

// Temporary endpoint to create admin user
router.post("/setup-admin", async (req, res) => {
  try {
    await db.createDefaultAdmin();
    res.json({ success: true, message: "تم التأكد من وجود المدير الافتراضي" });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ 
      success: false, 
      error: "فشل إنشاء حساب المدير" 
    });
  }
});

export default router;

