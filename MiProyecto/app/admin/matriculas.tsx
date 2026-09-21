import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ActionModal from '../../components/ActionModal';

const NAVY = '#12103C';
const GOLD = '#cfa235';

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

export default function MatriculasScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Activo' | 'Pendiente' | 'Retirado'>('Todos');
  const [matriculas] = useState<MatriculaRow[]>(INITIAL_MATRICULAS);
  const [modalVisible, setModalVisible] = useState(false);

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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Text style={styles.pageTitle}>Matriculas</Text>
        <Pressable 
          style={({ hovered }: any) => [styles.newBtn, hovered && styles.newBtnHover]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.newBtnText}>+ Nueva Matricula</Text>
        </Pressable>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>ACTIVOS</Text>
          <Text style={styles.metricValueGold}>5</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>PENDIENTES</Text>
          <Text style={styles.metricValueDark}>1</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>RETIRADOS</Text>
          <Text style={styles.metricValueGold}>1</Text>
        </View>
      </View>

      {/* Main Table / Container Box */}
      <View style={styles.tableBox}>
        {/* Search & Filter Bar */}
        <View style={styles.filterRow}>
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
              <Text style={[styles.thText, { flex: 1.5 }]}>FECHA MATRICULA</Text>
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
                      {row.aprendiz
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)}
                    </Text>
                  </View>
                  <Text style={styles.tdName}>{row.aprendiz}</Text>
                </View>

                <Text style={[styles.tdText, { flex: 1 }]}>{row.ficha}</Text>
                <Text style={[styles.tdText, { flex: 1, fontWeight: '600' }]}>{row.programa}</Text>
                <Text style={[styles.tdText, { flex: 1.5, color: '#64748B' }]}>{row.fechaMatricula}</Text>

                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <View
                    style={[
                      styles.statusTag,
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
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GOLD,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  newBtnHover: {
    backgroundColor: '#b88d2a',
  },
  newBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 22,
  },
  metricCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#E5E7EB',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    letterSpacing: 0.8,
    marginBottom: 6,
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
  tableBox: {
    backgroundColor: '#D9D9D9',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchWrapper: {
    flex: 1,
    minWidth: 240,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: NAVY,
  },
  filterPillsGroup: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterPill: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  filterPillActive: {
    backgroundColor: GOLD,
  },
  filterPillText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#C0C0C0',
  },
  thText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 2,
  },
  tableRowEven: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  tableRowOdd: {
    backgroundColor: 'transparent',
  },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarMiniText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  tdName: {
    fontSize: 14,
    fontWeight: '600',
    color: NAVY,
  },
  tdText: {
    fontSize: 14,
    color: '#334155',
  },
  statusTag: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  tagActivo: {
    backgroundColor: '#DEF7EC',
  },
  tagPendiente: {
    backgroundColor: '#FEF3C7',
  },
  tagRetirado: {
    backgroundColor: '#E5E7EB',
  },
  tagCritico: {
    backgroundColor: '#FDE8E8',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tagTextActivo: {
    color: '#03543F',
  },
  tagTextPendiente: {
    color: '#92400E',
  },
  tagTextRetirado: {
    color: '#374151',
  },
  tagTextCritico: {
    color: '#9B1C1C',
  },
});
