import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { WorkerEnv } from './db/client';

export type ClerkIdentity = {
  clerkUserId: string;
  email: string;
  fullName: string;
  role?: 'EMPLOYEE' | 'INVENTORY_HEAD' | 'FINANCE' | 'IT_ADMIN' | 'HR_MANAGER' | 'SYSTEM_ADMIN';
  isDevAuth?: boolean;
};

type ClerkJwtClaims = {
  sub: string;
  email?: string;
  email_address?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
};

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

const getJwks = (url: string) => {
  const cached = jwksCache.get(url);
  if (cached) {
    return cached;
  }
  const jwks = createRemoteJWKSet(new URL(url));
  jwksCache.set(url, jwks);
  return jwks;
};

const required = (value: string | undefined, field: string): string => {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(`Missing ${field} in Clerk token`);
  }
  return trimmed;
};

export const normalizeEmail = (value: string): string => value.trim().toLowerCase();

export const assertOrgEmail = (email: string, env: WorkerEnv) => {
  const domain = (env.ORG_EMAIL_DOMAIN || 'company.com').toLowerCase();
  if (!normalizeEmail(email).endsWith(`@${domain}`)) {
    throw new Error(`Email must belong to @${domain}`);
  }
};

export const isSystemAdminEmail = (email: string, env: WorkerEnv): boolean => {
  const raw = env.SYSTEM_ADMIN_EMAILS || '';
  const allowList = raw
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return allowList.includes(normalizeEmail(email));
};

export const verifyClerkToken = async (token: string, env: WorkerEnv): Promise<ClerkIdentity> => {
  const issuer = env.CLERK_ISSUER?.trim();
  const jwksUrl = env.CLERK_JWKS_URL?.trim();
  if (!issuer || !jwksUrl) {
    throw new Error('Clerk is not configured. Set CLERK_ISSUER and CLERK_JWKS_URL.');
  }

  const result = await jwtVerify(token, getJwks(jwksUrl), {
    issuer,
  });
  const payload = result.payload as unknown as ClerkJwtClaims;
  const email = required(payload.email || payload.email_address, 'email');
  const fullName =
    payload.full_name?.trim() ||
    `${payload.first_name || ''} ${payload.last_name || ''}`.trim() ||
    email.split('@')[0];

  return {
    clerkUserId: required(payload.sub, 'sub'),
    email: normalizeEmail(email),
    fullName,
  };
};
