import mysql from 'mysql2/promise';

const DATABASE_URL = "mysql://root:yjHMsndXkVAANTjruBiofkRgVOrVgvkg@metro.proxy.rlwy.net:32558/railway";

async function addColumns() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    await connection.query(`ALTER TABLE users ADD COLUMN phone varchar(20)`);
    console.log('✓ Added phone column');
  } catch (e: any) {
    if (!e.message.includes('Duplicate')) console.log('phone column exists');
  }
  
  try {
    await connection.query(`ALTER TABLE users ADD COLUMN profileImage text`);
    console.log('✓ Added profileImage column');
  } catch (e: any) {
    if (!e.message.includes('Duplicate')) console.log('profileImage column exists');
  }
  
  await connection.end();
}

addColumns().catch(console.error);
