import bcrypt from 'bcryptjs';
import { hash as argon2Hash, verify as argon2Verify } from '@node-rs/argon2';

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password using argon2
 */
export async function hashPassword(password: string): Promise<string> {
  return await argon2Hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
}

/**
 * Compare a plain text password with a hashed password
 * Supports both bcrypt and argon2
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  // Check if it's argon2 format
  if (hashedPassword.startsWith('$argon2')) {
    try {
      return await argon2Verify(hashedPassword, password);
    } catch (error) {
      console.error('[Password] Argon2 verification error:', error);
      return false;
    }
  }
  
  // Check if it's bcrypt format
  if (/^\$2[aby]\$\d{2}\$/.test(hashedPassword)) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error('[Password] Bcrypt verification error:', error);
      return false;
    }
  }
  
  // Plain text comparison (fallback for old data)
  return hashedPassword === password;
}

/**
 * Check if a string is already hashed (bcrypt or argon2 format)
 */
export function isHashed(password: string): boolean {
  // Bcrypt hashes start with $2a$, $2b$, or $2y$
  // Argon2 hashes start with $argon2
  return /^\$2[aby]\$\d{2}\$/.test(password) || password.startsWith('$argon2');
}

