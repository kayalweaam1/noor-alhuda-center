import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

async function runMigration() {
  console.log('🔧 Starting MySQL migration via drizzle-kit...');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  try {
    const { stdout, stderr } = await execAsync('pnpm db:push', {
      env: process.env,
    });
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
    console.log('🎉 Migration completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration().catch((err) => {
  console.error(err);
  process.exit(1);
});

