import Database from 'better-sqlite3';
const db = new Database('./data.db');

// Create super admin user
const userId = 'superadmin_' + Date.now();
const phone = '+972542632557';
const now = new Date().toISOString();

try {
  // Check if user exists
  const existing = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
  
  if (existing) {
    // Update to admin
    db.prepare('UPDATE users SET role = ?, name = ? WHERE phone = ?')
      .run('admin', 'المدير العام', phone);
    console.log('✅ Updated existing user to Super Admin');
    console.log('User ID:', existing.id);
  } else {
    // Insert new user
    db.prepare(`
      INSERT INTO users (id, name, phone, role, loginMethod, createdAt, lastSignedIn)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, 'المدير العام', phone, 'admin', 'otp', now, now);
    console.log('✅ Created Super Admin user');
    console.log('User ID:', userId);
  }
  
  console.log('Phone:', phone);
  console.log('Role: admin (Super Admin)');
} catch (error) {
  console.error('❌ Error:', error.message);
}

db.close();
