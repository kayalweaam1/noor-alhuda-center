import mysql from 'mysql2/promise';

const DATABASE_URL = "mysql://root:yjHMsndXkVAANTjruBiofkRgVOrVgvkg@metro.proxy.rlwy.net:32558/railway";

async function addPaymentColumn() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  console.log('✓ Connected to database');
  
  try {
    // Check if column exists
    console.log('\n📋 Checking if paymentAmount column exists...');
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM students LIKE 'paymentAmount'
    `);
    
    if ((columns as any[]).length > 0) {
      console.log('✓ Column paymentAmount already exists');
    } else {
      console.log('🔧 Adding paymentAmount column...');
      await connection.query(`
        ALTER TABLE students 
        ADD COLUMN paymentAmount INT NOT NULL DEFAULT 0 
        AFTER hasPaid
      `);
      console.log('✓ Column paymentAmount added successfully!');
    }
    
    // Set default payment amount for all students
    console.log('\n🔧 Setting default payment amount (200) for all students...');
    const [result] = await connection.query(`
      UPDATE students 
      SET paymentAmount = 200
      WHERE paymentAmount = 0
    `);
    console.log('✓ Updated students:', result);
    
    // Verify the changes
    console.log('\n📋 Verifying changes...');
    const [students] = await connection.query(`
      SELECT s.id, u.name, s.hasPaid, s.paymentAmount, s.teacherId
      FROM students s
      JOIN users u ON s.userId = u.id
      LIMIT 10
    `);
    console.log('Students after update:');
    console.table(students);
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
  
  await connection.end();
  console.log('\n✓ Done!');
}

addPaymentColumn().catch(console.error);

