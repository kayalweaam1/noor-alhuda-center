import * as db from "../server/db";

async function addSuperAdmin() {
  const phone = "+972542632557";

  console.log("🔧 Adding Super Admin...");

  // Check if user exists
  const existing = await db.getUserByPhone(phone);

  if (existing) {
    console.log("✅ User already exists:", existing.id);
    // Update to admin
    await db.updateUserRole(existing.id, "admin");
    console.log("✅ Updated role to admin");
  } else {
    // Create new user
    const userId = "superadmin_" + Date.now();
    await db.upsertUser({
      id: userId,
      name: "المدير العام",
      phone: phone,
      role: "admin",
      loginMethod: "otp",
    });
    console.log("✅ Created Super Admin user:", userId);
  }

  console.log("📱 Phone:", phone);
  console.log("👤 Role: admin (Super Admin)");
  console.log("✨ Done!");
}

addSuperAdmin().catch(console.error);
