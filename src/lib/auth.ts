import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super_secret_everafter_jwt_key_2026_change_in_production'
);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(payload: { id: number; email: string; role: string; name: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secretKey);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as { id: number; email: string; role: string; name: string };
  } catch {
    return null;
  }
}
