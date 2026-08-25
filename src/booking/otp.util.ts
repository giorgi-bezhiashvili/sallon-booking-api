import { createHmac, timingSafeEqual } from 'crypto';

function getSecret(): string {
  const secret = process.env.OTP_HASH_SECRET;
  if (!secret) {
    throw new Error('OTP_HASH_SECRET is not set');
  }
  return secret;
}

export function hashOtp(code: string): string {
  return createHmac('sha256', getSecret()).update(code).digest('hex');
}

export function otpMatches(code: string, storedHash: string): boolean {
  const candidate = Buffer.from(hashOtp(code), 'hex');
  const stored = Buffer.from(storedHash, 'hex');
  if (candidate.length !== stored.length) {
    return false;
  }
  return timingSafeEqual(candidate, stored);
}
