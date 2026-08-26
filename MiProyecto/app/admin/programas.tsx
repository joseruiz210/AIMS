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

const NAVY = '#12103C';
const GOLD = '#cfa235';
const GOLD_LIGHT = 'rgba(207, 162, 53, 0.12)';

interface ProgramItem {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  level: string;
  status: 'ACTIVO' | 'INACTIVO';
  fichas: number;
  aprendices: number;
  instructores: number;
  competencias: number;
  asistenciaPromedio: number;
  promedioNotas: number;
}

const INITIAL_PROGRAMAS: ProgramItem[] = [
  {
    id: '1',
    badge: 'ADSO',
    badgeColor: GOLD,
    title: 'Análisis y Desarrollo de Software',
    level: 'Tecnólogo - 24 meses',
    status: 'ACTIVO',
    fichas: 8,
    aprendices: 108,
    instructores: 12,
    competencias: 15,
    asistenciaPromedio: 91,
    promedioNotas: 4.1,
  },
  {
    id: '2',
    badge: 'DG',
    badgeColor: '#A855F7',
    title: 'Diseño Gráfico',
    level: 'Técnico - 18 meses',
    status: 'ACTIVO',
    fichas: 4,
    aprendices: 101,
    instructores: 6,
    competencias: 9,
    asistenciaPromedio: 93,
    promedioNotas: 4.3,
  },
  {
    id: '3',
    badge: 'AE',
    badgeColor: '#3B82F6',
    title: 'Administración de Empresas',
    level: 'Tecnólogo - 24 meses',
    status: 'ACTIVO',
    fichas: 6,
    aprendices: 180,
    instructores: 8,
    competencias: 14,
    asistenciaPromedio: 88,
    promedioNotas: 4.0,
  },
  {
    id: '4',
    badge: 'CF',
    badgeColor: '#10B981',
    title: 'Contabilidad y Finanzas',
    level: 'Tecnólogo - 24 meses',
    status: 'ACTIVO',
    fichas: 5,
    aprendices: 140,
    instructores: 7,
    competencias: 12,
    asistenciaPromedio: 89,
    promedioNotas: 4.2,
  },
  {
    id: '5',
    badge: 'MRK',
    badgeColor: '#EC4899',
    title: 'Mercadeo Digital',
    level: 'Técnico - 12 meses',
    status: 'ACTIVO',
    fichas: 3,
    aprendices: 60,
    instructores: 4,
    competencias: 8,
    asistenciaPromedio: 95,
    promedioNotas: 4.5,
  },
];

export default function ProgramasScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [search, setSearch] = useState('');
  const [programas] = useState<ProgramItem[]>(INITIAL_PROGRAMAS);

  const filteredProgramas = programas.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.badge.toLowerCase().includes(search.toLowerCase())
  );

  const totalProgramas = programas.length;
  const totalFichas = programas.reduce((acc, p) => acc + p.fichas, 0);
  const totalAprendices = programas.reduce((acc, p) => acc + p.aprendices, 0);
  const promedioGlobal = (
    programas.reduce((acc, p) => acc + p.promedioNotas, 0) / totalProgramas
  ).toFixed(1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top Action Bar */}
      <View style={styles.topHeader}>
        <Text style={styles.pageTitle}>Programas</Text>
        <Pressable style={({ hovered }: any) => [styles.newBtn, hovered && styles.newBtnHover]}>
          <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.newBtnText}>+ Nuevo programa</Text>
        </Pressable>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>PROGRAMAS</Text>
          <Text style={styles.metricValueGold}>{totalProgramas}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>FICHAS TOTALES</Text>
          <Text style={styles.metricValueDark}>{totalFichas}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>APRENDICES</Text>
          <Text style={styles.metricValueGold}>{totalAprendices}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>PROMEDIO GLOBAL</Text>
          <Text style={styles.metricValueDark}>{promedioGlobal}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={20} color="#64748B" style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar programa por nombre o código..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Program Cards List */}
      <View style={styles.listContainer}>
        {filteredProgramas.map((prog) => (
          <View key={prog.id} style={styles.programCard}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View style={styles.titleGroup}>
                <View style={[styles.badgePill, { backgroundColor: prog.badgeColor }]}>
                  <Text style={styles.badgeText}>{prog.badge}</Text>
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.programTitle}>{prog.title}</Text>
                  <Text style={styles.programLevel}>{prog.level}</Text>
                </View>
              </View>

              <View style={styles.statusBadgeActive}>
                <Text style={styles.statusTextActive}>{prog.status}</Text>
              </View>
            </View>

            {/* Micro Metrics Inside Card */}
            <View style={styles.cardMetricsGrid}>
              <View style={styles.cardMetricItem}>
                <Text style={styles.cardMetricValue}>{prog.fichas}</Text>
                <Text style={styles.cardMetricLabel}>Fichas</Text>
              </View>
              <View style={styles.cardMetricItem}>
                <Text style={styles.cardMetricValue}>{prog.aprendices}</Text>
                <Text style={styles.cardMetricLabel}>Aprendices</Text>
              </View>
              <View style={styles.cardMetricItem}>
                <Text style={styles.cardMetricValue}>{prog.instructores}</Text>
                <Text style={styles.cardMetricLabel}>Instructores</Text>
              </View>
              <View style={styles.cardMetricItem}>
                <Text style={styles.cardMetricValue}>{prog.competencias}</Text>
                <Text style={styles.cardMetricLabel}>Competencias</Text>
              </View>
            </View>

            {/* Asistencia Promedio Progress Bar */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Asistencia promedio</Text>
                <Text style={styles.progressValue}>{prog.asistenciaPromedio}%</Text>
              </View>
              <View style={styles.trackBar}>
                <View
                  style={[
                    styles.fillBar,
                    {
                      width: `${prog.asistenciaPromedio}%`,
                      backgroundColor: prog.badgeColor,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Promedio de Notas */}
            <View style={styles.gradeRow}>
              <Text style={styles.gradeLabel}>Promedio de notas</Text>
              <Text style={styles.gradeValue}>{prog.promedioNotas} / 5.0</Text>
            </View>
          </View>
        ))}
      </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: NAVY,
  },
  listContainer: {
    gap: 18,
  },
  programCard: {
    backgroundColor: '#EAEAEA',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgePill: {
    width: 54,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  programTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: NAVY,
  },
  programLevel: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadgeActive: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusTextActive: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  cardMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  cardMetricItem: {
    alignItems: 'center',
  },
  cardMetricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: NAVY,
  },
  cardMetricLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  progressSection: {
    marginBottom: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 13,
    color: '#475569',
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '700',
    color: NAVY,
  },
  trackBar: {
    height: 12,
    backgroundColor: '#D1D5DB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  fillBar: {
    height: '100%',
    borderRadius: 6,
  },
  gradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  gradeLabel: {
    fontSize: 13,
    color: '#475569',
  },
  gradeValue: {
    fontSize: 14,
    fontWeight: '700',
    color: NAVY,
  },
});
