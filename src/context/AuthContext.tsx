import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole } from '../types';
import { seedUsers } from '../data/seedData';
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (requiredRole: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const roleHierarchy: Record<UserRole, number> = {
  admin: 3,
  analyst: 2,
  viewer: 1,
};

const credentials: Record<string, string> = {
  admin: 'admin123',
  analyst1: 'analyst123',
  analyst2: 'analyst123',
  viewer: 'viewer123',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() =>
    getStorageItem<User | null>('current_user', null)
  );

  const [users] = useState<User[]>(seedUsers);

  useEffect(() => {
    if (user) {
      setStorageItem('current_user', user);
    }
  }, [user]);

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      await new Promise(resolve => setTimeout(resolve, 800));

      if (credentials[username] && credentials[username] === password) {
        const foundUser = users.find(u => u.username === username);

        if (foundUser) {
          const updatedUser = {
            ...foundUser,
            lastLogin: new Date().toISOString(),
          };

          setUser(updatedUser);
          setStorageItem('current_user', updatedUser);
          return true;
        }
      }

      return false;
    },
    [users]
  );

  const logout = useCallback(() => {
    setUser(null);
    removeStorageItem('current_user');
  }, []);

  const hasPermission = useCallback(
    (requiredRole: UserRole): boolean => {
      if (!user) return false;
      return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        isAuthenticated: !!user,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}