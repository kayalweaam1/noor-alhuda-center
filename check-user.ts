import mysql from 'mysql2/promise';

const DATABASE_URL = "mysql://root:yjHMsndXkVAANTjruBiofkRgVOrVgvkg@metro.proxy.rlwy.net:32558/railway";

async function checkUser() {
  const conn = await mysql.createConnection(DATABASE_URL);
  
  console.log('Checking users in database...\n');
  
  const [users] = await conn.query('SELECT id, name, phone, role FROM users');
  console.log('Users found:', users);
  
  await conn.end();
}

checkUser().catch(console.error);
