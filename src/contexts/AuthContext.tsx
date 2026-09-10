import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole } from '../types';
import { seedUsers } from '../data/seedData';
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (data: { name: string; username: string; email: string; password: string; role?: UserRole }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (requiredRole: UserRole) => boolean;
}

const defaultCredentials: Record<string, string> = {
  admin: 'admin123',
  analyst1: 'analyst123',
  analyst2: 'analyst123',
  viewer: 'viewer123',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const roleHierarchy: Record<UserRole, number> = {
  admin: 3,
  analyst: 2,
  viewer: 1,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStorageItem<User | null>('current_user', null));
  const [users, setUsers] = useState<User[]>(() => getStorageItem<User[]>('all_users', seedUsers));
  const [credentials, setCredentials] = useState<Record<string, string>>(() =>
    getStorageItem<Record<string, string>>('user_credentials', defaultCredentials)
  );

  useEffect(() => {
    if (user) setStorageItem('current_user', user);
  }, [user]);

  useEffect(() => {
    setStorageItem('all_users', users);
  }, [users]);

  useEffect(() => {
    setStorageItem('user_credentials', credentials);
  }, [credentials]);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const lowerUser = username.trim().toLowerCase();
    
    if (credentials[lowerUser] && credentials[lowerUser] === password) {
      const foundUser = users.find(u => u.username.toLowerCase() === lowerUser);
      if (foundUser) {
        const updatedUser = { ...foundUser, lastLogin: new Date().toISOString() };
        setUser(updatedUser);
        setStorageItem('current_user', updatedUser);
        return true;
      }
    }
    return false;
  }, [users, credentials]);

  const register = useCallback(async (data: { name: string; username: string; email: string; password: string; role?: UserRole }) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const lowerUser = data.username.trim().toLowerCase();
    const lowerEmail = data.email.trim().toLowerCase();

    if (users.some(u => u.username.toLowerCase() === lowerUser)) {
      return { success: false, error: 'Username already taken.' };
    }

    if (users.some(u => u.email.toLowerCase() === lowerEmail)) {
      return { success: false, error: 'Email already registered.' };
    }

    const newUser: User = {
      id: 'user-' + uuidv4().slice(0, 6),
      username: data.username.trim(),
      email: data.email.trim(),
      role: data.role || 'analyst',
      name: data.name.trim(),
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const newCredentials = { ...credentials, [lowerUser]: data.password };
    const newUsers = [...users, newUser];

    setCredentials(newCredentials);
    setUsers(newUsers);
    setUser(newUser);

    setStorageItem('user_credentials', newCredentials);
    setStorageItem('all_users', newUsers);
    setStorageItem('current_user', newUser);

    return { success: true };
  }, [users, credentials]);

  const logout = useCallback(() => {
    setUser(null);
    removeStorageItem('current_user');
  }, []);

  const hasPermission = useCallback((requiredRole: UserRole): boolean => {
    if (!user) return false;
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, users, isAuthenticated: !!user, login, register, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
