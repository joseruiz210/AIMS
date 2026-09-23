import { authService } from './authService';
import { getApiBaseUrl } from './api';
import { getStorageItem, setStorageItem } from '../utils/storage';

const API_BASE_URL = getApiBaseUrl();
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
  tipo?: 'INSTITUCIONAL' | 'FICHA' | 'GENERAL';
}

const DEFAULT_COMUNICADOS: ComunicadoItem[] = [
  {
    id: 'com-init-1',
    titulo: 'Inicio de trimestre y entrega de planes de formación',
    mensaje: 'Estimados instructores y aprendices, damos la bienvenida al nuevo ciclo formativo. Recuerden revisar los horarios actualizados y verificar la asignación de ambientes en la plataforma.',
    destinatario: 'Instructores y Aprendices',
    fecha: '20 Sep',
    leidos: 48,
    autor: 'Coordinación Académica',
    tipo: 'INSTITUCIONAL',
  },
  {
    id: 'com-init-2',
    titulo: 'Mantenimiento preventivo en plataformas Zajuna y Sofiaplus',
    mensaje: 'Este fin de semana se realizarán labores técnicas de actualización en los servidores centrales. Por favor anticipar la carga de evidencias y actividades formativas.',
    destinatario: 'General',
    fecha: '18 Sep',
    leidos: 115,
    autor: 'Administración Centro',
    tipo: 'INSTITUCIONAL',
  },
  {
    id: 'com-init-3',
    titulo: 'Jornada de bienestar y orientación al aprendiz',
    mensaje: 'Se invita a todos los aprendices y voceros de ficha a participar en el taller de liderazgo y habilidades blandas en el auditorio principal.',
    destinatario: 'Todos los aprendices',
    fecha: '15 Sep',
    leidos: 82,
    autor: 'Bienestar al Aprendiz',
    tipo: 'INSTITUCIONAL',
  },
];

async function getStoredComunicados(): Promise<ComunicadoItem[]> {
  try {
    const raw = await getStorageItem(STORAGE_COMUNICADOS_KEY);
    if (!raw) {
      await setStorageItem(STORAGE_COMUNICADOS_KEY, JSON.stringify(DEFAULT_COMUNICADOS));
      return DEFAULT_COMUNICADOS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_COMUNICADOS;
  } catch {
    return DEFAULT_COMUNICADOS;
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
   * Obtiene todos los comunicados disponibles, combinando almacenamiento local y backend
   */
  async getComunicados(): Promise<ComunicadoItem[]> {
    const localItems = await getStoredComunicados();
    const itemMap = new Map<string, ComunicadoItem>();

    // Cargar locales primero
    localItems.forEach((it) => itemMap.set(it.id, it));

    // Intentar consultar backend API
    try {
      const response = await authService.fetchWithAuth(`${API_BASE_URL}/comunicados`);
      if (response.ok) {
        const json = await response.json();
        const serverData: ComunicadoItem[] = json.data || (Array.isArray(json) ? json : []);
        serverData.forEach((it) => {
          if (it.id) {
            itemMap.set(it.id, { ...itemMap.get(it.id), ...it });
          }
        });
      }
    } catch {
      // Operación offline fluida: los datos locales permanecen
    }

    return Array.from(itemMap.values());
  },

  /**
   * Publica un nuevo comunicado (por ejemplo de un instructor hacia sus fichas asignadas)
   */
  async crearComunicado(payload: {
    titulo: string;
    mensaje: string;
    destinatario: string;
    fichaId?: string;
    autor?: string;
    tipo?: 'INSTITUCIONAL' | 'FICHA' | 'GENERAL';
  }): Promise<ComunicadoItem> {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
    });

    const nuevo: ComunicadoItem = {
      id: `com_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      titulo: payload.titulo.trim(),
      mensaje: payload.mensaje.trim(),
      destinatario: payload.destinatario.trim(),
      fecha: formattedDate,
      leidos: 0,
      autor: payload.autor || 'Instructor',
      fichaId: payload.fichaId,
      tipo: payload.tipo || (payload.fichaId ? 'FICHA' : 'GENERAL'),
    };

    // 1. Guardar de forma inmediata en almacenamiento local
    const currentList = await getStoredComunicados();
    const updatedList = [nuevo, ...currentList];
    await saveStoredComunicados(updatedList);

    // 2. Sincronizar en segundo plano con el backend API
    try {
      await authService.fetchWithAuth(`${API_BASE_URL}/comunicados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevo),
      });
    } catch {
      // Si la API remota aún no tiene la ruta activa o está offline, el comunicado persiste localmente
    }

    return nuevo;
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
      const response = await authService.fetchWithAuth(`${API_BASE_URL}/comunicados/${id}/read`, {
        method: 'POST',
      });
      return response.ok;
    } catch {
      return updated;
    }
  },
};
