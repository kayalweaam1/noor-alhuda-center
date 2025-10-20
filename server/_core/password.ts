import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password with a hashed password
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * Check if a string is already hashed (bcrypt format)
 */
export function isHashed(password: string): boolean {
  // Bcrypt hashes start with $2a$, $2b$, or $2y$
  return /^\$2[aby]\$\d{2}\$/.test(password);
}

