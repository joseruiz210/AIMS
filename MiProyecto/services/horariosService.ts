import { authService } from './authService';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export interface HorarioItem {
  id: string;
  fichaId: string;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  aula?: string;
  createdAt?: string;
}

export const horariosService = {
  async getHorariosByFicha(fichaId: string): Promise<HorarioItem[]> {
    try {
      const response = await authService.fetchWithAuth(`${API_BASE_URL}/horarios/ficha/${fichaId}`);
      const data = await response.json();
      if (!response.ok || !data.data) return [];
      return data.data;
    } catch {
      return [];
    }
  },

  async createHorario(payload: {
    fichaId: string;
    diaSemana: number;
    horaInicio: string;
    horaFin: string;
    ambiente?: string;
    tema?: string;
    aula?: string;
  }): Promise<HorarioItem> {
    const response = await authService.fetchWithAuth(`${API_BASE_URL}/horarios`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al crear la franja horaria');
    }
    return data.data;
  },

  async updateHorario(id: string, payload: {
    diaSemana?: number | string;
    horaInicio?: string;
    horaFin?: string;
    aula?: string;
  }): Promise<HorarioItem> {
    const response = await authService.fetchWithAuth(`${API_BASE_URL}/horarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al actualizar la franja horaria');
    }
    return data.data;
  },

  async deleteHorario(id: string): Promise<boolean> {
    const response = await authService.fetchWithAuth(`${API_BASE_URL}/horarios/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al eliminar la franja horaria');
    }
    return true;
  },

  async getMiHorario(): Promise<any> {
    try {
      const response = await authService.fetchWithAuth(`${API_BASE_URL}/horarios/mi-horario`);
      const data = await response.json();
      if (!response.ok || !data.data) return [];
      return data.data;
    } catch {
      return [];
    }
  },
};
