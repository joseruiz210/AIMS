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
}

export const INITIAL_EVIDENCIAS: EvidenciaItem[] = [
  {
    id: '1',
    titulo: 'Taller 2: Modelado Entidad-Relación y Normalización en 3FN',
    descripcion: 'Diseñar el diagrama relacional completo para el sistema académico. Aplicar las tres primeras formas normales y adjuntar el script DDL en PostgreSQL con las claves primarias y foráneas debidamente restringidas.',
    materia: 'Programación BD',
    instructor: 'Ana Martínez',
    fechaAsignacion: '28 Ago, 2026',
    fechaLimite: '05 Sept, 2026 • 11:59 PM',
    formatoEntrega: 'Documento PDF + Script SQL (.sql)',
    ponderacion: '25% del Trimestre',
    estado: 'Pendiente',
  },
  {
    id: '2',
    titulo: 'Proyecto Fase 2: Implementación de Patrones Creacionales en Java',
    descripcion: 'Construir un módulo funcional utilizando Factory Method y Singleton para la gestión de conexiones y logs del sistema. Debe incluir pruebas unitarias con JUnit y cobertura mínima del 80%.',
    materia: 'POO',
    instructor: 'Carmen López',
    fechaAsignacion: '20 Ago, 2026',
    fechaLimite: '08 Sept, 2026 • 11:59 PM',
    formatoEntrega: 'Repositorio GitHub / Archivo ZIP',
    ponderacion: '30% del Trimestre',
    estado: 'Pendiente',
  },
  {
    id: '3',
    titulo: 'Documento de Especificación de Requisitos de Software (SRS)',
    descripcion: 'Elaborar el documento IEEE 830 con los casos de uso detallados, diagramas de secuencia y matrices de trazabilidad para los módulos de autenticación y matrícula.',
    materia: 'Requisitos',
    instructor: 'Juan Pérez',
    fechaAsignacion: '15 Ago, 2026',
    fechaLimite: '30 Ago, 2026 • 11:59 PM',
    formatoEntrega: 'Documento PDF formal',
    ponderacion: '20% del Trimestre',
    estado: 'Calificada',
    entrega: {
      id: 'e-1',
      archivoUrl: 'https://drive.google.com/file/d/srs-document-v2.pdf',
      comentario: 'Profesor Juan, adjunto la versión final con las correcciones de casos de uso sugeridas en la sesión anterior.',
      fechaEntrega: '29 Ago, 2026',
      nota: 4.6,
      feedback: 'Excelente trabajo en la matriz de trazabilidad y diagramas de casos de uso. Muy buena presentación técnica.',
    },
  },
  {
    id: '4',
    titulo: 'Laboratorio 3: Pipeline de Limpieza y Transformación en Python',
    descripcion: 'Procesar el dataset de inasistencias académicas utilizando Pandas y NumPy. Tratar valores nulos, eliminar duplicados y exportar el dataset limpio en formato Parquet.',
    materia: 'Analisis de Datos',
    instructor: 'Roberto Vargas',
    fechaAsignacion: '18 Ago, 2026',
    fechaLimite: '02 Sept, 2026 • 06:00 PM',
    formatoEntrega: 'Jupyter Notebook (.ipynb)',
    ponderacion: '25% del Trimestre',
    estado: 'Entregada',
    entrega: {
      id: 'e-2',
      archivoUrl: 'https://github.com/usuario/data-cleaning-lab3',
      comentario: 'Envío el notebook con todas las transformaciones explicadas celda por celda.',
      fechaEntrega: '01 Sept, 2026',
    },
  },
];

export const evidenciasService = {
  async getMisEvidencias(): Promise<EvidenciaItem[]> {
    try {
      const response = await authService.fetchWithAuth(`${API_BASE_URL}/evidencias`);
      const data = await response.json();
      if (!response.ok || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
        return INITIAL_EVIDENCIAS;
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
          materia: item.ficha?.programa?.nombre || 'Formación Técnica',
          instructor: item.instructor ? `${item.instructor.firstName} ${item.instructor.lastName}` : 'Instructor',
          fechaAsignacion: item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-CO') : 'Reciente',
          fechaLimite: limit ? limit.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Sin fecha límite',
          formatoEntrega: 'Enlace / Archivo Digital',
          estado,
          entrega: entrega
            ? {
                id: entrega.id,
                archivoUrl: entrega.archivoUrl,
                comentario: entrega.comentario,
                fechaEntrega: entrega.fechaEntrega ? new Date(entrega.fechaEntrega).toLocaleDateString('es-CO') : '',
                nota: entrega.nota,
              }
            : undefined,
        };
      });
    } catch {
      return INITIAL_EVIDENCIAS;
    }
  },

  async entregarEvidencia(evidenciaId: string, payload: { archivoUrl?: string; comentario?: string }) {
    try {
      const response = await authService.fetchWithAuth(`${API_BASE_URL}/evidencias/${evidenciaId}/entregas`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      return data;
    } catch {
      // Simulación en modo desarrollo
      return { success: true, message: 'Entrega registrada exitosamente' };
    }
  },
};
