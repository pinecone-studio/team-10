import { useEffect, useMemo, useState } from 'react';
import { graphqlRequest, type RequestOptions } from '../lib/graphqlClient';
import type { CreateUserInput, Role, User } from '../types/order';

const ROLE_STORAGE_KEY = 'asset-portal-selected-role';
const DOMAIN_STORAGE_KEY = 'asset-portal-dev-domain';
const FALLBACK_ROLE: Role = 'INVENTORY_HEAD';
const ALL_ROLES: Role[] = ['EMPLOYEE', 'INVENTORY_HEAD', 'FINANCE', 'IT_ADMIN', 'HR_MANAGER', 'SYSTEM_ADMIN'];

const roleToName = (role: Role): string =>
  role
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export function useSession() {
  const [devDomain, setDevDomain] = useState<string>(() => {
    const saved = window.localStorage.getItem(DOMAIN_STORAGE_KEY)?.trim();
    if (saved) return saved;
    const configured = import.meta.env.VITE_DEV_AUTH_EMAIL_DOMAIN?.trim();
    return configured || 'assets.com';
  });
  const [selectedRole, setSelectedRole] = useState<Role>(() => {
    const saved = window.localStorage.getItem(ROLE_STORAGE_KEY);
    return ALL_ROLES.includes(saved as Role) ? (saved as Role) : FALLBACK_ROLE;
  });
  const [appUser, setAppUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    window.localStorage.setItem(ROLE_STORAGE_KEY, selectedRole);
  }, [selectedRole]);
  useEffect(() => {
    window.localStorage.setItem(DOMAIN_STORAGE_KEY, devDomain);
  }, [devDomain]);

  const requestOptions = useMemo<RequestOptions>(
    () => ({
      devAuth: {
        email: `${selectedRole.toLowerCase()}@${devDomain}`,
        fullName: `${roleToName(selectedRole)} Demo`,
        userId: `dev-${selectedRole.toLowerCase()}`,
        role: selectedRole,
      },
    }),
    [selectedRole, devDomain],
  );

  useEffect(() => {
    const load = async () => {
      setIsAuthLoading(true);
      setAuthError(null);
      try {
        const data = await graphqlRequest<{ syncMe: User }, undefined>(
          'mutation { syncMe { id email fullName role createdAt } }',
          undefined,
          requestOptions,
        );
        setAppUser(data.syncMe);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Authentication failed';
        const domainMatch = message.match(/Email must belong to @([a-z0-9.-]+)/i);
        if (domainMatch?.[1] && domainMatch[1] !== devDomain) {
          setDevDomain(domainMatch[1]);
          return;
        }
        setAppUser(null);
        setAuthError(message);
      } finally {
        setIsAuthLoading(false);
      }
    };
    void load();
  }, [requestOptions, devDomain]);

  const createUser = async (input: CreateUserInput) => {
    const data = await graphqlRequest<{ createUser: User }, { input: CreateUserInput }>(
      'mutation($input: CreateUserInput!) { createUser(input: $input) { id email fullName role createdAt } }',
      { input },
      requestOptions,
    );
    return data.createUser;
  };

  const deleteUser = async (userId: string) => {
    const data = await graphqlRequest<{ deleteUser: boolean }, { userId: string }>(
      'mutation($userId: ID!) { deleteUser(userId: $userId) }',
      { userId },
      requestOptions,
    );
    return data.deleteUser;
  };

  const updateUserRole = async (userId: string, role: Role) => {
    const data = await graphqlRequest<{ updateUserRole: User }, { userId: string; role: Role }>(
      'mutation($userId: ID!, $role: Role!) { updateUserRole(userId: $userId, role: $role) { id email fullName role createdAt } }',
      { userId, role },
      requestOptions,
    );
    return data.updateUserRole;
  };

  return {
    session: appUser ? { token: null, user: appUser } : null,
    token: null,
    user: appUser,
    role: appUser?.role ?? selectedRole,
    selectedRole,
    roles: ALL_ROLES,
    setSelectedRole,
    requestOptions,
    isAuthLoading,
    authError,
    createUser,
    updateUserRole,
    deleteUser,
    logout: () => setSelectedRole(FALLBACK_ROLE),
    isLoggedIn: Boolean(appUser),
  } as {
    session: { token: string | null; user: User } | null;
    token: string | null;
    user: User | null;
    role: Role;
    selectedRole: Role;
    roles: Role[];
    setSelectedRole: (role: Role) => void;
    requestOptions: RequestOptions;
    isAuthLoading: boolean;
    authError: string | null;
    createUser: (input: CreateUserInput) => Promise<User>;
    updateUserRole: (userId: string, role: Role) => Promise<User>;
    deleteUser: (userId: string) => Promise<boolean>;
    logout: () => void;
    isLoggedIn: boolean;
  };
}
