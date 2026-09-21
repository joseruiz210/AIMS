import { authService } from './authService';
import { getApiBaseUrl } from './api';

const API_BASE_URL = getApiBaseUrl();

export interface RegistroAsistencia {
  id: string;
  sesionId: string;
  fecha: string;
  tema?: string;
  aprendizId: string;
  aprendizNombre: string;
  fichaCodigo: string;
  estado: 'PRESENTE' | 'AUSENTE' | 'EXCUSA' | 'EXCUSADO';
  observacion?: string;
}

export interface RegistrarAsistenciaResult {
  sesionId: string;
  tema: string;
  registros: any[];
}

// service de asistencia
export const asistenciaService = {
  async getAsistenciasByFicha(fichaId: string, fecha?: string): Promise<RegistroAsistencia[]> {
    const query = fecha ? `?fecha=${encodeURIComponent(fecha)}` : '';
    const response = await authService.fetchWithAuth(`${API_BASE_URL}/asistencia/ficha/${fichaId}${query}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al consultar la asistencia');
    }
    if (!Array.isArray(data.data)) {
      throw new Error('La respuesta de asistencia no tiene un formato válido');
    }
    return data.data.map((item: any) => ({
      id: item.id,
      sesionId: item.sesionId,
      fecha: item.fecha,
      tema: item.tema,
      aprendizId: item.aprendizId,
      aprendizNombre: item.aprendiz ? `${item.aprendiz.firstName} ${item.aprendiz.lastName}` : 'Aprendiz',
      fichaCodigo: item.ficha?.codigo || fichaId,
      estado: item.estado,
      observacion: item.observacion,
    }));
  },

  async getMisAsistencias(): Promise<RegistroAsistencia[]> {
    try {
      const response = await authService.fetchWithAuth(`${API_BASE_URL}/asistencia/mis-asistencias`);
      const data = await response.json();
      if (!response.ok || !data.data) return [];
      return data.data.map((item: any) => ({
        id: item.id,
        sesionId: item.sesionId || '',
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

  async registrarAsistencia(payload: {
    fichaId: string;
    fecha: string;
    tema?: string;
    asistencias: Array<{ aprendizId: string; estado: string; observacion?: string }>;
  }): Promise<RegistrarAsistenciaResult> {
    const response = await authService.fetchWithAuth(`${API_BASE_URL}/asistencia/registrar`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al registrar asistencia');
    return data.data;
  },
};