import { authService } from './authService';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export interface RegistroAsistencia {
  id: string;
  fecha: string;
  aprendizId: string;
  aprendizNombre: string;
  fichaCodigo: string;
  estado: 'PRESENTE' | 'AUSENTE' | 'EXCUSADO' | 'TARDANZA';
  observacion?: string;
}

export const asistenciaService = {
  async getAsistenciasByFicha(fichaId: string, fecha?: string): Promise<RegistroAsistencia[]> {
    try {
      const query = fecha ? `?fecha=${fecha}` : '';
      const response = await authService.fetchWithAuth(`${API_BASE_URL}/asistencia/ficha/${fichaId}${query}`);
      const data = await response.json();
      if (!response.ok || !data.data) return [];
      return data.data.map((item: any) => ({
        id: item.id,
        fecha: item.fecha,
        aprendizId: item.aprendizId,
        aprendizNombre: item.aprendiz ? `${item.aprendiz.firstName} ${item.aprendiz.lastName}` : 'Aprendiz',
        fichaCodigo: item.ficha?.codigo || fichaId,
        estado: item.estado,
        observacion: item.observacion,
      }));
    } catch {
      return [];
    }
  },

  async getMisAsistencias(): Promise<RegistroAsistencia[]> {
    try {
      const response = await authService.fetchWithAuth(`${API_BASE_URL}/asistencia/mis-asistencias`);
      const data = await response.json();
      if (!response.ok || !data.data) return [];
      return data.data.map((item: any) => ({
        id: item.id,
        fecha: item.fecha,
        aprendizId: item.aprendizId || '',
        aprendizNombre: 'Yo',
        fichaCodigo: item.ficha?.codigo || '',
        estado: item.estado,
        observacion: item.observacion,
      }));
    } catch {
      return [];
    }
  },

  async registrarAsistencia(payload: { fichaId?: string; fecha: string; asistencias: Array<{ aprendizId: string; estado: string; observacion?: string }> }) {
    const response = await authService.fetchWithAuth(`${API_BASE_URL}/asistencia/registrar`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al registrar asistencia');
    return data.data;
  }
};
