import mysql from "mysql2/promise";

async function testConnection() {
  const DATABASE_URL = "mysql://root:yjHMsndXkVAANTjruBiofkRgVOrVgvkg@metro.proxy.rlwy.net:32558/railway";
  
  try {
    const connection = await mysql.createConnection({
      host: "metro.proxy.rlwy.net",
      port: 32558,
      user: "root",
      password: "yjHMsndXkVAANTjruBiofkRgVOrVgvkg",
      database: "railway"
    });
    
    console.log("✅ Connected to database successfully");
    
    // Check if username column exists
    const [columns] = await connection.query("SHOW COLUMNS FROM users");
    console.log("\n📋 Users table columns:");
    console.log(columns);
    
    // Get all users
    const [users] = await connection.query("SELECT id, name, phone, username, role FROM users");
    console.log("\n👥 Users in database:");
    console.log(users);
    
    await connection.end();
  } catch (error) {
    console.error("❌ Database connection error:", error);
  }
}

testConnection();
