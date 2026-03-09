import { useAuth, useUser } from '@clerk/react';
import { useEffect, useMemo, useState } from 'react';
import { graphqlRequest } from '../lib/graphqlClient';
import type { CreateUserInput, Role, User } from '../types/order';

export function useSession() {
  const { isLoaded, isSignedIn, getToken, signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const [token, setToken] = useState<string | null>(null);
  const [appUser, setAppUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!isLoaded || !isSignedIn) {
        setToken(null);
        setAppUser(null);
        return;
      }
      setIsAuthLoading(true);
      setAuthError(null);
      try {
        const sessionToken = await getToken();
        if (!sessionToken) throw new Error('Failed to get Clerk token');
        setToken(sessionToken);
        const data = await graphqlRequest<{ syncMe: User }, undefined>(
          'mutation { syncMe { id email fullName role createdAt } }',
          undefined,
          { token: sessionToken },
        );
        setAppUser(data.syncMe);
      } catch (error) {
        setAuthError(error instanceof Error ? error.message : 'Authentication failed');
      } finally {
        setIsAuthLoading(false);
      }
    };
    void load();
  }, [isLoaded, isSignedIn, getToken, clerkUser?.id]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let active = true;
    const refresh = async () => {
      try {
        const nextToken = await getToken({ skipCache: true });
        if (active && nextToken) setToken(nextToken);
      } catch (error) {
        if (active) setAuthError(error instanceof Error ? error.message : 'Token refresh failed');
      }
    };
    const timer = window.setInterval(() => void refresh(), 45000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [isLoaded, isSignedIn, getToken]);

  const createUser = async (input: CreateUserInput) => {
    if (!token) throw new Error('Unauthorized');
    const data = await graphqlRequest<{ createUser: User }, { input: CreateUserInput }>(
      'mutation($input: CreateUserInput!) { createUser(input: $input) { id email fullName role createdAt } }',
      { input },
      { token },
    );
    return data.createUser;
  };

  const deleteUser = async (userId: string) => {
    if (!token) throw new Error('Unauthorized');
    const data = await graphqlRequest<{ deleteUser: boolean }, { userId: string }>(
      'mutation($userId: ID!) { deleteUser(userId: $userId) }',
      { userId },
      { token },
    );
    return data.deleteUser;
  };

  const updateUserRole = async (userId: string, role: Role) => {
    if (!token) throw new Error('Unauthorized');
    const data = await graphqlRequest<{ updateUserRole: User }, { userId: string; role: Role }>(
      'mutation($userId: ID!, $role: Role!) { updateUserRole(userId: $userId, role: $role) { id email fullName role createdAt } }',
      { userId, role },
      { token },
    );
    return data.updateUserRole;
  };

  return {
    session: appUser ? { token, user: appUser } : null,
    token,
    user: appUser,
    role: appUser?.role ?? null,
    isAuthLoading,
    authError,
    createUser,
    updateUserRole,
    deleteUser,
    logout: () => void signOut(),
    isLoggedIn: useMemo(() => Boolean(isSignedIn && token && appUser), [isSignedIn, token, appUser]),
  } as { session: { token: string | null; user: User } | null; token: string | null; user: User | null; role: Role | null; isAuthLoading: boolean; authError: string | null; createUser: (input: CreateUserInput) => Promise<User>; updateUserRole: (userId: string, role: Role) => Promise<User>; deleteUser: (userId: string) => Promise<boolean>; logout: () => void; isLoggedIn: boolean };
}
