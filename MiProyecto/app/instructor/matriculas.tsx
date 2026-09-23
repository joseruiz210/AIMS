import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  useWindowDimensions,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ActionModal from '../../components/ActionModal';
import { fichasService } from '../../services/fichasService';

const NAVY = '#0F1026';
const GOLD = '#D4AF37';

interface MatriculaRow {
  id: string;
  aprendiz: string;
  ficha: string;
  programa: string;
  fechaMatricula: string;
  estado: 'Activo' | 'Pendiente' | 'Retirado' | 'Critico';
}

const INITIAL_MATRICULAS: MatriculaRow[] = [
  { id: '1', aprendiz: 'Valentina Torres', ficha: '2845671', programa: 'ADSO', fechaMatricula: '2024-02-05', estado: 'Activo' },
  { id: '2', aprendiz: 'Carlos Mendoza', ficha: '2845671', programa: 'ADSO', fechaMatricula: '2024-02-05', estado: 'Activo' },
  { id: '3', aprendiz: 'Laura Jiménez', ficha: '2845671', programa: 'ADSO', fechaMatricula: '2024-02-12', estado: 'Critico' },
  { id: '4', aprendiz: 'Sofía Herrera', ficha: '2845671', programa: 'ADSO', fechaMatricula: '2024-01-20', estado: 'Activo' },
  { id: '5', aprendiz: 'Andrés Reyes', ficha: '2845680', programa: 'AE', fechaMatricula: '2024-02-01', estado: 'Retirado' },
  { id: '6', aprendiz: 'Felipe Gómez', ficha: '2845690', programa: 'CF', fechaMatricula: '2024-02-15', estado: 'Pendiente' },
];

export default function MatriculasInstructorScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Activo' | 'Pendiente' | 'Retirado'>('Todos');
  const [matriculas, setMatriculas] = useState<MatriculaRow[]>(INITIAL_MATRICULAS);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const fichas = await fichasService.getFichas();
      if (fichas && fichas.length > 0) {
        const loadedMatriculas: MatriculaRow[] = [];
        for (const ficha of fichas.slice(0, 3)) {
          const detail = await fichasService.getFichaById(ficha.id);
          if (detail && detail.matriculas && detail.matriculas.length > 0) {
            for (const m of detail.matriculas) {
              const apr = m.aprendiz || {};
              const nombre = `${apr.firstName || ''} ${apr.lastName || ''}`.trim() || 'Aprendiz';
              loadedMatriculas.push({
                id: m.id || String(Math.random()),
                aprendiz: nombre,
                ficha: ficha.numero || ficha.codigo || 'SENA',
                programa: ficha.programaNombre || 'ADSO',
                fechaMatricula: m.createdAt ? m.createdAt.split('T')[0] : '2026-02-01',
                estado: (m.estado as any) || 'Activo',
              });
            }
          }
        }
        if (loadedMatriculas.length > 0) {
          setMatriculas(loadedMatriculas);
        }
      }
    } catch (err) {
      console.error('Error cargando matrículas de instructor:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const activosCount = matriculas.filter(m => m.estado === 'Activo' || m.estado === 'Critico').length;
  const pendientesCount = matriculas.filter(m => m.estado === 'Pendiente').length;
  const retiradosCount = matriculas.filter(m => m.estado === 'Retirado').length;

  const handleCreateMatricula = (values: Record<string, string>) => {
    const aprendiz = values['Nombre del Aprendiz']?.trim() || 'Nuevo Aprendiz';
    const ficha = values['Número de Ficha']?.trim() || '2845671';
    const programa = values['Programa de Formación']?.trim() || 'ADSO';
    const fecha = values['Fecha de Registro']?.trim() || new Date().toISOString().split('T')[0];

    const newMatricula: MatriculaRow = {
      id: String(Date.now()),
      aprendiz,
      ficha,
      programa,
      fechaMatricula: fecha,
      estado: 'Activo',
    };

    setMatriculas(prev => [newMatricula, ...prev]);
  };

  const filteredMatriculas = matriculas.filter((m) => {
    const matchesSearch =
      m.aprendiz.toLowerCase().includes(search.toLowerCase()) ||
      m.ficha.includes(search) ||
      m.programa.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'Todos' ||
      (statusFilter === 'Activo' && (m.estado === 'Activo' || m.estado === 'Critico')) ||
      m.estado === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, !isDesktop && { padding: 16 }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={GOLD}
          colors={[GOLD, NAVY]}
        />
      }
    >
      {/* Top Header */}
      <View style={[styles.topHeader, !isDesktop && styles.topHeaderMobile]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>Matrículas de Aprendices</Text>
          <Text style={styles.pageSubtitle}>Registro y seguimiento de matrículas en tus fichas asignadas</Text>
        </View>
        <Pressable
          style={({ hovered }: any) => [styles.newBtn, hovered && styles.newBtnHover]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.newBtnText}>+ Nueva Matrícula</Text>
        </Pressable>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>ACTIVOS</Text>
          <Text style={styles.metricValueGold}>{activosCount}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>PENDIENTES</Text>
          <Text style={styles.metricValueDark}>{pendientesCount}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>RETIRADOS</Text>
          <Text style={styles.metricValueGold}>{retiradosCount}</Text>
        </View>
      </View>

      {/* Main Table / Container Box */}
      <View style={styles.tableBox}>
        {/* Search & Filter Bar */}
        <View style={[styles.filterRow, !isDesktop && { flexDirection: 'column', alignItems: 'stretch' }]}>
          <View style={styles.searchWrapper}>
            <Ionicons name="search-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar aprendiz o ficha..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* Filter Pills */}
          <View style={styles.filterPillsGroup}>
            {(['Todos', 'Activo', 'Pendiente', 'Retirado'] as const).map((st) => (
              <Pressable
                key={st}
                onPress={() => setStatusFilter(st)}
                style={[
                  styles.filterPill,
                  statusFilter === st && styles.filterPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    statusFilter === st && styles.filterPillTextActive,
                  ]}
                >
                  {st}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Scrollable Table Area */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ minWidth: 600 }}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.thText, { flex: 2 }]}>APRENDIZ</Text>
              <Text style={[styles.thText, { flex: 1 }]}>FICHA</Text>
              <Text style={[styles.thText, { flex: 1 }]}>PROGRAMA</Text>
              <Text style={[styles.thText, { flex: 1.5 }]}>FECHA MATRÍCULA</Text>
              <Text style={[styles.thText, { flex: 1, textAlign: 'right' }]}>ESTADO</Text>
            </View>

            {/* Table Body */}
            {filteredMatriculas.map((row, idx) => (
              <View
                key={row.id}
                style={[
                  styles.tableRow,
                  idx % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                ]}
              >
                <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.avatarMini}>
                    <Text style={styles.avatarMiniText}>
                      {row.aprendiz.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </Text>
                  </View>
                  <Text style={styles.tdTextBold}>{row.aprendiz}</Text>
                </View>

                <Text style={[styles.tdText, { flex: 1 }]}>{row.ficha}</Text>
                <Text style={[styles.tdText, { flex: 1 }]}>{row.programa}</Text>
                <Text style={[styles.tdText, { flex: 1.5 }]}>{row.fechaMatricula}</Text>

                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <View
                    style={[
                      styles.tagBadge,
                      row.estado === 'Activo'
                        ? styles.tagActivo
                        : row.estado === 'Pendiente'
                        ? styles.tagPendiente
                        : row.estado === 'Retirado'
                        ? styles.tagRetirado
                        : styles.tagCritico,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        row.estado === 'Activo'
                          ? styles.tagTextActivo
                          : row.estado === 'Pendiente'
                          ? styles.tagTextPendiente
                          : row.estado === 'Retirado'
                          ? styles.tagTextRetirado
                          : styles.tagTextCritico,
                      ]}
                    >
                      {row.estado}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <ActionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Crear Nueva Matrícula"
        subtitle="Registro Académico del Aprendiz"
        iconName="document-text-outline"
        confirmText="Registrar Matrícula"
        onSubmit={handleCreateMatricula}
        fields={[
          { label: 'Nombre del Aprendiz', placeholder: 'Ej: Valentina Torres' },
          { label: 'Número de Ficha', placeholder: 'Ej: 2845671' },
          { label: 'Programa de Formación', placeholder: 'Ej: ADSO' },
          { label: 'Fecha de Registro', placeholder: 'Ej: 2026-08-26' },
        ]}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    flexWrap: 'wrap',
    gap: 12,
  },
  topHeaderMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: NAVY,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GOLD,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
  },
  newBtnHover: {
    backgroundColor: '#b88d2a',
  },
  newBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  metricValueGold: {
    fontSize: 28,
    fontWeight: '800',
    color: GOLD,
    marginTop: 6,
  },
  metricValueDark: {
    fontSize: 28,
    fontWeight: '800',
    color: NAVY,
    marginTop: 6,
  },
  tableBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
    flexWrap: 'wrap',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flex: 1,
    minWidth: 200,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: NAVY,
    padding: 0,
  },
  filterPillsGroup: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
  },
  filterPillActive: {
    backgroundColor: NAVY,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  thText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tableRowEven: {
    backgroundColor: '#FFFFFF',
  },
  tableRowOdd: {
    backgroundColor: '#FAFCFF',
  },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarMiniText: {
    fontSize: 11,
    fontWeight: '700',
    color: GOLD,
  },
  tdText: {
    fontSize: 13,
    color: '#475569',
  },
  tdTextBold: {
    fontSize: 13,
    fontWeight: '700',
    color: NAVY,
  },
  tagBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  tagActivo: { backgroundColor: '#DCFCE7' },
  tagPendiente: { backgroundColor: '#FEF3C7' },
  tagRetirado: { backgroundColor: '#F1F5F9' },
  tagCritico: { backgroundColor: '#FEE2E2' },
  tagText: { fontSize: 11, fontWeight: '700' },
  tagTextActivo: { color: '#15803D' },
  tagTextPendiente: { color: '#B45309' },
  tagTextRetirado: { color: '#64748B' },
  tagTextCritico: { color: '#B91C1C' },
});
