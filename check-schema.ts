import mysql from 'mysql2/promise';

const DATABASE_URL = "mysql://root:yjHMsndXkVAANTjruBiofkRgVOrVgvkg@metro.proxy.rlwy.net:32558/railway";

async function checkSchema() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  const [tables] = await connection.query('SHOW TABLES');
  console.log('Tables:', tables);
  
  const [columns] = await connection.query('DESCRIBE users');
  console.log('\nUsers table structure:');
  console.log(columns);
  
  await connection.end();
}

checkSchema().catch(console.error);
