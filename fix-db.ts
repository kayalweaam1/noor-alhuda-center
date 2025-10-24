import mysql from 'mysql2/promise';

const DATABASE_URL = "mysql://root:yjHMsndXkVAANTjruBiofkRgVOrVgvkg@metro.proxy.rlwy.net:32558/railway";

async function fixDatabase() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  console.log('✓ Connected to database');
  
  const statements = [
    // Create tables
    `CREATE TABLE IF NOT EXISTS \`teachers\` (
      \`id\` varchar(64) NOT NULL,
      \`userId\` varchar(64) NOT NULL,
      \`halaqaName\` varchar(255),
      \`specialization\` text,
      \`createdAt\` timestamp DEFAULT (now()),
      CONSTRAINT \`teachers_id\` PRIMARY KEY(\`id\`),
      CONSTRAINT \`teachers_userId_unique\` UNIQUE(\`userId\`)
    )`,
    
    `CREATE TABLE IF NOT EXISTS \`students\` (
      \`id\` varchar(64) NOT NULL,
      \`userId\` varchar(64) NOT NULL,
      \`teacherId\` varchar(64),
      \`grade\` varchar(50),
      \`enrollmentDate\` timestamp DEFAULT (now()),
      \`createdAt\` timestamp DEFAULT (now()),
      CONSTRAINT \`students_id\` PRIMARY KEY(\`id\`),
      CONSTRAINT \`students_userId_unique\` UNIQUE(\`userId\`)
    )`,
    
    `CREATE TABLE IF NOT EXISTS \`lessons\` (
      \`id\` varchar(64) NOT NULL,
      \`teacherId\` varchar(64) NOT NULL,
      \`title\` varchar(255) NOT NULL,
      \`description\` text,
      \`date\` timestamp NOT NULL,
      \`createdAt\` timestamp DEFAULT (now()),
      CONSTRAINT \`lessons_id\` PRIMARY KEY(\`id\`)
    )`,
    
    `CREATE TABLE IF NOT EXISTS \`evaluations\` (
      \`id\` varchar(64) NOT NULL,
      \`studentId\` varchar(64) NOT NULL,
      \`teacherId\` varchar(64) NOT NULL,
      \`lessonId\` varchar(64),
      \`score\` int NOT NULL,
      \`feedback\` text,
      \`evaluationType\` varchar(100),
      \`date\` timestamp NOT NULL,
      \`createdAt\` timestamp DEFAULT (now()),
      CONSTRAINT \`evaluations_id\` PRIMARY KEY(\`id\`)
    )`,
    
    `CREATE TABLE IF NOT EXISTS \`notifications\` (
      \`id\` varchar(64) NOT NULL,
      \`userId\` varchar(64) NOT NULL,
      \`title\` varchar(255) NOT NULL,
      \`message\` text NOT NULL,
      \`type\` enum('info','warning','success','error') NOT NULL DEFAULT 'info',
      \`isRead\` boolean NOT NULL DEFAULT false,
      \`createdAt\` timestamp DEFAULT (now()),
      CONSTRAINT \`notifications_id\` PRIMARY KEY(\`id\`)
    )`,
    
    `CREATE TABLE IF NOT EXISTS \`otpCodes\` (
      \`id\` varchar(64) NOT NULL,
      \`phone\` varchar(20) NOT NULL,
      \`code\` varchar(6) NOT NULL,
      \`expiresAt\` timestamp NOT NULL,
      \`verified\` boolean NOT NULL DEFAULT false,
      \`createdAt\` timestamp DEFAULT (now()),
      CONSTRAINT \`otpCodes_id\` PRIMARY KEY(\`id\`)
    )`,
    
    // Modify users table
    `ALTER TABLE \`users\` MODIFY COLUMN \`role\` enum('admin','teacher','student','assistant') NOT NULL DEFAULT 'student'`,
    `ALTER TABLE \`users\` ADD COLUMN IF NOT EXISTS \`phone\` varchar(20)`,
    `ALTER TABLE \`users\` ADD COLUMN IF NOT EXISTS \`profileImage\` text`,
  ];
  
  for (const statement of statements) {
    try {
      await connection.query(statement);
      console.log('✓ Executed statement');
    } catch (error: any) {
      if (!error.message.includes('already exists') && !error.message.includes('Duplicate column')) {
        console.error('Error:', error.message);
      }
    }
  }
  
  console.log('✓ Database schema fixed!');
  await connection.end();
}

fixDatabase().catch(console.error);

