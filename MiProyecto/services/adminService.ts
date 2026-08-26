import { authService } from './authService';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'INSTRUCTOR' | 'APRENDIZ';
  isActive: boolean;
}

export interface UsersListResult {
  users: AdminUser[];
  total: number;
}

export const adminService = {
  /**
   * Listar usuarios con filtros (rol, búsqueda) - solo ADMIN
   */
  async getUsers(params: { role?: string; search?: string; limit?: number } = {}): Promise<UsersListResult> {
    const query = new URLSearchParams();
    if (params.role) query.append('role', params.role);
    if (params.search) query.append('search', params.search);
    query.append('limit', String(params.limit ?? 50));

    const response = await authService.fetchWithAuth(`${API_BASE_URL}/users?${query.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener usuarios');
    }

    return { users: data.data, total: data.pagination.total };
  },

  /**
   * Obtener solo el conteo de usuarios por rol (para stat cards)
   */
  async countByRole(role: 'ADMIN' | 'INSTRUCTOR' | 'APRENDIZ'): Promise<number> {
    const query = new URLSearchParams({ role, limit: '1' });
    const response = await authService.fetchWithAuth(`${API_BASE_URL}/users?${query.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al contar usuarios');
    }

    return data.pagination.total;
  },
};