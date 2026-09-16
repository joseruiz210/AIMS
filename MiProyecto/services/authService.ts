import { saveToken, getToken, removeToken, saveUserData, getUserData, removeUserData } from '../utils/storage';
import { validatePassword, verifyEmailDomainExistence } from '../utils/validation';

export interface User {
  id: string;
  nombre: string;
  correo: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'INSTRUCTOR' | 'APRENDIZ';
}
export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export interface LoginCredentials {
  correo: string;
  contrasenia: string;
  role: 'INSTRUCTOR' | 'APRENDIZ';
  documento?: string;
}

export interface RegisterData {
  nombre: string;
  correo: string;
  contrasenia: string;
  confirmContrasenia: string;
  role: 'INSTRUCTOR' | 'APRENDIZ';
  tipoDocumento?: string;
  documento?: string;
  ficha?: string;
  programa?: string;
}

// Configuración de URL base para la API Backend
// Se carga desde .env con EXPO_PUBLIC_API_URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
/**
 * Servicio de Autenticación JWT y Gestión de Cuenta
 */
export const authService = {
  /**
   * Iniciar sesión de usuario y obtener JWT
   */
  async login({ correo, contrasenia, role, documento }: LoginCredentials): Promise<AuthResponse> {
    const emailCheck = await verifyEmailDomainExistence(correo);
    if (!emailCheck.isValidFormat || !emailCheck.isNotDisposable || !emailCheck.domainExists) {
      return { success: false, message: emailCheck.message };
    }
    if (!contrasenia) {
      return { success: false, message: 'Por favor ingresa tu contraseña.' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: correo, password: contrasenia, role, documento }),
      });
      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Error al iniciar sesión.' };
      }

      await saveToken(data.data.accessToken);
      await saveUserData(data.data.user);
      return { success: true, token: data.data.accessToken, user: data.data.user, message: data.message };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error de conexión con el servidor.' };
    }
  },

  /**
   * Registrar nuevo usuario con validación de contraseña
   */
  async register({ nombre, correo, contrasenia, confirmContrasenia, role, tipoDocumento, documento, ficha, programa }: RegisterData): Promise<AuthResponse> {
    if (!nombre.trim()) {
      return { success: false, message: 'El nombre completo es requerido.' };
    }
    const emailCheck = await verifyEmailDomainExistence(correo);
    if (!emailCheck.isValidFormat || !emailCheck.isNotDisposable || !emailCheck.domainExists) {
      return { success: false, message: emailCheck.message };
    }
    const passValidation = validatePassword(contrasenia);
    if (!passValidation.isValid) {
      return { success: false, message: `La contraseña no cumple con los requisitos: ${passValidation.errors.join(', ')}` };
    }
    if (contrasenia !== confirmContrasenia) {
      return { success: false, message: 'Las contraseñas no coinciden.' };
    }

    // el backend espera firstName y lastName separados
    const parts = nombre.trim().split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || firstName;

    if (firstName.length < 2) {
      return { success: false, message: 'El nombre debe tener al menos 2 caracteres.' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email: correo,
          password: contrasenia,
          role,
          documentType: tipoDocumento,
          documentNumber: documento,
          ficha,
          programa,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Error al registrar usuario.' };
      }

      // el registro NO devuelve token (revisa auth.controller.js: solo retorna el user creado)
      return { success: true, user: data.data, message: data.message };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al conectar con el servidor.' };
    }
  },

  /**
   * Cerrar Sesión y remover JWT de expo-secure-store
   */
  async logout(): Promise<void> {
    await removeToken();
    await removeUserData();
  },

  /**
   * Obtener sesión activa al cargar la aplicación
   */
  async checkSession(): Promise<{ token: string | null; user: User | null }> {
    const token = await getToken();
    const user = await getUserData();
    return { token, user };
  },

  /**
   * Helper para realizar peticiones HTTP autenticadas con el JWT Bearer
   */
  async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    return fetch(url, {
      ...options,
      headers,
    });
  },

  /**
   * Confirmar la cuenta usando el token enviado por correo (link de verificación)
   */
  async verifyEmailToken(token: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || 'Token inválido o expirado.' };
      }
      return { success: true, message: data.message };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error de conexión con el servidor.' };
    }
  },

  /**
   * Solicitar recuperación de contraseña (envía el correo con el enlace)
   */
  async forgotPassword(correo: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: correo }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || 'Error al solicitar recuperación.' };
      }
      return { success: true, message: data.message };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error de conexión con el servidor.' };
    }
  },

  /**
   * Restablecer la contraseña con el token recibido por correo
   */
  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || 'Token inválido o expirado.' };
      }
      return { success: true, message: data.message };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error de conexión con el servidor.' };
    }

    
  },

  /**
 * Enviar Magic Link al correo (login sin contraseña)
 */
async sendMagicLink(correo: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/magic-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: correo }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data.message || 'Error al enviar el enlace.' };
    }
    return { success: true, message: data.message };
  } catch (error: any) {
    return { success: false, message: error.message || 'Error de conexión con el servidor.' };
  }
},

/**
 * Verificar el token del Magic Link y obtener sesión
 */
async verifyMagicLinkToken(token: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/magic-link/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data.message || 'Enlace inválido o expirado.' };
    }
    await saveToken(data.data.accessToken);
    await saveUserData(data.data.user);
    return { success: true, token: data.data.accessToken, user: data.data.user, message: data.message };
  } catch (error: any) {
    return { success: false, message: error.message || 'Error de conexión con el servidor.' };
  }
},

/**
 * Iniciar sesión con Google usando el idToken de expo-auth-session
 */
async googleLogin(idToken: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data.message || 'Error al iniciar sesión con Google.' };
    }
    await saveToken(data.data.accessToken);
    await saveUserData(data.data.user);
    return { success: true, token: data.data.accessToken, user: data.data.user, message: data.message };
  } catch (error: any) {
    return { success: false, message: error.message || 'Error de conexión con el servidor.' };
  }
},
};