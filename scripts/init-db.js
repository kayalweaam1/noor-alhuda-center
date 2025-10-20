import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function initDatabase() {
  console.log('🔧 Initializing database...');
  
  try {
    // Run drizzle-kit push to create tables
    const { stdout, stderr } = await execAsync('npx drizzle-kit push --force');
    
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    
    console.log('✅ Database initialized successfully!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    // Don't exit - let the app start anyway
  }
}

initDatabase();

