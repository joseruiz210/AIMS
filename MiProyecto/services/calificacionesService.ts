import { authService } from './authService';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export interface Calificacion {
  id: string;
  actividad: string;
  moduloNombre?: string;
  aprendizId: string;
  aprendizNombre?: string;
  nota: number;
  esAprobado: boolean;
  comentario?: string;
  fecha: string;
}

export interface StudentGrade {
  id: string;
  name: string;
  nota: number;
  maxNota: number;
  hasRecord?: boolean;
}

export interface CompetenciaGroup {
  id: string;
  title: string;
  codigo?: string;
  overallNota: number;
  students: StudentGrade[];
}

export const calificacionesService = {
  async getMisCalificaciones(): Promise<Calificacion[]> {
    try {
      const response = await authService.fetchWithAuth(`${API_BASE_URL}/calificaciones/mis-calificaciones`);
      const data = await response.json();
      if (!response.ok || !data.data) return [];
      const rawList = Array.isArray(data.data) ? data.data : (data.data.gradesData || []);
      return rawList.map((item: any, index: number) => {
        const nota = item.grade ?? item.valor ?? item.nota ?? 0;
        return {
          id: item.id || String(index + 1),
          actividad: item.subject || item.actividad || item.evaluacion || 'Evaluación',
          moduloNombre: item.subject || item.modulo?.nombre || 'Módulo Principal',
          aprendizId: item.aprendizId || '',
          nota,
          esAprobado: nota >= 3.5,
          comentario: item.comentario,
          fecha: item.createdAt || new Date().toISOString(),
        };
      });
    } catch {
      return [];
    }
  },

  async getCalificacionesByFicha(fichaId: string): Promise<CompetenciaGroup[]> {
    try {
      const response = await authService.fetchWithAuth(`${API_BASE_URL}/calificaciones/ficha/${fichaId}`);
      const data = await response.json();
      if (!response.ok || !data.data) return [];
      return data.data;
    } catch {
      return [];
    }
  },

  async registrarCalificacion(payload: { aprendizId: string; competenciaId?: string; moduloId?: string; actividad?: string; nota?: number; valor?: number; periodo?: string; comentario?: string }) {
    const response = await authService.fetchWithAuth(`${API_BASE_URL}/calificaciones`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al registrar calificación');
    return data.data;
  },

  async getAdminResumen(): Promise<any> {
    try {
      const response = await authService.fetchWithAuth(`${API_BASE_URL}/calificaciones/admin-resumen`);
      const data = await response.json();
      if (!response.ok || !data.data) return null;
      return data.data;
    } catch {
      return null;
    }
  },
};
