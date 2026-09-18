import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { authService, User, RegisterData } from '../services/authService';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (credentials: { correo: string; contrasenia: string }) => Promise<{ success: boolean; message?: string }>;
   setSession: (user: User) => void;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_ROUTES: Record<User['role'], string> = {
  SUPERADMIN: '/admin',
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
    let isMounted = true;
    (async () => {
      try {
        const { user: storedUser } = await authService.checkSession();
        if (isMounted && storedUser) {
          const normalizedUser = normalizeUser(storedUser);
          setUser(normalizedUser);
        }
      } catch {
        // error al verificar sesión previa
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials: { correo: string; contrasenia: string }) => {
    const result = await authService.login(credentials);

    if (!result.success || !result.user) {
      return { success: false, message: result.message };
    }

    const loggedUser = normalizeUser(result.user);
    setUser(loggedUser);

    const destination = ROLE_ROUTES[loggedUser.role] ?? '/(tabs)';
    router.replace(destination as any);

    return { success: true };
  };

  const register = async (data: RegisterData) => {
    return authService.register(data);
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
