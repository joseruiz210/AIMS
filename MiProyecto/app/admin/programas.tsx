import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ActionModal from '../../components/ActionModal';
import { programasService } from '../../services/programasService';

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
}

export default function ProgramasScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [search, setSearch] = useState('');
  const [programas, setProgramas] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadProgramas();
  }, []);

  const loadProgramas = async () => {
    setLoading(true);
    try {
      const data = await programasService.getProgramas();
      setProgramas(
        data.map((p) => ({
          id: p.id,
          badge: (p.codigo || 'PRG').slice(0, 4).toUpperCase(),
          badgeColor: GOLD,
          title: p.nombre,
          level: `${p.nivel || 'Tecn\u00f3logo'} - ${p.duracionMeses || 24} meses`,
          status: ((p.estado || 'Activo').toUpperCase() as any),
          fichas: p.fichasActivasCount || 0,
          aprendices: p.aprendicesCount || 0,
          instructores: p.instructoresCount || 0,
          competencias: p.competenciasCount || 0,
        }))
      );
    } catch (err) {
      console.error('Error al cargar programas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrograma = async (values: Record<string, string>) => {
    const nombre = values['Nombre del Programa'] || 'Nuevo Programa Formativo';
    const codigo = values['Código de Insignia'] || 'PRG-' + Math.floor(Math.random() * 1000);
    const nivelDuracion = values['Nivel y Duración'] || 'Tecnólogo - 24 meses';

    try {
      await programasService.createPrograma({
        codigo,
        nombre,
        nivel: nivelDuracion.split('-')[0]?.trim() || 'Tecnólogo',
        duracionMeses: parseInt(nivelDuracion.replace(/[^0-9]/g, '') || '24', 10),
      });
      // Recargar datos reales desde el backend tras crear
      await loadProgramas();
    } catch (err) {
      console.error('Error al crear programa:', err);
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={true}>
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
          <Text style={styles.metricValueGold}>{loading ? '-' : totalProgramas}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>FICHAS TOTALES</Text>
          <Text style={styles.metricValueDark}>{loading ? '-' : totalFichas}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>APRENDICES</Text>
          <Text style={styles.metricValueGold}>{loading ? '-' : totalAprendices}</Text>
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
      {loading ? (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={GOLD} />
          <Text style={{ color: '#64748B', marginTop: 12, fontWeight: '600' }}>Cargando programas...</Text>
        </View>
      ) : filteredProgramas.length === 0 ? (
        <View style={{ padding: 40, alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' }}>
          <Ionicons name="book-outline" size={48} color="#94A3B8" />
          <Text style={{ fontSize: 16, fontWeight: '700', color: NAVY, marginTop: 12 }}>No hay programas registrados</Text>
        </View>
      ) : (
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
            </View>
          ))}
        </View>
      )}

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
});
