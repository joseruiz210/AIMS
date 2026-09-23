import { authService } from './authService';
import { getApiBaseUrl } from './api';

const API_BASE_URL = getApiBaseUrl();

export interface Programa {
  id: string;
  codigo: string;
  nombre: string;
  nivel: string;
  duracionMeses: number;
  fichasActivasCount?: number;
  aprendicesCount?: number;
  instructoresCount?: number;
  competenciasCount?: number;
  estado?: 'Activo' | 'Inactivo';
}

export const programasService = {
  async getProgramas(params: { search?: string } = {}): Promise<Programa[]> {
    try {
      const query = params.search ? `?search=${encodeURIComponent(params.search)}` : '';
      const response = await authService.fetchWithAuth(`${API_BASE_URL}/programas${query}`);
      const data = await response.json();
      if (!response.ok || !data.data || data.data.length === 0) {
        return [];
      }
      return data.data.map((item: any) => ({
        id: item.id,
        codigo: item.codigo || 'PRG-01',
        nombre: item.nombre,
        nivel: item.nivel || 'Tecnólogo',
        duracionMeses: item.duracionMeses || 24,
        fichasActivasCount: item._count?.fichas || item.fichasActivasCount || 0,
        aprendicesCount: item.aprendicesCount || 0,
        instructoresCount: item.instructoresCount || 0,
        competenciasCount: item._count?.competencias || item.competenciasCount || 0,
        estado: item.estado || 'Activo',
      }));
    } catch {
      return [];
    }
  },


  async createPrograma(programaData: Omit<Programa, 'id'>) {
    const response = await authService.fetchWithAuth(`${API_BASE_URL}/programas`, {
      method: 'POST',
      body: JSON.stringify(programaData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al crear programa');
    return data.data;
  },

  async updatePrograma(id: string, programaData: Partial<Programa>) {
    const response = await authService.fetchWithAuth(`${API_BASE_URL}/programas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(programaData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al actualizar programa');
    return data.data;
  },

  async deletePrograma(id: string) {
    const response = await authService.fetchWithAuth(`${API_BASE_URL}/programas/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al eliminar programa');
    return true;
  }
};
