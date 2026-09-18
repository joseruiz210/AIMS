import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'aims_auth_jwt_token';
const USER_KEY = 'aims_auth_user_data';

/**
 * Guarda el token JWT de forma segura
 */
export async function saveToken(token: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, token);
      }
    } else {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Error al guardar el token JWT:', error);
  }
}

/**
 * Obtiene el token JWT almacenado
 */
export async function getToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(TOKEN_KEY);
      }
      return null;
    } else {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error al obtener el token JWT:', error);
    return null;
  }
}

/**
 * Elimina el token JWT almacenado (Logout)
 */
export async function removeToken(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
      }
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error al eliminar el token JWT:', error);
  }
}

/**
 * Guarda los datos de usuario
 */
export async function saveUserData(user: any): Promise<void> {
  try {
    const jsonValue = JSON.stringify(user);
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        localStorage.setItem(USER_KEY, jsonValue);
      }
    } else {
      await SecureStore.setItemAsync(USER_KEY, jsonValue);
    }
  } catch (error) {
    console.error('Error al guardar datos del usuario:', error);
  }
}

/**
 * Obtiene los datos de usuario
 */
export async function getUserData(): Promise<any | null> {
  try {
    let jsonValue: string | null = null;
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        jsonValue = localStorage.getItem(USER_KEY);
      }
    } else {
      jsonValue = await SecureStore.getItemAsync(USER_KEY);
    }
    return jsonValue ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    return null;
  }
}

/**
 * Elimina los datos de usuario
 */
export async function removeUserData(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(USER_KEY);
      }
    } else {
      await SecureStore.deleteItemAsync(USER_KEY);
    }
  } catch (error) {
    console.error('Error al eliminar datos del usuario:', error);
  }
}

const REMEMBERED_AUTH_KEY = 'aims_remembered_auth_credentials';

export interface RememberedAuth {
  correo: string;
  contrasenia?: string;
  remember: boolean;
}

/**
 * Guarda las credenciales recordadas del usuario para el inicio de sesión
 */
export async function saveRememberedAuth(data: RememberedAuth): Promise<void> {
  try {
    const jsonValue = JSON.stringify(data);
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        localStorage.setItem(REMEMBERED_AUTH_KEY, jsonValue);
      }
    } else {
      await SecureStore.setItemAsync(REMEMBERED_AUTH_KEY, jsonValue);
    }
  } catch (error) {
    console.error('Error al guardar credenciales recordadas:', error);
  }
}

/**
 * Obtiene las credenciales recordadas si existen
 */
export async function getRememberedAuth(): Promise<RememberedAuth | null> {
  try {
    let jsonValue: string | null = null;
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        jsonValue = localStorage.getItem(REMEMBERED_AUTH_KEY);
      }
    } else {
      jsonValue = await SecureStore.getItemAsync(REMEMBERED_AUTH_KEY);
    }
    return jsonValue ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error al obtener credenciales recordadas:', error);
    return null;
  }
}

/**
 * Elimina las credenciales recordadas
 */
export async function removeRememberedAuth(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(REMEMBERED_AUTH_KEY);
      }
    } else {
      await SecureStore.deleteItemAsync(REMEMBERED_AUTH_KEY);
    }
  } catch (error) {
    console.error('Error al eliminar credenciales recordadas:', error);
  }
}

