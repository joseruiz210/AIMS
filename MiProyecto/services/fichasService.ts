import { authService } from './authService';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export interface Ficha {
  id: string;
  codigo: string;
  numero: string;
  programaId?: string;
  programaNombre?: string;
  instructorId?: string;
  instructorNombre?: string;
  jornada?: string;
  aprendicesCount?: number;
  estado?: 'Activo' | 'Riesgo' | 'Inactivo' | 'FINALIZADO';
}

export const fichasService = {
  async getFichas(params: { search?: string } = {}): Promise<Ficha[]> {
    try {
      const query = params.search ? `?search=${encodeURIComponent(params.search)}` : '';
      const response = await authService.fetchWithAuth(`${API_BASE_URL}/fichas${query}`);
      const data = await response.json();
      if (!response.ok || !data.data || data.data.length === 0) {
        return [];
      }
      return data.data.map((item: any) => ({
        id: item.id || item.codigo,
        codigo: item.codigo || item.numero || 'N/A',
        numero: item.numero || item.codigo || '2845670',
        programaNombre: item.programa?.nombre || item.programaTitle || 'Programa Formación',
        instructorNombre: item.instructor ? `${item.instructor.firstName} ${item.instructor.lastName}` : (item.instructorNombre || 'Sin asignar'),
        jornada: item.jornada || item.shift || 'Jornada Mañana',
        aprendicesCount: item.aprendicesCount ?? (item._count?.matriculas || 0),
        estado: item.estado || item.status || 'Activo',
      }));
    } catch {
      return [];
    }
  },

  async createFicha(fichaData: { codigo: string; programaId?: string; jornada?: string; instructorId?: string }) {
    const response = await authService.fetchWithAuth(`${API_BASE_URL}/fichas`, {
      method: 'POST',
      body: JSON.stringify(fichaData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al crear ficha');
    return data.data;
  },

  async updateFicha(id: string, fichaData: Partial<Ficha>) {
    const response = await authService.fetchWithAuth(`${API_BASE_URL}/fichas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(fichaData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al actualizar ficha');
    return data.data;
  },

  async deleteFicha(id: string) {
    const response = await authService.fetchWithAuth(`${API_BASE_URL}/fichas/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al eliminar ficha');
    return true;
  }
};
