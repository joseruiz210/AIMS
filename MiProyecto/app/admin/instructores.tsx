import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NAVY = '#12103C';
const GOLD = '#cfa235';

interface InstructorItem {
  id: string;
  initials: string;
  nombre: string;
  especialidad: string;
  email: string;
  status: 'Activo' | 'Inactivo';
  fichasCount: number;
  aprendicesCount: number;
}

const INITIAL_INSTRUCTORES: InstructorItem[] = [
  {
    id: '1',
    initials: 'RV',
    nombre: 'Roberto Vargas',
    especialidad: 'Desarrollo de Software',
    email: 'r.vargas@sena.edu.co',
    status: 'Activo',
    fichasCount: 2,
    aprendicesCount: 52,
  },
  {
    id: '2',
    initials: 'CL',
    nombre: 'Carmen López',
    especialidad: 'Bases de Datos & SQL',
    email: 'c.lopez@sena.edu.co',
    status: 'Activo',
    fichasCount: 3,
    aprendicesCount: 78,
  },
  {
    id: '3',
    initials: 'JP',
    nombre: 'Jorge Pinzón',
    especialidad: 'Finanzas y Contabilidad',
    email: 'j.pinzon@sena.edu.co',
    status: 'Activo',
    fichasCount: 2,
    aprendicesCount: 44,
  },
  {
    id: '4',
    initials: 'MR',
    nombre: 'María Ruiz',
    especialidad: 'Diseño Gráfico y UI/UX',
    email: 'm.ruiz@sena.edu.co',
    status: 'Activo',
    fichasCount: 1,
    aprendicesCount: 20,
  },
];

export default function InstructoresScreen() {
  const [search, setSearch] = useState('');
  const [instructores] = useState<InstructorItem[]>(INITIAL_INSTRUCTORES);

  const filteredInstructores = instructores.filter(
    (ins) =>
      ins.nombre.toLowerCase().includes(search.toLowerCase()) ||
      ins.especialidad.toLowerCase().includes(search.toLowerCase()) ||
      ins.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Text style={styles.pageTitle}>Instructores</Text>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>INSTRUCTORES</Text>
          <Text style={styles.metricValueGold}>20</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>FICHAS ASIGNADAS</Text>
          <Text style={styles.metricValueDark}>25</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>PROMEDIO APRENDICES</Text>
          <Text style={styles.metricValueGold}>20</Text>
          <Text style={styles.metricSubtext}>Por Instructor</Text>
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
      <View style={styles.listContainer}>
        {filteredInstructores.map((ins) => (
          <View key={ins.id} style={styles.instructorCard}>
            <View style={styles.cardLeft}>
              {/* Avatar Initials Circle */}
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{ins.initials}</Text>
              </View>

              {/* Info */}
              <View style={styles.infoGroup}>
                <View style={styles.nameRow}>
                  <Text style={styles.instructorName}>{ins.nombre}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{ins.status}</Text>
                  </View>
                </View>
                <Text style={styles.especialidadText}>{ins.especialidad}</Text>
                <Text style={styles.emailText}>{ins.email}</Text>

                {/* Sub Counters */}
                <View style={styles.countersRow}>
                  <View style={styles.counterItem}>
                    <Text style={styles.counterNum}>{ins.fichasCount}</Text>
                    <Text style={styles.counterLabel}>
                      {ins.fichasCount === 1 ? 'ficha' : 'fichas'}
                    </Text>
                  </View>
                  <View style={styles.counterItem}>
                    <Text style={styles.counterNum}>{ins.aprendicesCount}</Text>
                    <Text style={styles.counterLabel}>aprendices</Text>
                  </View>
                </View>
              </View>
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
    minWidth: 160,
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
  metricSubtext: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
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
    gap: 16,
  },
  instructorCard: {
    backgroundColor: '#EAEAEA',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 20,
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
    fontSize: 18,
    fontWeight: '700',
    color: NAVY,
  },
  statusBadge: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: GOLD,
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
    alignItems: 'center',
  },
  counterNum: {
    fontSize: 16,
    fontWeight: '700',
    color: NAVY,
  },
  counterLabel: {
    fontSize: 12,
    color: '#64748B',
  },
});
