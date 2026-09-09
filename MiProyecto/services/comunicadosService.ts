import { authService } from './authService';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

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

