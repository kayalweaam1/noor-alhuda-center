const mysql = require('mysql2/promise');

async function updateAdminName() {
  const connectionUrl = process.env.DATABASE_URL;
  if (!connectionUrl) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const connection = await mysql.createConnection(connectionUrl);

  console.log("Updating admin name to وئام كيال...");
  
  // Update all users with role admin
  await connection.execute(
    "UPDATE users SET name = ? WHERE role = ?",
    ["وئام كيال", "admin"]
  );

  console.log("✅ Admin name updated successfully!");
  
  await connection.end();
}

updateAdminName().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
