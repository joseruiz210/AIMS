import { authService } from './authService';
import { getApiBaseUrl } from './api';
import { getStorageItem, setStorageItem } from '../utils/storage';

const STORAGE_COMUNICADOS_KEY = 'aims_comunicados_list';

export interface ComunicadoItem {
  id: string;
  titulo: string;
  mensaje: string;
  destinatario: string;
  fecha: string;
  leidos?: number;
  autor?: string;
  fichaId?: string;
  fichaNumero?: string;
  tipo?: 'INSTITUCIONAL' | 'FICHA' | 'GENERAL';
}

async function getStoredComunicados(): Promise<ComunicadoItem[]> {
  try {
    const raw = await getStorageItem(STORAGE_COMUNICADOS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveStoredComunicados(items: ComunicadoItem[]): Promise<void> {
  try {
    await setStorageItem(STORAGE_COMUNICADOS_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error guardando comunicados en almacenamiento local:', error);
  }
}

export const comunicadosService = {
  /**
   * Obtiene todos los comunicados visibles para el usuario autenticado desde el backend.
   * En caso de indisponibilidad de red, recurre al almacenamiento local (cache).
   */
  async getComunicados(): Promise<ComunicadoItem[]> {
    const baseUrl = getApiBaseUrl();

    try {
      const response = await authService.fetchWithAuth(`${baseUrl}/comunicados`);
      if (response.ok) {
        const json = await response.json();
        const serverData: any[] = json.data || (Array.isArray(json) ? json : []);
        if (Array.isArray(serverData)) {
          const mapped: ComunicadoItem[] = serverData.map((it: any) => ({
            id: String(it.id),
            titulo: it.titulo || 'Comunicado',
            mensaje: it.mensaje || '',
            destinatario: it.destinatario || (it.fichaNumero ? `Ficha ${it.fichaNumero}` : 'Todos los usuarios'),
            fecha: it.fecha || (it.createdAt ? it.createdAt.split('T')[0] : 'Hoy'),
            leidos: it.leidos ?? 0,
            autor: it.autor || (it.fichaId ? 'Instructor' : 'Administración'),
            fichaId: it.fichaId,
            fichaNumero: it.fichaNumero,
            tipo: it.fichaId ? 'FICHA' : 'INSTITUCIONAL',
          }));

          // Actualizar cache local
          await saveStoredComunicados(mapped);
          return mapped;
        }
      }
    } catch (err) {
      console.warn('[comunicadosService] Error consultando /comunicados, usando cache:', err);
    }

    // Fallback a almacenamiento local si no hay conexión
    return getStoredComunicados();
  },

  /**
   * Publica un nuevo comunicado oficial en el backend.
   * Admite avisos globales (Admin) o dirigidos a una o más fichas (Instructor).
   */
  async crearComunicado(payload: {
    titulo: string;
    mensaje: string;
    destinatario?: string;
    fichaId?: string;
    fichaIds?: string[];
    autor?: string;
    tipo?: 'INSTITUCIONAL' | 'FICHA' | 'GENERAL';
  }): Promise<ComunicadoItem> {
    const baseUrl = getApiBaseUrl();
    const now = new Date();
    const formattedDate = now.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
    });

    const targetFichaIds = payload.fichaIds && payload.fichaIds.length > 0
      ? payload.fichaIds
      : payload.fichaId
      ? [payload.fichaId]
      : [];

    let createdItem: ComunicadoItem = {
      id: `com_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      titulo: payload.titulo.trim(),
      mensaje: payload.mensaje.trim(),
      destinatario: payload.destinatario?.trim() || (payload.fichaId ? 'Ficha' : 'Todos los usuarios'),
      fecha: formattedDate,
      leidos: 0,
      autor: payload.autor || 'Administración',
      fichaId: payload.fichaId,
      tipo: payload.tipo || (payload.fichaId ? 'FICHA' : 'GENERAL'),
    };

    try {
      if (targetFichaIds.length > 0) {
        // Enviar para cada ficha solicitada (Instructor)
        for (const fId of targetFichaIds) {
          const body = {
            titulo: payload.titulo.trim(),
            mensaje: payload.mensaje.trim(),
            fichaId: fId,
          };
          const res = await authService.fetchWithAuth(`${baseUrl}/comunicados`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          if (res.ok) {
            const json = await res.json();
            if (json.data && json.data.id) {
              createdItem = {
                id: String(json.data.id),
                titulo: json.data.titulo || payload.titulo.trim(),
                mensaje: json.data.mensaje || payload.mensaje.trim(),
                destinatario: json.data.destinatario || createdItem.destinatario,
                fecha: formattedDate,
                leidos: 0,
                autor: payload.autor || 'Instructor',
                fichaId: fId,
                tipo: 'FICHA',
              };
            }
          } else {
            const err = await res.json().catch(() => ({}));
            console.warn('[comunicadosService] Error en backend POST /comunicados ficha:', err);
          }
        }
      } else {
        // Aviso global (Admin) - El validador Joi no permite fichaId en avisos de administración
        const body = {
          titulo: payload.titulo.trim(),
          mensaje: payload.mensaje.trim(),
        };
        const res = await authService.fetchWithAuth(`${baseUrl}/comunicados`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.id) {
            createdItem = {
              id: String(json.data.id),
              titulo: json.data.titulo || payload.titulo.trim(),
              mensaje: json.data.mensaje || payload.mensaje.trim(),
              destinatario: json.data.destinatario || 'Todos los usuarios',
              fecha: formattedDate,
              leidos: 0,
              autor: payload.autor || 'Administración',
              tipo: 'INSTITUCIONAL',
            };
          }
        } else {
          const err = await res.json().catch(() => ({}));
          console.warn('[comunicadosService] Error en backend POST /comunicados global:', err);
        }
      }
    } catch (err) {
      console.warn('[comunicadosService] Error enviando comunicado a API:', err);
    }

    // Persistir en cache local para reactividad inmediata
    const currentList = await getStoredComunicados();
    await saveStoredComunicados([createdItem, ...currentList]);

    return createdItem;
  },

  /**
   * Obtiene los comunicados emitidos por el instructor o usuario actual
   */
  async getComunicadosEmitidos(autorEmailOrName?: string): Promise<ComunicadoItem[]> {
    const all = await this.getComunicados();
    if (!autorEmailOrName) {
      return all.filter((item) => item.tipo === 'FICHA' || (item.autor && item.autor !== 'Coordinación Académica'));
    }
    const query = autorEmailOrName.toLowerCase();
    return all.filter((item) =>
      item.autor?.toLowerCase().includes(query) || item.tipo === 'FICHA'
    );
  },

  /**
   * Marca un comunicado como leído e incrementa métricas
   */
  async marcarLeido(id: string): Promise<boolean> {
    const baseUrl = getApiBaseUrl();
    const localItems = await getStoredComunicados();
    let updated = false;

    const modified = localItems.map((item) => {
      if (item.id === id) {
        updated = true;
        return { ...item, leidos: (item.leidos || 0) + 1 };
      }
      return item;
    });

    if (updated) {
      await saveStoredComunicados(modified);
    }

    try {
      const response = await authService.fetchWithAuth(`${baseUrl}/comunicados/${id}/read`, {
        method: 'POST',
      });
      return response.ok;
    } catch {
      return updated;
    }
  },
};
