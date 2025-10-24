import mysql from 'mysql2/promise';
import * as fs from 'fs';

const DATABASE_URL = "mysql://root:yjHMsndXkVAANTjruBiofkRgVOrVgvkg@metro.proxy.rlwy.net:32558/railway";

async function initDatabase() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  console.log('✓ Connected to database');
  
  // Read all migration files
  const migrations = [
    './drizzle/0000_unique_psynapse.sql',
    './drizzle/0001_ancient_steel_serpent.sql',
    './drizzle/0002_busy_christian_walker.sql',
    './drizzle/0003_striped_grey_gargoyle.sql',
    './drizzle/0004_dusty_scarlet_spider.sql'
  ];
  
  for (const file of migrations) {
    if (fs.existsSync(file)) {
      const sql = fs.readFileSync(file, 'utf-8');
      const statements = sql.split(';').filter(s => s.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await connection.query(statement);
            console.log('✓ Executed:', file);
          } catch (error: any) {
            if (!error.message.includes('already exists')) {
              console.error('Error:', error.message);
            }
          }
        }
      }
    }
  }
  
  console.log('✓ Database initialized successfully!');
  await connection.end();
}

initDatabase().catch(console.error);
