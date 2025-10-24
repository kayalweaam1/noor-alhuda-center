import mysql from 'mysql2/promise';
const conn = await mysql.createConnection("mysql://root:yjHMsndXkVAANTjruBiofkRgVOrVgvkg@metro.proxy.rlwy.net:32558/railway");
const [tables] = await conn.query('SHOW TABLES');
console.log('Tables:', tables.map((t: any) => Object.values(t)[0]));
await conn.end();
