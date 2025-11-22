import mysql from 'mysql2/promise';

const DATABASE_URL = "mysql://root:yjHMsndXkVAANTjruBiofkRgVOrVgvkg@metro.proxy.rlwy.net:32558/railway";

async function fixData() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  console.log('✓ Connected to database');
  
  try {
    // Get all teachers
    console.log('\n📋 Getting teachers...');
    const [teachers] = await connection.query(`SELECT id, userId FROM teachers`);
    console.log('Teachers:', teachers);
    
    if ((teachers as any[]).length === 0) {
      console.log('❌ No teachers found!');
      await connection.end();
      return;
    }
    
    const firstTeacherId = (teachers as any[])[0].id;
    console.log(`\n✓ Will assign students to teacher: ${firstTeacherId}`);
    
    // Get students without teachers
    console.log('\n📋 Getting students without teachers...');
    const [studentsWithoutTeacher] = await connection.query(`
      SELECT id, userId FROM students 
      WHERE teacherId IS NULL OR teacherId = ''
    `);
    console.log('Students without teacher:', studentsWithoutTeacher);
    
    // Update students without teachers
    if ((studentsWithoutTeacher as any[]).length > 0) {
      console.log(`\n🔧 Assigning ${(studentsWithoutTeacher as any[]).length} students to teacher ${firstTeacherId}...`);
      const [result1] = await connection.query(`
        UPDATE students 
        SET teacherId = ?
        WHERE teacherId IS NULL OR teacherId = ''
      `, [firstTeacherId]);
      console.log('✓ Updated students:', result1);
    } else {
      console.log('✓ All students already have teachers');
    }
    
    // Get students with 0 payment amount
    console.log('\n📋 Getting students with 0 payment amount...');
    const [studentsWithZeroPayment] = await connection.query(`
      SELECT id, userId, paymentAmount FROM students 
      WHERE paymentAmount = 0 OR paymentAmount IS NULL
    `);
    console.log('Students with 0 payment:', studentsWithZeroPayment);
    
    // Update payment amounts
    if ((studentsWithZeroPayment as any[]).length > 0) {
      console.log(`\n🔧 Setting payment amount to 200 for ${(studentsWithZeroPayment as any[]).length} students...`);
      const [result2] = await connection.query(`
        UPDATE students 
        SET paymentAmount = 200
        WHERE paymentAmount = 0 OR paymentAmount IS NULL
      `);
      console.log('✓ Updated payment amounts:', result2);
    } else {
      console.log('✓ All students already have payment amounts');
    }
    
    // Verify the changes
    console.log('\n📋 Verifying changes...');
    const [allStudents] = await connection.query(`
      SELECT s.id, u.name, s.teacherId, s.paymentAmount 
      FROM students s
      JOIN users u ON s.userId = u.id
      LIMIT 10
    `);
    console.log('Students after update:', allStudents);
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
  
  await connection.end();
  console.log('\n✓ Done!');
}

fixData().catch(console.error);

