import { authService } from './authService';
import { getApiBaseUrl } from './api';

const API_BASE_URL = getApiBaseUrl();

export interface ComunicadoItem {
  id: string;
  titulo: string;
  mensaje: string;
  destinatario: string;
  fecha: string;
  leidos?: number;
}

export const comunicadosService = {
  async getComunicados(): Promise<ComunicadoItem[]> {
    try {
      const response = await authService.fetchWithAuth(`${API_BASE_URL}/comunicados`);
      const data = await response.json();
      if (!response.ok || !data.data) return [];
      return data.data;
    } catch {
      return [];
    }
  },

  async marcarLeido(id: string) {
    try {
      const response = await authService.fetchWithAuth(`${API_BASE_URL}/comunicados/${id}/read`, {
        method: 'POST',
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};

