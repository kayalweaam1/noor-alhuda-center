import 'dotenv/config';
import { createDefaultAdmin } from '../server/db';

async function main() {
  console.log('👤 Ensuring default admin exists (MySQL)...');
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  await createDefaultAdmin();
  console.log('✅ Done');
}

main().catch((err) => {
  console.error('❌ Failed to create default admin:', err);
  process.exit(1);
});

