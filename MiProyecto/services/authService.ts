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
  academicData?: {
    fichaId?: string;
    fichaNumero?: string;
    sede?: string;
    trimestre?: number;
  };
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
  async login({ correo, contrasenia }: LoginCredentials): Promise<AuthResponse> {
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
        body: JSON.stringify({ email: correo, password: contrasenia }),
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
   * Registrar nuevo usuario con validación de contraseña y datos académicos opcionales (Ficha, Sede, Trimestre)
   */
  async register({
    nombre,
    correo,
    contrasenia,
    confirmContrasenia,
    role,
    tipoDocumento,
    documento,
    ficha,
    programa,
    academicData,
  }: RegisterData): Promise<AuthResponse> {
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
      const payload: any = {
        firstName,
        lastName,
        email: correo,
        password: contrasenia,
      };

      if (role) payload.role = role;
      if (tipoDocumento) payload.documentType = tipoDocumento;
      if (documento) payload.documentNumber = documento;
      if (ficha) {
        payload.fichaId = ficha;
        payload.ficha = ficha;
      }
      if (programa) {
        payload.programaId = programa;
        payload.programa = programa;
      }

      if (academicData) {
        if (academicData.fichaId) payload.fichaId = academicData.fichaId;
        if (academicData.fichaNumero) payload.fichaNumero = academicData.fichaNumero;
        if (academicData.sede) payload.sede = academicData.sede;
        if (academicData.trimestre) payload.trimestre = academicData.trimestre;
      }

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Error al registrar usuario.' };
      }

      // el registro NO devuelve token (solo retorna el user creado y su matrícula si aplica)
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
<<<<<<< HEAD
},
=======
  },
>>>>>>> a2470226edae0863cccfdcd982557dbbef0a094e

  /**
   * Actualizar Expo Push Token para notificaciones móviles
   */
  async updatePushToken(pushToken: string): Promise<boolean> {
    try {
      const token = await getToken();
      if (!token) return false;

      const response = await fetch(`${API_BASE_URL}/users/push-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pushToken }),
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  /**
   * Obtener perfil del usuario autenticado directamente desde PostgreSQL
   */
  async getProfile(): Promise<{ success: boolean; user?: any; message?: string }> {
    try {
      const response = await this.fetchWithAuth(`${API_BASE_URL}/users/profile`);
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || 'Error al obtener perfil' };
      }
      return { success: true, user: data.data };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error de conexión con el servidor.' };
    }
  },

  /**
   * Actualizar datos básicos de perfil (nombre, apellido, teléfono, documento)
   */
  async updateProfile(profileData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    documentType?: string;
    documentNumber?: string;
  }): Promise<{ success: boolean; user?: any; message?: string }> {
    try {
      const response = await this.fetchWithAuth(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || 'Error al actualizar perfil' };
      }
      if (data.data) {
        const current = await getUserData();
        const updatedUser = {
          ...current,
          ...data.data,
          nombre: `${data.data.firstName || ''} ${data.data.lastName || ''}`.trim() || current?.nombre,
        };
        await saveUserData(updatedUser);
      }
      return { success: true, user: data.data, message: data.message || 'Perfil actualizado exitosamente' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error de conexión con el servidor.' };
    }
  },
};