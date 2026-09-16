import { Platform } from 'react-native';
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

  async getFichaById(id: string): Promise<any> {
    try {
      const response = await authService.fetchWithAuth(`${API_BASE_URL}/fichas/${id}`);
      const data = await response.json();
      if (!response.ok || !data.data) return null;
      return data.data;
    } catch {
      return null;
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
  },

  async importAprendices(fichaId: string, file: File | Blob | any) {
    const formData = new FormData();
    if (file.uri && Platform.OS !== 'web') {
      formData.append('archivo', {
        uri: file.uri,
        name: file.name || 'aprendices.csv',
        type: file.type || 'text/csv',
      } as any);
    } else {
      formData.append('archivo', file);
    }

    const { token } = await authService.checkSession();
    const response = await fetch(`${API_BASE_URL}/fichas/${fichaId}/aprendices/carga`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      const errorMsg = data.errors && data.errors.length ? data.errors.join('\n') : (data.message || 'Error al cargar archivo');
      throw new Error(errorMsg);
    }
    return data.data;
  },

  async importAprendicesGeneral(file: File | Blob | any) {
    const formData = new FormData();
    if (file.uri && Platform.OS !== 'web') {
      formData.append('archivo', {
        uri: file.uri,
        name: file.name || 'aprendices.csv',
        type: file.type || 'text/csv',
      } as any);
    } else {
      formData.append('archivo', file);
    }

    const { token } = await authService.checkSession();
    const response = await fetch(`${API_BASE_URL}/fichas/carga`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      const errorMsg = data.errors && data.errors.length ? data.errors.join('\n') : (data.message || 'Error al cargar archivo');
      throw new Error(errorMsg);
    }
    return data.data;
  },

  async getInstructores(): Promise<any[]> {
    try {
      const response = await authService.fetchWithAuth(`${API_BASE_URL}/users?role=INSTRUCTOR`);
      const data = await response.json();
      if (!response.ok || !data.data) return [];
      return Array.isArray(data.data) ? data.data : (data.data.users || []);
    } catch {
      return [];
    }
  },

  async assignInstructor(fichaId: string, instructorId: string, isLeader: boolean = true) {
    const response = await authService.fetchWithAuth(`${API_BASE_URL}/fichas/${fichaId}/instructores`, {
      method: 'POST',
      body: JSON.stringify({ instructorId, isLeader }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al asignar instructor');
    return data.data;
  }
};
