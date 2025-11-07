import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { users } from "./drizzle/schema";
import { eq } from "drizzle-orm";

async function updateAdminName() {
  const connectionUrl = process.env.DATABASE_URL;
  if (!connectionUrl) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const connection = await mysql.createConnection(connectionUrl);
  const db = drizzle(connection);

  console.log("Updating admin name to وئام كيال...");
  
  // Update all users with role admin
  await db.update(users)
    .set({ name: "وئام كيال" })
    .where(eq(users.role, "admin"));

  console.log("✅ Admin name updated successfully!");
  
  await connection.end();
  process.exit(0);
}

updateAdminName().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
