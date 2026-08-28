import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'aims_auth_jwt_token';
const USER_KEY = 'aims_auth_user_data';

/**
 * Cifra/ofusca cadenas en SessionStorage Web para evitar la lectura directa de JWT
 * al inspeccionar la página en las herramientas de desarrollo.
 */
function encryptWebData(plainText: string): string {
  try {
    const encoded = btoa(encodeURIComponent(plainText));
    return `aims_sec_v1_${encoded.split('').reverse().join('')}`;
  } catch (e) {
    return plainText;
  }
}

function decryptWebData(cipherText: string): string {
  try {
    if (!cipherText || !cipherText.startsWith('aims_sec_v1_')) return cipherText;
    const raw = cipherText.replace('aims_sec_v1_', '').split('').reverse().join('');
    return decodeURIComponent(atob(raw));
  } catch (e) {
    return cipherText;
  }
}

/**
 * Guarda el token JWT cifrado (SessionStorage en Web, SecureStore en Móvil)
 */
export async function saveToken(token: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(TOKEN_KEY, encryptWebData(token));
        localStorage.removeItem(TOKEN_KEY);
      }
    } else {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Error al guardar el token JWT:', error);
  }
}

/**
 * Obtiene el token JWT almacenado y cifrado
 */
export async function getToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
        return stored ? decryptWebData(stored) : null;
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
        sessionStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('aims_jwt_token');
      }
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error al eliminar el token JWT:', error);
  }
}

/**
 * Guarda los datos de usuario cifrados (SessionStorage en Web)
 */
export async function saveUserData(user: any): Promise<void> {
  try {
    const jsonValue = JSON.stringify(user);
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(USER_KEY, encryptWebData(jsonValue));
        localStorage.removeItem(USER_KEY);
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
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
        const jsonValue = stored ? decryptWebData(stored) : null;
        return jsonValue ? JSON.parse(jsonValue) : null;
      }
      return null;
    } else {
      const jsonValue = await SecureStore.getItemAsync(USER_KEY);
      return jsonValue ? JSON.parse(jsonValue) : null;
    }
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
        sessionStorage.removeItem(USER_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem('aims_user_data');
      }
    } else {
      await SecureStore.deleteItemAsync(USER_KEY);
    }
  } catch (error) {
    console.error('Error al eliminar datos del usuario:', error);
  }
}
