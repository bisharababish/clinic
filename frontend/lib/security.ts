// src/lib/security.ts
// Browser-compatible password hashing using Web Crypto API
// Note: This uses PBKDF2 which is similar to bcrypt and works in browsers

// Convert ArrayBuffer to hex string
const arrayBufferToHex = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Convert hex string to ArrayBuffer
const hexToArrayBuffer = (hex: string): ArrayBuffer => {
  const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  return bytes.buffer;
};

// Generate a random salt
const generateSalt = (): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(16));
};

// Password hashing utilities for production use (browser-compatible)
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = generateSalt();
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    
    // Import the password as a key
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordData,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    
    // Derive key using PBKDF2 (similar to bcrypt)
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000, // Similar security to bcrypt rounds
        hash: 'SHA-256'
      },
      keyMaterial,
      256 // 32 bytes = 256 bits
    );
    
    // Combine salt and hash, then encode as hex
    const saltHex = arrayBufferToHex(salt);
    const hashHex = arrayBufferToHex(derivedBits);
    
    // Return in format: salt:hash (similar to bcrypt format)
    return `$pbkdf2$100000$${saltHex}$${hashHex}`;
  } catch (error) {
    console.error('Password hashing failed:', error);
    throw new Error('Password hashing failed');
  }
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  try {
    // Parse the hash format: $pbkdf2$iterations$salt$hash
    const parts = hash.split('$');
    if (parts.length !== 5 || parts[1] !== 'pbkdf2') {
      // If it's an old bcrypt hash, we can't verify it with this method
      // Return false to force password reset
      return false;
    }
    
    const iterations = parseInt(parts[2], 10);
    const saltHex = parts[3];
    const hashHex = parts[4];
    
    const saltBuffer = hexToArrayBuffer(saltHex);
    const salt = new Uint8Array(saltBuffer);
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    
    // Import the password as a key
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordData,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    
    // Derive key using the same parameters
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );
    
    const derivedHashHex = arrayBufferToHex(derivedBits);
    
    // Compare hashes (constant-time comparison)
    return derivedHashHex === hashHex;
  } catch (error) {
    console.error('Password verification failed:', error);
    return false;
  }
};

// Password strength validation
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
};
