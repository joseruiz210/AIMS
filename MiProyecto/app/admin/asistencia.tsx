import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NAVY = '#12103C';
const GOLD = '#cfa235';

interface FichaAsistencia {
  ficha: string;
  programa: string;
  instructor: string;
  aprendices: number;
  asistenciaPct: number;
  estado: 'Activo' | 'Riesgo' | 'Critico';
}

const PROGRAMAS_BARS = [
  { name: 'ADSO', pct: 93 },
  { name: 'AE', pct: 75 },
  { name: 'CF', pct: 90 },
  { name: 'DG', pct: 85 },
];

const RESUMEN_FICHAS: FichaAsistencia[] = [
  { ficha: '123432', programa: 'ADSO', instructor: 'R. López', aprendices: 26, asistenciaPct: 91, estado: 'Activo' },
  { ficha: '284568', programa: 'AE', instructor: 'C. López', aprendices: 24, asistenciaPct: 75, estado: 'Riesgo' },
  { ficha: '284569', programa: 'CF', instructor: 'J. Pinzón', aprendices: 22, asistenciaPct: 90, estado: 'Activo' },
  { ficha: '284570', programa: 'DG', instructor: 'M. Ruiz', aprendices: 20, asistenciaPct: 85, estado: 'Activo' },
];

export default function AsistenciaAdminScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Text style={styles.pageTitle}>Asistencia</Text>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Promedio Global</Text>
          <Text style={styles.metricValueGold}>90%</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Mejor Programa</Text>
          <Text style={styles.metricValueDark}>ADSO</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total sesiones</Text>
          <Text style={styles.metricValueGold}>1.012</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Fichas críticas</Text>
          <Text style={styles.metricValueDark}>2</Text>
        </View>
      </View>

      {/* Asistencia por Programa Horizontal Bar Graphic Box */}
      <View style={styles.chartBox}>
        <Text style={styles.chartTitle}>ASISTENCIA POR PROGRAMA</Text>

        <View style={styles.barsContainer}>
          {PROGRAMAS_BARS.map((item) => (
            <View key={item.name} style={styles.barRow}>
              <Text style={styles.progLabel}>{item.name}</Text>
              <View style={styles.trackBar}>
                <View style={[styles.fillBar, { width: `${item.pct}%` }]} />
              </View>
              <Text style={styles.pctLabel}>{item.pct}%</Text>
            </View>
          ))}
        </View>

        {/* X Axis Scale */}
        <View style={styles.xAxisRow}>
          <Text style={styles.axisText}>0</Text>
          <Text style={styles.axisText}>25</Text>
          <Text style={styles.axisText}>50</Text>
          <Text style={styles.axisText}>75</Text>
          <Text style={styles.axisText}>100</Text>
        </View>
      </View>

      {/* Resumen Por Ficha Section */}
      <View style={styles.tableBox}>
        <Text style={styles.tableTitle}>Resumen por ficha</Text>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.thText, { flex: 1 }]}>Ficha</Text>
          <Text style={[styles.thText, { flex: 1 }]}>Programa</Text>
          <Text style={[styles.thText, { flex: 1.5 }]}>Instructor</Text>
          <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>Aprendices</Text>
          <Text style={[styles.thText, { flex: 2 }]}>Asistencia</Text>
          <Text style={[styles.thText, { flex: 1, textAlign: 'right' }]}>Estado</Text>
        </View>

        {/* Table Body */}
        {RESUMEN_FICHAS.map((row, idx) => (
          <View
            key={row.ficha}
            style={[
              styles.tableRow,
              idx % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
            ]}
          >
            <Text style={[styles.tdText, { flex: 1, fontWeight: '700', color: NAVY }]}>
              {row.ficha}
            </Text>
            <Text style={[styles.tdText, { flex: 1, fontWeight: '600' }]}>{row.programa}</Text>
            <Text style={[styles.tdText, { flex: 1.5, color: '#475569' }]}>{row.instructor}</Text>
            <Text style={[styles.tdText, { flex: 1, textAlign: 'center' }]}>{row.aprendices}</Text>

            {/* Asistencia Progress Bar inside table */}
            <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.miniTrack}>
                <View style={[styles.miniFill, { width: `${row.asistenciaPct}%` }]} />
              </View>
              <Text style={styles.miniPctText}>{row.asistenciaPct}%</Text>
            </View>

            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <View
                style={[
                  styles.statusBadge,
                  row.estado === 'Riesgo' ? styles.badgeRiesgo : styles.badgeActivo,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    row.estado === 'Riesgo' ? styles.textRiesgo : styles.textActivo,
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
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: NAVY,
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
  chartBox: {
    backgroundColor: '#EAEAEA',
    borderRadius: 16,
    padding: 22,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.8,
    marginBottom: 20,
  },
  barsContainer: {
    gap: 16,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  progLabel: {
    width: 50,
    fontSize: 14,
    fontWeight: '700',
    color: NAVY,
  },
  trackBar: {
    flex: 1,
    height: 18,
    backgroundColor: '#D1D5DB',
    borderRadius: 9,
    overflow: 'hidden',
  },
  fillBar: {
    height: '100%',
    backgroundColor: GOLD,
    borderRadius: 9,
  },
  pctLabel: {
    width: 40,
    fontSize: 13,
    fontWeight: '700',
    color: NAVY,
    textAlign: 'right',
  },
  xAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingLeft: 64,
    paddingRight: 54,
  },
  axisText: {
    fontSize: 12,
    color: '#64748B',
  },
  tableBox: {
    backgroundColor: '#D9D9D9',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: NAVY,
    marginBottom: 14,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#C0C0C0',
  },
  thText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
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
  tdText: {
    fontSize: 14,
    color: '#334155',
  },
  miniTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#C5C7CB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  miniFill: {
    height: '100%',
    backgroundColor: GOLD,
    borderRadius: 4,
  },
  miniPctText: {
    fontSize: 12,
    fontWeight: '700',
    color: NAVY,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  badgeActivo: {
    backgroundColor: '#DEF7EC',
  },
  badgeRiesgo: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  textActivo: {
    color: '#03543F',
  },
  textRiesgo: {
    color: '#92400E',
  },
});
