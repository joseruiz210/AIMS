import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';

const NAVY = '#12103C';
const GOLD = '#cfa235';

interface ProgramGradeSummary {
  programa: string;
  aprendices: number;
  promedio: number;
  aprobados: number;
  enRiesgo: number;
}

const BAR_DATA = [
  { label: 'ADSO', val: 4.6 },
  { label: 'AE', val: 4.1 },
  { label: 'CF', val: 4.5 },
  { label: 'DG', val: 3.9 },
  { label: 'GL', val: 4.9 },
];

const SUMMARY_DATA: ProgramGradeSummary[] = [
  { programa: 'ADSO', aprendices: 208, promedio: 4.1, aprobados: 189, enRiesgo: 19 },
  { programa: 'DISEÑO GRÁFICO', aprendices: 104, promedio: 4.3, aprobados: 95, enRiesgo: 9 },
  { programa: 'ADMINISTRACIÓN DE EMPRESAS', aprendices: 180, promedio: 4.0, aprobados: 165, enRiesgo: 15 },
  { programa: 'CONTABILIDAD Y FINANZAS', aprendices: 140, promedio: 4.2, aprobados: 130, enRiesgo: 10 },
];

export default function CalificacionesAdminScreen() {
  const { width } = useWindowDimensions();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Text style={styles.pageTitle}>Calificación</Text>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>PROMEDIO GLOBAL</Text>
          <Text style={styles.metricValueGold}>4.0</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>MEJOR PROGRAMA</Text>
          <Text style={styles.metricValueDark}>ADSO</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>APROBADOS</Text>
          <Text style={styles.metricValueGold}>92%</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>EN RIESGO</Text>
          <Text style={styles.metricValueDark}>8%</Text>
        </View>
      </View>

      {/* Vertical Bar Chart Box */}
      <View style={styles.chartBox}>
        <Text style={styles.chartTitle}>PROMEDIO DE NOTAS POR PROGRAMAS</Text>

        <View style={styles.vChartArea}>
          {/* Y Axis Numbers */}
          <View style={styles.yAxisColumn}>
            <Text style={styles.yAxisText}>5.0</Text>
            <Text style={styles.yAxisText}>4.5</Text>
            <Text style={styles.yAxisText}>4.0</Text>
            <Text style={styles.yAxisText}>3.5</Text>
            <Text style={styles.yAxisText}>3.0</Text>
          </View>

          {/* Vertical Bars */}
          <View style={styles.barsFlexContainer}>
            {BAR_DATA.map((item) => {
              // Scale value 3.0 to 5.0 onto 0% to 100% bar height
              const heightPct = Math.max(0, Math.min(100, ((item.val - 3.0) / 2.0) * 100));

              return (
                <View key={item.label} style={styles.vBarColumn}>
                  <Text style={styles.barValText}>{item.val}</Text>
                  <View style={styles.vBarTrack}>
                    <View style={[styles.vBarFill, { height: `${heightPct}%` }]} />
                  </View>
                  <Text style={styles.vBarLabel}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Breakdown Table Box */}
      <View style={styles.tableBox}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.thText, { flex: 2 }]}>PROGRAMA</Text>
          <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>APRENDICES</Text>
          <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>PROMEDIO</Text>
          <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>APROBADOS</Text>
          <Text style={[styles.thText, { flex: 1, textAlign: 'right' }]}>EN RIESGO</Text>
        </View>

        {/* Table Body */}
        {SUMMARY_DATA.map((row, idx) => (
          <View
            key={row.programa}
            style={[
              styles.tableRow,
              idx % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
            ]}
          >
            <Text style={[styles.tdText, { flex: 2, fontWeight: '700', color: NAVY }]}>
              {row.programa}
            </Text>
            <Text style={[styles.tdText, { flex: 1, textAlign: 'center' }]}>{row.aprendices}</Text>
            <Text style={[styles.tdText, { flex: 1, textAlign: 'center', fontWeight: '700', color: GOLD }]}>
              {row.promedio.toFixed(1)}
            </Text>
            <Text style={[styles.tdText, { flex: 1, textAlign: 'center', color: '#10B981', fontWeight: '600' }]}>
              {row.aprobados}
            </Text>
            <Text style={[styles.tdText, { flex: 1, textAlign: 'right', color: '#EF4444', fontWeight: '600' }]}>
              {row.enRiesgo}
            </Text>
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
    textAlign: 'center',
    marginBottom: 20,
  },
  vChartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 180,
  },
  yAxisColumn: {
    height: '100%',
    justifyContent: 'space-between',
    paddingRight: 12,
  },
  yAxisText: {
    fontSize: 12,
    color: '#64748B',
  },
  barsFlexContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '100%',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#CBD5E1',
    paddingLeft: 8,
    paddingBottom: 4,
  },
  vBarColumn: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    width: 44,
  },
  barValText: {
    fontSize: 11,
    fontWeight: '700',
    color: NAVY,
    marginBottom: 4,
  },
  vBarTrack: {
    width: 24,
    height: '75%',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  vBarFill: {
    width: '100%',
    backgroundColor: GOLD,
    borderRadius: 6,
  },
  vBarLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: NAVY,
    marginTop: 6,
  },
  tableBox: {
    backgroundColor: '#D9D9D9',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#CCCCCC',
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
});
