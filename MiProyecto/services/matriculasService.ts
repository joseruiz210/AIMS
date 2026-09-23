import { authService } from './authService';
import { getApiBaseUrl } from './api';

const API_BASE_URL = getApiBaseUrl();

export interface MatriculaItem {
  id: string;
  aprendiz: string;
  aprendizId: string;
  email: string;
  ficha: string;
  fichaId: string;
  programa: string;
  fechaMatricula: string;
  estado: 'Activo' | 'Pendiente' | 'Retirado' | 'Critico';
}

export interface MatriculasResult {
  matriculas: MatriculaItem[];
  total: number;
  page: number;
  totalPages: number;
}

export const matriculasService = {
  async getMatriculas(params: {
    page?: number;
    limit?: number;
    search?: string;
    estado?: string;
    fichaId?: string;
  } = {}): Promise<MatriculasResult> {
    try {
      const query = new URLSearchParams();
      if (params.page) query.append('page', String(params.page));
      if (params.limit) query.append('limit', String(params.limit));
      if (params.search) query.append('search', params.search);
      if (params.estado) query.append('estado', params.estado);
      if (params.fichaId) query.append('fichaId', params.fichaId);

      const response = await authService.fetchWithAuth(
        `${API_BASE_URL}/matriculas?${query.toString()}`
      );
      const data = await response.json();

      if (!response.ok || !data.data) {
        return { matriculas: [], total: 0, page: 1, totalPages: 0 };
      }

      const list = data.data.matriculas || data.data || [];
      const rawMatriculas: MatriculaItem[] = list.map((m: any) => ({
        id: m.id,
        aprendiz: m.aprendiz || '',
        aprendizId: m.aprendizId || '',
        email: m.email || '',
        ficha: m.ficha || '',
        fichaId: m.fichaId || '',
        programa: m.programa || '',
        fechaMatricula: m.fechaMatricula || '',
        estado: m.estado || 'Activo',
      }));

      return {
        matriculas: rawMatriculas,
        total: data.data.pagination?.total || rawMatriculas.length,
        page: data.data.pagination?.page || 1,
        totalPages: data.data.pagination?.totalPages || 1,
      };
    } catch {
      return { matriculas: [], total: 0, page: 1, totalPages: 0 };
    }
  },

  async createMatricula(payload: {
    fichaId: string;
    aprendizId: string;
    fechaMatricula?: string;
    estado?: string;
  }) {
    const response = await authService.fetchWithAuth(`${API_BASE_URL}/matriculas`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al crear matrícula');
    return data.data;
  },
};
