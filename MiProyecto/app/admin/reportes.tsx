import React from 'react';
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

const MONTHLY_ENROLLMENTS = [
  { month: 'Feb', count: 48 },
  { month: 'Mar', count: 38 },
  { month: 'Abr', count: 52 },
  { month: 'May', count: 28 },
  { month: 'Jun', count: 55 },
  { month: 'Jul', count: 27 },
];

export default function ReportesAdminScreen() {
  const { width } = useWindowDimensions();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Text style={styles.pageTitle}>Reportes</Text>
        <View style={styles.btnGroup}>
          <Pressable style={({ hovered }: any) => [styles.btn, hovered && styles.btnHover]}>
            <Ionicons name="print-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.btnText}>Imprimir</Text>
          </Pressable>
          <Pressable style={({ hovered }: any) => [styles.btn, hovered && styles.btnHover]}>
            <Ionicons name="download-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.btnText}>Exportar</Text>
          </Pressable>
        </View>
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

      {/* Monthly Enrollments Chart Box */}
      <View style={styles.chartBox}>
        <Text style={styles.chartTitle}>MATRICULAS MENSUALES</Text>

        <View style={styles.vChartArea}>
          {/* Y Axis Numbers */}
          <View style={styles.yAxisColumn}>
            <Text style={styles.yAxisText}>60</Text>
            <Text style={styles.yAxisText}>45</Text>
            <Text style={styles.yAxisText}>30</Text>
            <Text style={styles.yAxisText}>15</Text>
            <Text style={styles.yAxisText}>0</Text>
          </View>

          {/* Vertical Bars */}
          <View style={styles.barsFlexContainer}>
            {MONTHLY_ENROLLMENTS.map((item) => {
              const heightPct = (item.count / 60) * 100;

              return (
                <View key={item.month} style={styles.vBarColumn}>
                  <Text style={styles.barValText}>{item.count}</Text>
                  <View style={styles.vBarTrack}>
                    <View style={[styles.vBarFill, { height: `${heightPct}%` }]} />
                  </View>
                  <Text style={styles.vBarLabel}>{item.month}</Text>
                </View>
              );
            })}
          </View>
        </View>
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
  btnGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GOLD,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  btnHover: {
    backgroundColor: '#b88d2a',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
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
    height: 200,
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
    height: '80%',
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
});
