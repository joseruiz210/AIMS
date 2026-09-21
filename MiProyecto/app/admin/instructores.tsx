import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fichasService } from '../../services/fichasService';

const NAVY = '#12103C';
const GOLD = '#cfa235';

export interface InstructorItem {
  id: string;
  initials: string;
  nombre: string;
  especialidad: string;
  email: string;
  status: 'Activo' | 'Inactivo';
  fichasCount: number;
  aprendicesCount: number;
}

export default function InstructoresScreen() {
  const [search, setSearch] = useState('');
  const [instructores, setInstructores] = useState<InstructorItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadInstructores() {
    setLoading(true);
    try {
      const data = await fichasService.getInstructores();
      const mapped = data.map((item: any) => {
        const fullName = `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.email || 'Instructor SENA';
        const parts = fullName.split(' ');
        const initials = ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'INS';

        return {
          id: item.id,
          initials,
          nombre: fullName,
          especialidad: item.especialidad || 'Formación Técnica SENA',
          email: item.email,
          status: (item.isActive !== false ? 'Activo' : 'Inactivo') as 'Activo' | 'Inactivo',
          fichasCount: item._count?.instructorFichas ?? (item.instructorFichas?.length || 0),
          aprendicesCount: item.aprendicesCount || 0,
        };
      });
      setInstructores(mapped);
    } catch (error) {
      console.error('Error al cargar instructores:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInstructores();
  }, []);

  const filteredInstructores = instructores.filter(
    (ins) =>
      ins.nombre.toLowerCase().includes(search.toLowerCase()) ||
      ins.especialidad.toLowerCase().includes(search.toLowerCase()) ||
      ins.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalFichasAsignadas = instructores.reduce((acc, i) => acc + i.fichasCount, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.pageTitle}>Instructores</Text>
          <Text style={styles.pageSubtitle}>Directorio de instructores registrados en la base de datos</Text>
        </View>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>INSTRUCTORES REGISTRADOS</Text>
          <Text style={styles.metricValueGold}>{loading ? '-' : instructores.length}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>FICHAS ASIGNADAS</Text>
          <Text style={styles.metricValueDark}>{loading ? '-' : totalFichasAsignadas}</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={20} color="#64748B" style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar instructor por nombre, especialidad o correo..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Instructors List */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={GOLD} />
          <Text style={styles.loadingText}>Cargando instructores desde la base de datos...</Text>
        </View>
      ) : filteredInstructores.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={54} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No hay instructores registrados</Text>
          <Text style={styles.emptySubtitle}>
            Actualmente no hay usuarios con rol de Instructor en la base de datos.
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {filteredInstructores.map((ins) => (
            <View key={ins.id} style={styles.instructorCard}>
              <View style={styles.cardLeft}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{ins.initials}</Text>
                </View>

                <View style={styles.infoGroup}>
                  <View style={styles.nameRow}>
                    <Text style={styles.instructorName}>{ins.nombre}</Text>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>{ins.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.especialidadText}>{ins.especialidad}</Text>
                  <Text style={styles.emailText}>{ins.email}</Text>

                  <View style={styles.countersRow}>
                    <View style={styles.counterItem}>
                      <Text style={styles.counterNum}>{ins.fichasCount}</Text>
                      <Text style={styles.counterLabel}>
                        {ins.fichasCount === 1 ? 'ficha asignada' : 'fichas asignadas'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: NAVY,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 22,
  },
  metricCard: {
    flex: 1,
    minWidth: 130,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    letterSpacing: 0.8,
    marginBottom: 6,
    textAlign: 'center',
  },
  metricValueGold: {
    fontSize: 24,
    fontWeight: '800',
    color: GOLD,
  },
  metricValueDark: {
    fontSize: 24,
    fontWeight: '800',
    color: NAVY,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: NAVY,
  },
  centerLoading: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: NAVY,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
  },
  listContainer: {
    gap: 16,
  },
  instructorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  },
  infoGroup: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  instructorName: {
    fontSize: 17,
    fontWeight: '700',
    color: NAVY,
  },
  statusBadge: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  especialidadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginTop: 4,
  },
  emailText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  countersRow: {
    flexDirection: 'row',
    gap: 28,
    marginTop: 14,
  },
  counterItem: {
    alignItems: 'flex-start',
  },
  counterNum: {
    fontSize: 15,
    fontWeight: '700',
    color: NAVY,
  },
  counterLabel: {
    fontSize: 12,
    color: '#64748B',
  },
});
