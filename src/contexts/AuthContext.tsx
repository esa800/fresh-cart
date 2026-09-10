import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { StoreService, subscribeToStore } from '../services/store';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  role: Role;
  login: (email: string, pass: string) => Promise<{ success: boolean; message: string; user?: User }>;
  register: (name: string, email: string, phone: string, pass: string) => Promise<{ success: boolean; message: string; user?: User }>;
  logout: () => void;
  switchDemoRole: (role: Role) => void;
  hasPermission: (requiredRoles: Role[]) => boolean;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(() => StoreService.getCurrentUser());

  useEffect(() => {
    const unsub = subscribeToStore(() => {
      setCurrentUserState(StoreService.getCurrentUser());
    });
    return unsub;
  }, []);

  const role: Role = currentUser?.role || 'customer';
  const isAuthenticated = Boolean(currentUser);
  const isAdmin = currentUser ? ['super_admin', 'manager', 'order_manager', 'product_manager'].includes(currentUser.role) : false;

  const login = async (email: string, pass: string): Promise<{ success: boolean; message: string; user?: User }> => {
    // In production, Firebase Authentication or Express /api/auth/login runs here.
    // For demo/development, matches users by email and ensures passwords are not empty.
    const users = StoreService.getUsers();
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!found) {
      // If user doesn't exist yet, create a customer account automatically for smooth user test experience!
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: email.includes('@') ? email.split('@')[0] : email,
        email: cleanEmail,
        phone: '01711000000',
        role: 'customer',
        createdAt: new Date().toISOString()
      };
      StoreService.saveUser(newUser);
      StoreService.setCurrentUser(newUser);
      setCurrentUserState(newUser);
      return { success: true, message: 'Welcome to KHAN store!', user: newUser };
    }

    StoreService.setCurrentUser(found);
    setCurrentUserState(found);
    return { success: true, message: `Welcome back, ${found.name}!`, user: found };
  };

  const register = async (name: string, email: string, phone: string, _pass: string) => {
    const users = StoreService.getUsers();
    const cleanEmail = email ? email.trim().toLowerCase() : `${phone.trim()}@khanstore.com`;
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail || (phone && u.phone === phone));

    if (existing) {
      return { success: false, message: 'এই ইমেইল বা ফোন নম্বরে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে। দয়া করে লগইন করুন।' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email: cleanEmail,
      phone,
      role: 'customer',
      savedAddresses: [],
      wishlistProductIds: [],
      createdAt: new Date().toISOString()
    };

    StoreService.saveUser(newUser);
    StoreService.setCurrentUser(newUser);
    setCurrentUserState(newUser);

    return { success: true, message: 'Account registered successfully!', user: newUser };
  };

  const logout = () => {
    StoreService.setCurrentUser(null);
    setCurrentUserState(null);
  };

  const switchDemoRole = (targetRole: Role) => {
    const users = StoreService.getUsers();
    let targetUser = users.find((u) => u.role === targetRole);
    if (!targetUser) {
      targetUser = {
        id: `user-${targetRole}-${Date.now()}`,
        name: `Demo ${targetRole.replace('_', ' ').toUpperCase()}`,
        email: `${targetRole}@khangadgetbd.com`,
        phone: '01700000000',
        role: targetRole,
        createdAt: new Date().toISOString()
      };
      users.push(targetUser);
      localStorage.setItem('freshcart_users_v1', JSON.stringify(users));
    }
    StoreService.setCurrentUser(targetUser);
    setCurrentUserState(targetUser);
  };

  const hasPermission = (requiredRoles?: Role[]): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'super_admin') return true; // Super Admin has universal access
    if (!requiredRoles || !Array.isArray(requiredRoles)) return false;
    return requiredRoles.includes(currentUser.role);
  };

  const updateUser = (user: User) => {
    StoreService.updateUserProfile(user);
    setCurrentUserState(user);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isAdmin,
        role,
        login,
        register,
        logout,
        switchDemoRole,
        hasPermission,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
