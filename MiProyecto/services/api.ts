import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { getToken, saveToken, removeToken, getUserData, saveUserData, removeUserData } from '../utils/storage';

// Determina la IP del host dinámicamente para Expo Go en dispositivos físicos
const getDynamicHostIp = (): string => {
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    return hostUri.split(':')[0];
  }
  return 'localhost';
};

// URL base de la API backend con resolución flexible para Expo / Azure
const resolveApiBaseUrl = (): string => {
  const rawUrl =
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.EXPO_PUBLIC_API_URI ||
    process.env.VITE_API_URI;

  if (rawUrl && typeof rawUrl === 'string' && rawUrl.trim() !== '') {
    let clean = rawUrl.trim().replace(/\/+$/, '');
    if (!clean.endsWith('/api/v1')) {
      clean = `${clean}/api/v1`;
    }
    return clean;
  }

  if (Platform.OS === 'web') {
    return typeof window !== 'undefined'
      ? `http://${window.location.hostname}:3000/api/v1`
      : 'http://localhost:3000/api/v1';
  }

  if (Platform.OS === 'android' && getDynamicHostIp() === 'localhost') {
    return 'http://10.0.2.2:3000/api/v1';
  }

  return `http://${getDynamicHostIp()}:3000/api/v1`;
};

const API_BASE_URL = resolveApiBaseUrl();

export const getApiBaseUrl = () => API_BASE_URL;

// ─── Cache en memoria con TTL ────────────────────────────────────────────────
// Evita llamadas HTTP redundantes a la API para peticiones GET identicas.
// El cache se invalida automaticamente despues de CACHE_TTL_MS milisegundos.
// Las peticiones POST/PUT/DELETE nunca se cachean.
const CACHE_TTL_MS = 30_000; // 30 segundos

interface CacheEntry {
  data: any;
  expiresAt: number;
}

const requestCache = new Map<string, CacheEntry>();

/**
 * Obtiene una entrada valida del cache o null si expiró/no existe.
 */
function getCached(key: string): any | null {
  const entry = requestCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    requestCache.delete(key);
    return null;
  }
  return entry.data;
}

/**
 * Guarda una respuesta en el cache con TTL.
 */
function setCached(key: string, data: any): void {
  requestCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

/**
 * Invalida todas las entradas del cache que contengan el prefijo dado.
 * Util para invalidar tras un POST/PUT/DELETE.
 */
export function invalidateCache(prefix: string): void {
  for (const key of requestCache.keys()) {
    if (key.startsWith(prefix)) {
      requestCache.delete(key);
    }
  }
}

// ─── Almacenamiento de sesion ─────────────────────────────────────────────────
export const storage = {
  getToken: async (): Promise<string | null> => {
    return getToken();
  },
  setToken: async (token: string): Promise<void> => {
    return saveToken(token);
  },
  removeToken: async (): Promise<void> => {
    return removeToken();
  },
  getUser: async (): Promise<any | null> => {
    return getUserData();
  },
  setUser: async (user: any): Promise<void> => {
    return saveUserData(user);
  },
  removeUser: async (): Promise<void> => {
    return removeUserData();
  }
};

// ─── Cliente HTTP con cache automatico para GET ───────────────────────────────
/**
 * Cliente generico de peticiones HTTP hacia la API de AIMS.
 *
 * - Las peticiones GET se cachean en memoria por CACHE_TTL_MS (30s).
 * - Las peticiones POST/PUT/PATCH/DELETE nunca se cachean.
 * - Si el metodo muta datos (no-GET), el cache del mismo endpoint se invalida.
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: any }> {
  try {
    const method = (options.method || 'GET').toUpperCase();
    const isReadOnly = method === 'GET';
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const cacheKey = `${API_BASE_URL}${cleanEndpoint}`;

    // Servir desde cache si es GET y hay una entrada valida
    if (isReadOnly) {
      const cached = getCached(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    const token = await storage.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
      ...options,
      headers,
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      // En mutaciones fallidas no invalidamos cache
      return {
        success: false,
        message: result.message || result.error || `Error ${response.status}: No se pudo completar la petición`,
        error: result,
      };
    }

    const resultObj = {
      success: true,
      data: result.data !== undefined ? result.data : result,
      message: result.message,
    };

    // Guardar en cache solo si es GET exitoso
    if (isReadOnly) {
      setCached(cacheKey, resultObj);
    } else {
      // Invalidar entradas relacionadas al mismo endpoint tras una mutacion
      invalidateCache(cacheKey);
    }

    return resultObj;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Error de conexión con el servidor AIMS API',
      error,
    };
  }
}