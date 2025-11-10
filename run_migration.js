const mysql = require('mysql2/promise');
const fs = require('fs');

async function runMigration() {
  const connectionUrl = process.env.DATABASE_URL;
  if (!connectionUrl) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const connection = await mysql.createConnection(connectionUrl);

  console.log("Running migration to add guardian fields...");
  
  try {
    // Check if columns already exist
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM students LIKE 'guardianName'"
    );
    
    if (columns.length > 0) {
      console.log("✅ Guardian fields already exist, skipping migration");
      await connection.end();
      return;
    }
    
    // Read and execute migration
    const migration = fs.readFileSync('./drizzle/migrations/add_guardian_fields.sql', 'utf8');
    await connection.query(migration);
    
    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
  }
  
  await connection.end();
}

runMigration().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
