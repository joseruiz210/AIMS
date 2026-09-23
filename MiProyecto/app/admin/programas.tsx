import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  useWindowDimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ActionModal from '../../components/ActionModal';
import { programasService } from '../../services/programasService';
import { fichasService } from '../../services/fichasService';

const NAVY = '#12103C';
const GOLD = '#cfa235';

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

export default function ProgramasScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [search, setSearch] = useState('');
  const [programas, setProgramas] = useState<ProgramItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProgramas = useCallback(async () => {
    try {
      const [progData, fichasData] = await Promise.all([
        programasService.getProgramas(),
        fichasService.getFichas(),
      ]);

      if (progData && progData.length > 0) {
        setProgramas(
          progData.map((p) => {
            const pId = String(p.id).toLowerCase();
            const pNombre = (p.nombre || '').trim().toLowerCase();
            const pCodigo = (p.codigo || '').trim().toLowerCase();

            const fichasDelPrograma = (fichasData || []).filter((f) => {
              if (f.programaId && String(f.programaId).toLowerCase() === pId) return true;
              if (f.programaNombre && pNombre && f.programaNombre.trim().toLowerCase() === pNombre) return true;
              if (f.codigo && pCodigo && f.codigo.toLowerCase().includes(pCodigo)) return true;
              return false;
            });

            const fichasCount = fichasDelPrograma.length > 0 ? fichasDelPrograma.length : (p.fichasActivasCount || 0);
            const aprendicesCount = fichasDelPrograma.reduce((sum, f) => sum + (f.aprendicesCount || 0), 0);

            const instructoresSet = new Set(
              fichasDelPrograma.map((f) => f.instructorNombre).filter((n) => n && n !== 'Sin asignar')
            );
            const instructoresCount = instructoresSet.size > 0 ? instructoresSet.size : 0;

            return {
              id: p.id,
              badge: (p.codigo || 'PRG').slice(0, 4).toUpperCase(),
              badgeColor: GOLD,
              title: p.nombre,
              level: `${p.nivel || 'Tecnólogo'} - ${p.duracionMeses || 24} meses`,
              status: (p.estado as any) || 'ACTIVO',
              fichas: fichasCount,
              aprendices: aprendicesCount,
              instructores: instructoresCount,
              competencias: 10,
              asistenciaPromedio: 90,
              promedioNotas: 4.2,
            };
          })
        );
      } else {
        setProgramas([]);
      }
    } catch (err) {
      console.error('Error cargando programas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProgramas();
  }, [loadProgramas]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProgramas();
    setRefreshing(false);
  }, [loadProgramas]);

  const handleCreatePrograma = async (values: Record<string, string>) => {
    const nombre = values['Nombre del Programa']?.trim() || 'Nuevo Programa Formativo';
    const codigo = values['Código de Insignia']?.trim() || 'PRG-' + Math.floor(Math.random() * 1000);
    const nivelDuracion = values['Nivel y Duración']?.trim() || 'Tecnólogo - 24 meses';
    const competencias = parseInt(values['Número de Competencias'] || '10', 10);
    const duracionMeses = parseInt(nivelDuracion.replace(/[^0-9]/g, '') || '24', 10);
    const nivel = nivelDuracion.split('-')[0]?.trim() || 'Tecnólogo';

    try {
      const created = await programasService.createPrograma({
        codigo,
        nombre,
        nivel,
        duracionMeses,
        fichasActivasCount: 1,
        estado: 'Activo',
      });

      const newProgItem: ProgramItem = {
        id: created.id,
        badge: codigo.slice(0, 4).toUpperCase(),
        badgeColor: GOLD,
        title: nombre,
        level: `${nivel} - ${duracionMeses} meses`,
        status: 'ACTIVO',
        fichas: 1,
        aprendices: 25,
        instructores: 3,
        competencias: competencias || 10,
        asistenciaPromedio: 95,
        promedioNotas: 4.5,
      };

      setProgramas((prev) => [newProgItem, ...prev.filter(p => p.id !== created.id)]);
      setModalVisible(false);
    } catch (err) {
      console.error('Error creando programa:', err);
    }
  };

  const filteredProgramas = programas.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.badge.toLowerCase().includes(search.toLowerCase())
  );

  const totalProgramas = programas.length;
  const totalFichas = programas.reduce((acc, p) => acc + p.fichas, 0);
  const totalAprendices = programas.reduce((acc, p) => acc + p.aprendices, 0);
  const promedioGlobal = totalProgramas > 0 ? (
    programas.reduce((acc, p) => acc + p.promedioNotas, 0) / totalProgramas
  ).toFixed(1) : '4.2';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={GOLD}
          colors={[GOLD, NAVY]}
        />
      }
    >
      {/* Top Action Bar */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.pageTitle}>Programas</Text>
          <Text style={styles.pageSubtitle}>Programas de formación académica tecnológica SENA.</Text>
        </View>

        <Pressable
          style={({ hovered }: any) => [styles.newBtn, hovered && styles.newBtnHover]}
          onPress={() => setModalVisible(true)}
        >
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
                <View style={{ marginLeft: 12, flex: 1 }}>
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

      <ActionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreatePrograma}
        title="Crear Nuevo Programa"
        subtitle="Módulo de Formación Académica SENA"
        iconName="book-outline"
        confirmText="Guardar Programa"
        fields={[
          { label: 'Nombre del Programa', placeholder: 'Ej: Análisis y Desarrollo de Software' },
          { label: 'Código de Insignia', placeholder: 'Ej: ADSO, DG, AE...' },
          { label: 'Nivel y Duración', placeholder: 'Ej: Tecnólogo - 24 meses' },
          { label: 'Número de Competencias', placeholder: 'Ej: 15' },
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
    padding: 20,
    paddingBottom: 50,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
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
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GOLD,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
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
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
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
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: NAVY,
  },
  listContainer: {
    gap: 16,
  },
  programCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 10,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  badgePill: {
    width: 50,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  programTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: NAVY,
  },
  programLevel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadgeActive: {
    backgroundColor: '#ECFDF5',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusTextActive: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  cardMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 10,
  },
  cardMetricItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  cardMetricValue: {
    fontSize: 17,
    fontWeight: '700',
    color: NAVY,
  },
  cardMetricLabel: {
    fontSize: 11,
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
    fontSize: 12,
    color: '#475569',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '700',
    color: NAVY,
  },
  trackBar: {
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  fillBar: {
    height: '100%',
    borderRadius: 5,
  },
  gradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  gradeLabel: {
    fontSize: 12,
    color: '#475569',
  },
  gradeValue: {
    fontSize: 13,
    fontWeight: '700',
    color: NAVY,
  },
});
