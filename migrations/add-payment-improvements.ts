/**
 * Migration: Add payment improvements
 * - Add index on students.teacherId for better performance
 * - Add check constraint on students.paymentAmount (>= 0)
 * 
 * Date: 2025-11-23
 */

import { getDb } from '../server/db';
import { createPool } from 'mysql2/promise';

export async function addPaymentImprovements() {
  // Create direct connection for migration
  const pool = createPool({
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'noor_alhuda',
    waitForConnections: true,
    connectionLimit: 10,
  });

  const connection = await pool.getConnection();
  
  try {
    console.log('Starting payment improvements migration...');

    // 1. Add index on teacherId if not exists
    console.log('Adding index on students.teacherId...');
    await connection.query(`
      CREATE INDEX IF NOT EXISTS teacherId_idx ON students(teacherId)
    `);
    console.log('✅ Index created successfully');

    // 2. Add check constraint on paymentAmount (MySQL 8.0.16+)
    // Note: MySQL check constraints are enforced starting from 8.0.16
    console.log('Adding check constraint on students.paymentAmount...');
    try {
      await connection.query(`
        ALTER TABLE students 
        ADD CONSTRAINT chk_payment_amount_positive 
        CHECK (paymentAmount >= 0)
      `);
      console.log('✅ Check constraint added successfully');
    } catch (error: any) {
      // If constraint already exists or MySQL version doesn't support it
      if (error.code === 'ER_CHECK_CONSTRAINT_DUP_NAME' || error.code === 'ER_CONSTRAINT_FAILED') {
        console.log('⚠️  Check constraint already exists or not supported');
      } else {
        throw error;
      }
    }

    // 3. Verify data integrity - ensure no negative payment amounts
    console.log('Verifying data integrity...');
    const [negativePayments] = await connection.query(`
      SELECT COUNT(*) as count FROM students WHERE paymentAmount < 0
    `);
    
    if ((negativePayments as any)[0].count > 0) {
      console.log(`⚠️  Found ${(negativePayments as any)[0].count} students with negative payment amounts`);
      console.log('Fixing negative payment amounts...');
      await connection.query(`
        UPDATE students SET paymentAmount = 0 WHERE paymentAmount < 0
      `);
      console.log('✅ Fixed negative payment amounts');
    } else {
      console.log('✅ No negative payment amounts found');
    }

    console.log('✅ Payment improvements migration completed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run migration if executed directly
addPaymentImprovements()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

