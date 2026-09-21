import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { getToken, saveToken, removeToken, getUserData, saveUserData, removeUserData } from '../utils/storage';

// Determina la IP del host dinámicamente para Expo Go en dispositivos físicos
const getDynamicHost = (): string => {
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    return hostUri.split(':')[0];
  }
  return 'localhost';
};

// URL base de la API backend calculada dinámicamente según el entorno
export const getApiBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined'
      ? `http://${window.location.hostname}:3000/api/v1`
      : 'http://localhost:3000/api/v1';
  }
  const dynamicHost = getDynamicHost();
  if (dynamicHost === 'localhost' || dynamicHost === '127.0.0.1') {
    return Platform.OS === 'android' ? 'http://10.0.2.2:3000/api/v1' : 'http://localhost:3000/api/v1';
  }
  const isLocalIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(dynamicHost);
  if (isLocalIp) {
    return `http://${dynamicHost}:3000/api/v1`;
  }
  // Si es un túnel (ngrok, exp.direct, expo.dev), conectar al backend desplegado en Azure
  return 'https://academicaimsapp-edh3c3g2eabtgqc2.westus-01.azurewebsites.net/api/v1';
};

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
    const baseUrl = getApiBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const cacheKey = `${baseUrl}${cleanEndpoint}`;

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

    const targetUrl = `${baseUrl}${cleanEndpoint}`;
    console.log(`[API] ${method} -> ${targetUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    let response: Response;
    try {
      response = await fetch(targetUrl, {
        ...options,
        headers,
        signal: options.signal || controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

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
    const baseUrl = getApiBaseUrl();
    const isTimeout = error.name === 'AbortError';
    console.warn(`[API Error] ${options.method || 'GET'} ${endpoint}:`, isTimeout ? `Timeout (12s) alcanzado conectando a ${baseUrl}` : (error.message || error));
    return {
      success: false,
      message: isTimeout
        ? `Tiempo de espera agotado al conectar con el servidor backend (${baseUrl}). Verifica que esté accesible.`
        : (error.message || 'Error de conexión con el servidor AIMS API'),
      error,
    };
  }
}