import { authService } from './authService';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export interface Entrega {
  id: string;
  archivoUrl?: string;
  comentario?: string;
  fechaEntrega: string;
  nota?: number;
  feedback?: string;
}

export interface EvidenciaItem {
  id: string;
  titulo: string;
  descripcion: string;
  materia: string;
  instructor: string;
  fechaAsignacion: string;
  fechaLimite: string;
  formatoEntrega: string;
  ponderacion?: string;
  estado: 'Pendiente' | 'Entregada' | 'Calificada' | 'Vencida';
  entrega?: Entrega;
  entregasCount?: number;
}

export const evidenciasService = {
  async getMisEvidencias(): Promise<EvidenciaItem[]> {
    try {
      const response = await authService.fetchWithAuth(`${API_BASE_URL}/evidencias`);
      const data = await response.json();
      if (!response.ok || !data.data || !Array.isArray(data.data)) {
        return [];
      }

      return data.data.map((item: any) => {
        const entrega = item.entregas && item.entregas.length > 0 ? item.entregas[0] : null;
        const now = new Date();
        const limit = item.fechaLimite ? new Date(item.fechaLimite) : null;
        let estado: EvidenciaItem['estado'] = 'Pendiente';

        if (entrega) {
          estado = entrega.nota !== undefined && entrega.nota !== null ? 'Calificada' : 'Entregada';
        } else if (limit && limit < now) {
          estado = 'Vencida';
        }

        return {
          id: item.id,
          titulo: item.titulo,
          descripcion: item.descripcion || '',
          materia: item.ficha?.programa?.nombre || 'Formación Técnica ADSO',
          instructor: item.instructor ? `${item.instructor.firstName} ${item.instructor.lastName}` : 'Instructor SENA',
          fechaAsignacion: item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-CO') : 'Reciente',
          fechaLimite: limit
            ? limit.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
            : 'Sin fecha límite',
          formatoEntrega: 'Enlace / Archivo Digital',
          estado,
          entrega: entrega
            ? {
                id: entrega.id,
                archivoUrl: entrega.archivoUrl,
                comentario: entrega.comentario,
                fechaEntrega: entrega.fechaEntrega ? new Date(entrega.fechaEntrega).toLocaleDateString('es-CO') : 'Hoy',
                nota: entrega.nota !== undefined && entrega.nota !== null ? Number(entrega.nota) : undefined,
                feedback: entrega.comentario || undefined,
              }
            : undefined,
        };
      });
    } catch {
      return [];
    }
  },

  async entregarEvidencia(evidenciaId: string, payload: { archivoUrl?: string; comentario?: string }) {
    const response = await authService.fetchWithAuth(`${API_BASE_URL}/evidencias/${evidenciaId}/entregas`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al registrar la entrega en la base de datos');
    }
    return data;
  },

  /**
   * Obtiene la lista de evidencias creadas por el instructor
   */
  async getEvidenciasInstructor(fichaId?: string): Promise<EvidenciaItem[]> {
    try {
      const query = fichaId ? `?fichaId=${fichaId}` : '';
      const response = await authService.fetchWithAuth(`${API_BASE_URL}/evidencias${query}`);
      const data = await response.json();
      if (!response.ok || !data.data || !Array.isArray(data.data)) {
        return [];
      }
      return data.data.map((item: any) => ({
        id: item.id,
        titulo: item.titulo,
        descripcion: item.descripcion || '',
        materia: item.ficha?.programa?.nombre || 'ADSO - SENA',
        instructor: item.instructor ? `${item.instructor.firstName} ${item.instructor.lastName}` : 'Mi Usuario',
        fechaAsignacion: item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-CO') : 'Reciente',
        fechaLimite: item.fechaLimite
          ? new Date(item.fechaLimite).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
          : 'Sin fecha límite',
        formatoEntrega: 'Enlace / Archivo Digital',
        ponderacion: '25% del Trimestre',
        estado: 'Pendiente',
        entregasCount: item._count?.entregas || (item.entregas ? item.entregas.length : 0),
      }));
    } catch {
      return [];
    }
  },

  /**
   * Crea una nueva evidencia / actividad asignada a una ficha
   */
  async crearEvidencia(payload: {
    titulo: string;
    descripcion: string;
    fechaLimite: string;
    fichaId: string;
    ponderacion?: string;
    formatoEntrega?: string;
  }) {
    const response = await authService.fetchWithAuth(`${API_BASE_URL}/evidencias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: payload.titulo,
        descripcion: payload.descripcion,
        fechaLimite: payload.fechaLimite,
        fichaId: payload.fichaId,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al crear la evidencia en la base de datos');
    }
    return data;
  },

  /**
   * Elimina una evidencia académica
   */
  async eliminarEvidencia(id: string) {
    const response = await authService.fetchWithAuth(`${API_BASE_URL}/evidencias/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al eliminar la evidencia');
    }
    return data;
  },

  /**
   * Obtiene las entregas realizadas por los aprendices para una evidencia
   */
  async getEntregas(evidenciaId: string) {
    try {
      const response = await authService.fetchWithAuth(`${API_BASE_URL}/evidencias/${evidenciaId}/entregas`);
      const data = await response.json();
      return data?.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Solicita una propuesta de redacción y rúbrica para una nueva evidencia
   */
  async generarPropuestaIa(tema: string) {
    try {
      const response = await authService.fetchWithAuth(`${API_BASE_URL}/evidencias/generar-propuesta-ia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tema }),
      });
      const data = await response.json();
      if (response.ok && data?.data) {
        return data.data;
      }
      throw new Error('Sin respuesta');
    } catch {
      return {
        titulo: `Taller Práctico: ${tema}`,
        descripcion: `Diseñar, desarrollar y documentar la solución correspondiente al tema ${tema}. Se debe implementar una arquitectura limpia, manejo adecuado de excepciones, validaciones y pruebas de funcionamiento.`,
        criterios: 'Corrección y funcionalidad técnica (2.0), Documentación y arquitectura (1.5), Pruebas y presentación (1.5). Escala 0.0 a 5.0.',
        formatoSugerido: 'Repositorio GitHub + Script / Documento PDF',
      };
    }
  },
};
