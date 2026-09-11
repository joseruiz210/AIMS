import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { authService, User } from '../services/authService';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (correo: string, contrasenia: string) => Promise<{ success: boolean; message?: string }>;
   setSession: (user: User) => void;
  register: (nombre: string, correo: string, contrasenia: string, confirmContrasenia: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_ROUTES: Record<User['role'], string> = {
  ADMIN: '/admin',
  INSTRUCTOR: '/instructor/inicio',
  APRENDIZ: '/aprendiz',
};

function normalizeUser(user: User): User {
  const role = String(user.role).toUpperCase() as User['role'];
  return { ...user, role };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Al abrir la app, revisa si ya había sesión guardada
  useEffect(() => {
    (async () => {
      const { user: storedUser } = await authService.checkSession();
      if (storedUser) {
        const normalizedUser = normalizeUser(storedUser);
        setUser(normalizedUser);
        const destination = ROLE_ROUTES[normalizedUser.role] ?? '/(tabs)';
        router.replace(destination as any);
      }
      setIsLoading(false);
    })();
  }, []);

  const login = async (correo: string, contrasenia: string) => {
    const result = await authService.login(correo, contrasenia);

    if (!result.success || !result.user) {
      return { success: false, message: result.message };
    }

    const loggedUser = normalizeUser(result.user);
    setUser(loggedUser);

    const destination = ROLE_ROUTES[loggedUser.role] ?? '/(tabs)';
    router.replace(destination as any);

    return { success: true };
  };

  const register = async (nombre: string, correo: string, contrasenia: string, confirmContrasenia: string) => {
    return authService.register(nombre, correo, contrasenia, confirmContrasenia);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    router.replace('/');
  };

  const setSession = (loggedUser: User) => {
    const normalizedUser = normalizeUser(loggedUser);
    setUser(normalizedUser);
    const destination = ROLE_ROUTES[normalizedUser.role] ?? '/(tabs)';
    router.replace(destination as any);
  };

  return (
   <AuthContext.Provider value={{ user, isLoading, login, setSession, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
