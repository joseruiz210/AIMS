import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch, storage } from '../services/api';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'ADMIN' | 'INSTRUCTOR' | 'APRENDIZ';
  phone?: string;
  is_active?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (nombreCompleto: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const savedToken = await storage.getToken();
      const savedUser = await storage.getUser();

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);
        
        // Verificar token contra el servidor
        const verifyRes = await apiFetch('/auth/me');
        if (verifyRes.success && verifyRes.data?.user) {
          setUser(verifyRes.data.user);
          await storage.setUser(verifyRes.data.user);
        }
      }
    } catch (error) {
      console.error("Error al cargar la sesión:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      const { token: newToken, user: userData } = response.data;
      setToken(newToken);
      setUser(userData);
      await storage.setToken(newToken);
      await storage.setUser(userData);
      return { success: true };
    }

    return { 
      success: false, 
      message: response.message || 'Credenciales incorrectas o error en el servidor' 
    };
  };

  const register = async (nombreCompleto: string, email: string, password: string) => {
    // Dividir nombre completo en nombre y apellido
    const parts = nombreCompleto.trim().split(' ');
    const first_name = parts[0] || 'Usuario';
    const last_name = parts.slice(1).join(' ') || 'AIMS';

    const response = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        first_name,
        last_name,
        email,
        password,
        role: 'APRENDIZ', // Rol por defecto
      }),
    });

    if (response.success && response.data) {
      const { token: newToken, user: userData } = response.data;
      setToken(newToken);
      setUser(userData);
      await storage.setToken(newToken);
      await storage.setUser(userData);
      return { success: true };
    }

    return { 
      success: false, 
      message: response.message || 'Error al registrar el usuario' 
    };
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await storage.removeToken();
    await storage.removeUser();
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
