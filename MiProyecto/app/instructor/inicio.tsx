import React from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NAVY = '#0F1026';
const GOLD = '#D4AF37';
const BG_PAGE = '#F8FAFC';

const weeklyData = [
  { day: 'Lun', percentage: 82 },
  { day: 'Mar', percentage: 64 },
  { day: 'Mié', percentage: 76 },
  { day: 'Jue', percentage: 52 },
  { day: 'Vie', percentage: 92 },
];

export default function InstructorInicioPremium() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isMobile = width < 768;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Title / Greeting */}
      <View style={styles.headerGroup}>
        <Text style={styles.mainTitle}>
          {isDesktop ? 'Instructor' : 'Hola, Instructor'}
        </Text>
        {!isDesktop && (
          <View style={styles.fichaBadge}>
            <Text style={styles.fichaBadgeText}>Ficha 1234321</Text>
          </View>
        )}
      </View>

      {/* 4 Premium Stat Cards */}
      <View style={[styles.statsGrid, isMobile && styles.statsGridMobile]}>
        <View style={styles.statCard}>
          <View style={styles.statTopRow}>
            <View style={[styles.iconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="people-outline" size={20} color={GOLD} />
            </View>
            <Text style={styles.statSubtext}>En ficha</Text>
          </View>
          <Text style={[styles.statValue, styles.goldText]}>23</Text>
          <Text style={styles.statLabel}>Aprendices Totales</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statTopRow}>
            <View style={[styles.iconWrap, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="checkbox-outline" size={20} color="#10B981" />
            </View>
            <Text style={styles.statSubtext}>Promedio</Text>
          </View>
          <Text style={[styles.statValue, styles.goldText]}>90%</Text>
          <Text style={styles.statLabel}>Asistencia General</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statTopRow}>
            <View style={[styles.iconWrap, { backgroundColor: '#E0E7FF' }]}>
              <Ionicons name="star-outline" size={20} color="#6366F1" />
            </View>
            <Text style={styles.statSubtext}>Sobre 5.0</Text>
          </View>
          <Text style={[styles.statValue, styles.goldText]}>4.0</Text>
          <Text style={styles.statLabel}>Promedio Ficha</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statTopRow}>
            <View style={[styles.iconWrap, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
            </View>
            <Text style={styles.statSubtext}>Seguimiento</Text>
          </View>
          <Text style={[styles.statValue, styles.darkText]}>4</Text>
          <Text style={styles.statLabel}>En Riesgo</Text>
        </View>
      </View>

      {/* Weekly Attendance Chart Card */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeaderRow}>
          <Text style={styles.chartTitle}>ASISTENCIA SEMANAL</Text>
          <View style={styles.chartLegend}>
            <View style={styles.legendDot} />
            <Text style={styles.legendText}>Promedio Diario</Text>
          </View>
        </View>

        <View style={styles.chartBody}>
          {/* Y Axis Labels */}
          <View style={styles.yAxis}>
            <Text style={styles.yAxisText}>100%</Text>
            <Text style={styles.yAxisText}>75%</Text>
            <Text style={styles.yAxisText}>50%</Text>
            <Text style={styles.yAxisText}>25%</Text>
            <Text style={styles.yAxisText}>0%</Text>
          </View>

          {/* Bar Chart Container */}
          <View style={styles.barsContainer}>
            {/* Grid horizontal lines */}
            <View style={styles.gridLineContainer}>
              <View style={styles.gridLine} />
              <View style={styles.gridLine} />
              <View style={styles.gridLine} />
              <View style={styles.gridLine} />
              <View style={styles.gridLine} />
            </View>

            {/* Bars row */}
            <View style={styles.barsRow}>
              {weeklyData.map((item, idx) => (
                <View key={idx} style={styles.barCol}>
                  <Text style={styles.barPctTooltip}>{item.percentage}%</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { height: `${item.percentage}%` }]} />
                  </View>
                  <Text style={styles.dayText}>{item.day}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_PAGE,
  },
  contentContainer: {
    paddingHorizontal: 28,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  headerGroup: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
  },
  fichaBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  fichaBadgeText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 28,
    flexWrap: 'wrap',
  },
  statsGridMobile: {
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  statTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statSubtext: {
    fontSize: 12,
    color: '#64748B',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 2,
  },
  goldText: {
    color: GOLD,
  },
  darkText: {
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  // Chart styles
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    maxWidth: 700,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  chartLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GOLD,
  },
  legendText: {
    fontSize: 12,
    color: '#64748B',
  },
  chartBody: {
    flexDirection: 'row',
    height: 210,
    alignItems: 'stretch',
  },
  yAxis: {
    width: 45,
    justifyContent: 'space-between',
    paddingBottom: 24,
    alignItems: 'flex-start',
  },
  yAxisText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  barsContainer: {
    flex: 1,
    position: 'relative',
  },
  gridLineContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  gridLine: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  barsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: 24,
  },
  barCol: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    width: 44,
  },
  barPctTooltip: {
    fontSize: 10,
    fontWeight: '700',
    color: GOLD,
    marginBottom: 4,
  },
  barTrack: {
    width: 24,
    height: '100%',
    justifyContent: 'flex-end',
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: GOLD,
    borderRadius: 6,
  },
  dayText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
});
