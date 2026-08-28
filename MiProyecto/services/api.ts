import { Platform } from 'react-native';

// URL base de la API backend (puerto 3000)
const API_BASE_URL = Platform.OS === 'web' 
  ? (typeof window !== 'undefined' ? `http://${window.location.hostname}:3000/api/v1` : 'http://localhost:3000/api/v1')
  : 'http://10.0.2.2:3000/api/v1';

export const getApiBaseUrl = () => API_BASE_URL;

import { saveToken, getToken, removeToken, saveUserData, getUserData, removeUserData } from '../utils/storage';

export const storage = {
  getToken,
  setToken: saveToken,
  removeToken,
  getUser: getUserData,
  setUser: saveUserData,
  removeUser: removeUserData,
};

// Cliente genérico de peticiones HTTP
export async function apiFetch<T = any>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: any }> {
  try {
    const token = await storage.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
      ...options,
      credentials: 'include',
      headers,
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: result.message || result.error || `Error ${response.status}: No se pudo completar la petición`,
        error: result,
      };
    }

    return {
      success: true,
      data: result.data !== undefined ? result.data : result,
      message: result.message,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Error de conexión con el servidor AIMS API',
      error,
    };
  }
}
