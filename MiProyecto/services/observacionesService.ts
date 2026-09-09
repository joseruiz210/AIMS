import { authService } from './authService';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export interface ObservacionItem {
  id: string;
  tipo: 'ACADEMICA' | 'DISCIPLINARIA' | 'RECONOCIMIENTO' | 'OTRO';
  materia?: string;
  descripcion: string;
  fecha: string;
  aprendizId: string;
  aprendizNombre?: string;
  aprendizDocumento?: string;
  instructorId?: string;
  instructorNombre?: string;
}

export const observacionesService = {
  async getMisObservaciones(): Promise<ObservacionItem[]> {
    try {
      const response = await authService.fetchWithAuth(`${API_BASE_URL}/observaciones`);
      const data = await response.json();
      if (!response.ok || !data.data) return [];
      return (data.data || []).map((item: any) => ({
        id: item.id,
        tipo: item.tipo,
        materia: item.materia || 'ADSO',
        descripcion: item.descripcion,
        fecha: item.fecha ? new Date(item.fecha).toLocaleDateString('es-CO') : 'Reciente',
        aprendizId: item.aprendizId,
        aprendizNombre: item.aprendiz ? `${item.aprendiz.firstName} ${item.aprendiz.lastName}`.trim() : 'Aprendiz',
        aprendizDocumento: item.aprendiz?.phone || item.aprendiz?.id?.slice(0, 8) || '',
        instructorId: item.instructorId,
        instructorNombre: item.instructor ? `${item.instructor.firstName} ${item.instructor.lastName}`.trim() : 'Instructor',
      }));
    } catch {
      return [];
    }
  },

  async crearObservacion(payload: {
    aprendizId: string;
    tipo: 'ACADEMICA' | 'DISCIPLINARIA' | 'RECONOCIMIENTO' | 'OTRO';
    materia?: string;
    descripcion: string;
  }) {
    const response = await authService.fetchWithAuth(`${API_BASE_URL}/observaciones`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al crear observación');
    return data.data;
  },

  async eliminarObservacion(id: string) {
    const response = await authService.fetchWithAuth(`${API_BASE_URL}/observaciones/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al eliminar observación');
    return true;
  }
};
