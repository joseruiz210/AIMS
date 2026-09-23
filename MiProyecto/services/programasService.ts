import { authService } from './authService';
import { getApiBaseUrl } from './api';
import { getStorageItem, setStorageItem } from '../utils/storage';

export interface Programa {
  id: string;
  codigo: string;
  nombre: string;
  nivel: string;
  duracionMeses: number;
  fichasActivasCount?: number;
  estado?: 'Activo' | 'Inactivo';
}

const CUSTOM_PROGRAMAS_STORAGE_KEY = 'aims_custom_programas_list';

const DEFAULT_PROGRAMAS: Programa[] = [
  {
    id: '1',
    codigo: 'ADSO',
    nombre: 'Análisis y Desarrollo de Software',
    nivel: 'Tecnólogo',
    duracionMeses: 24,
    fichasActivasCount: 8,
    estado: 'Activo',
  },
  {
    id: '2',
    codigo: 'DG',
    nombre: 'Diseño Gráfico',
    nivel: 'Técnico',
    duracionMeses: 18,
    fichasActivasCount: 4,
    estado: 'Activo',
  },
  {
    id: '3',
    codigo: 'AE',
    nombre: 'Administración de Empresas',
    nivel: 'Tecnólogo',
    duracionMeses: 24,
    fichasActivasCount: 6,
    estado: 'Activo',
  },
  {
    id: '4',
    codigo: 'CF',
    nombre: 'Contabilidad y Finanzas',
    nivel: 'Tecnólogo',
    duracionMeses: 24,
    fichasActivasCount: 5,
    estado: 'Activo',
  },
  {
    id: '5',
    codigo: 'MRK',
    nombre: 'Mercadeo Digital',
    nivel: 'Técnico',
    duracionMeses: 12,
    fichasActivasCount: 3,
    estado: 'Activo',
  },
];

async function getStoredCustomProgramas(): Promise<Programa[]> {
  try {
    const raw = await getStorageItem(CUSTOM_PROGRAMAS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('[programasService] Error al leer programas locales:', error);
    return [];
  }
}

async function saveStoredCustomProgramas(list: Programa[]): Promise<void> {
  try {
    await setStorageItem(CUSTOM_PROGRAMAS_STORAGE_KEY, JSON.stringify(list));
  } catch (error) {
    console.warn('[programasService] Error al guardar programas locales:', error);
  }
}

export const programasService = {
  async getProgramas(params: { search?: string } = {}): Promise<Programa[]> {
    const customList = await getStoredCustomProgramas();
    let apiList: Programa[] = [];

    try {
      const baseUrl = getApiBaseUrl();
      const query = params.search ? `?search=${encodeURIComponent(params.search)}` : '';
      const response = await authService.fetchWithAuth(`${baseUrl}/programas${query}`);
      const data = await response.json();

      if (response.ok && Array.isArray(data.data) && data.data.length > 0) {
        apiList = data.data.map((item: any) => ({
          id: item.id || `prg_${item.codigo}`,
          codigo: item.codigo || 'PRG-01',
          nombre: item.nombre,
          nivel: item.nivel || 'Tecnólogo',
          duracionMeses: item.duracionMeses || 24,
          fichasActivasCount: item._count?.fichas || item.fichasActivasCount || 0,
          estado: item.estado || 'Activo',
        }));
      }
    } catch {
      // Backend no disponible o no autenticado
    }

    // Base de programas (de API o por defecto)
    const baseList = apiList.length > 0 ? apiList : DEFAULT_PROGRAMAS;

    // Fusión inteligente de programas: primero los personalizados creados por el usuario, luego los de la base
    const seenIds = new Set<string>();
    const seenCodes = new Set<string>();
    const merged: Programa[] = [];

    // Prioridad 1: Programas creados localmente
    for (const p of customList) {
      const normCode = (p.codigo || '').trim().toUpperCase();
      if (!seenIds.has(p.id) && (!normCode || !seenCodes.has(normCode))) {
        seenIds.add(p.id);
        if (normCode) seenCodes.add(normCode);
        merged.push(p);
      }
    }

    // Prioridad 2: Programas del backend o predeterminados
    for (const p of baseList) {
      const normCode = (p.codigo || '').trim().toUpperCase();
      if (!seenIds.has(p.id) && (!normCode || !seenCodes.has(normCode))) {
        seenIds.add(p.id);
        if (normCode) seenCodes.add(normCode);
        merged.push(p);
      }
    }

    if (params.search && params.search.trim()) {
      const s = params.search.trim().toLowerCase();
      return merged.filter(
        p => p.nombre.toLowerCase().includes(s) || p.codigo.toLowerCase().includes(s)
      );
    }

    return merged;
  },

  async createPrograma(programaData: Omit<Programa, 'id'>): Promise<Programa> {
    const id = `prg_custom_${Date.now()}`;
    const newProg: Programa = {
      id,
      codigo: programaData.codigo || `PRG-${Math.floor(Math.random() * 1000)}`,
      nombre: programaData.nombre,
      nivel: programaData.nivel || 'Tecnólogo',
      duracionMeses: programaData.duracionMeses || 24,
      fichasActivasCount: programaData.fichasActivasCount || 1,
      estado: programaData.estado || 'Activo',
    };

    // 1. Guardar de inmediato en almacenamiento local persistente
    const customList = await getStoredCustomProgramas();
    const updatedCustom = [newProg, ...customList.filter(p => p.codigo !== newProg.codigo)];
    await saveStoredCustomProgramas(updatedCustom);

    // 2. Intentar registrar en el backend remoto si está accesible
    try {
      const baseUrl = getApiBaseUrl();
      const response = await authService.fetchWithAuth(`${baseUrl}/programas`, {
        method: 'POST',
        body: JSON.stringify(programaData),
      });
      const data = await response.json();
      if (response.ok && data.data) {
        // Actualizar id remoto si el backend lo asignó
        const remoteProg: Programa = {
          ...newProg,
          id: data.data.id || newProg.id,
        };
        const syncedList = updatedCustom.map(p => (p.id === id ? remoteProg : p));
        await saveStoredCustomProgramas(syncedList);
        return remoteProg;
      }
    } catch {
      // Si el backend falla, newProg ya está 100% persistido en almacenamiento local
    }

    return newProg;
  },

  async updatePrograma(id: string, programaData: Partial<Programa>) {
    // Actualizar localmente
    const customList = await getStoredCustomProgramas();
    const updatedCustom = customList.map(p => (p.id === id ? { ...p, ...programaData } : p));
    await saveStoredCustomProgramas(updatedCustom);

    // Actualizar remotamente
    try {
      const baseUrl = getApiBaseUrl();
      const response = await authService.fetchWithAuth(`${baseUrl}/programas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(programaData),
      });
      const data = await response.json();
      if (response.ok) return data.data;
    } catch {
      // Backend fallback
    }

    return programaData;
  },

  async deletePrograma(id: string) {
    // Eliminar localmente
    const customList = await getStoredCustomProgramas();
    const updatedCustom = customList.filter(p => p.id !== id);
    await saveStoredCustomProgramas(updatedCustom);

    // Eliminar remotamente
    try {
      const baseUrl = getApiBaseUrl();
      const response = await authService.fetchWithAuth(`${baseUrl}/programas/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch {
      return true;
    }
  },
};
