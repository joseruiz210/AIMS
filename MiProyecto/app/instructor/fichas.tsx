import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const NAVY = '#0F1026';
const GOLD = '#D4AF37';
const BG_PAGE = '#F8FAFC';

export default function FichasScreenPremium() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Title */}
      <Text style={styles.pageTitle}>Mis fichas</Text>

      {/* Top Stat Cards Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={styles.statIconWrap}>
            <Ionicons name="bookmark-outline" size={18} color={GOLD} />
          </View>
          <View style={styles.statTextGroup}>
            <Text style={styles.statLabel}>Fichas asignadas</Text>
            <Text style={styles.statNumber}>2</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconWrap}>
            <Ionicons name="people-outline" size={18} color={GOLD} />
          </View>
          <View style={styles.statTextGroup}>
            <Text style={styles.statLabel}>Aprendices Totales</Text>
            <Text style={styles.statNumber}>48</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconWrap}>
            <Ionicons name="analytics-outline" size={18} color={GOLD} />
          </View>
          <View style={styles.statTextGroup}>
            <Text style={styles.statLabel}>Promedio Global</Text>
            <Text style={styles.statNumber}>4.0</Text>
          </View>
        </View>
      </View>

      {/* Main Ficha Card */}
      <View style={styles.fichaCard}>
        {/* Header row inside card */}
        <View style={styles.fichaHeaderRow}>
          <View style={styles.fichaLeftHeader}>
            <View style={styles.codeBadge}>
              <Text style={styles.codeBadgeText}>4321</Text>
            </View>
            <View style={styles.fichaTitleGroup}>
              <Text style={styles.fichaTitle}>Analisis y Desarrollo de Software</Text>
              <Text style={styles.fichaSubtitle}>Ficha 12344321 . Jornada mañana</Text>
            </View>
          </View>

          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusBadgeText}>ACTIVO</Text>
          </View>
        </View>

        {/* 3 Pills Row */}
        <View style={styles.pillsRow}>
          <View style={styles.goldPill}>
            <Ionicons name="people" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.goldPillText}>26 Aprendices</Text>
          </View>

          <View style={styles.whitePill}>
            <Ionicons name="checkbox-outline" size={14} color="#10B981" style={{ marginRight: 6 }} />
            <Text style={styles.whitePillText}>91% Asistencia</Text>
          </View>

          <View style={styles.whitePill}>
            <Ionicons name="star-outline" size={14} color={GOLD} style={{ marginRight: 6 }} />
            <Text style={styles.whitePillText}>4.1 Promedio</Text>
          </View>
        </View>

        {/* Progress bar section */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>Asistencia general del grupo</Text>
            <Text style={styles.progressPercentage}>91%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '91%' }]} />
          </View>
        </View>

        {/* Action Buttons Row */}
        <View style={styles.actionsRow}>
          <Pressable
            style={styles.btnGold}
            onPress={() => router.push('/instructor/asistencia')}
          >
            <Ionicons name="checkbox-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.btnGoldText}>Ver asistencia</Text>
          </Pressable>

          <Pressable
            style={styles.btnWhite}
            onPress={() => router.push('/instructor/calificaciones')}
          >
            <Ionicons name="bar-chart-outline" size={16} color="#1E293B" style={{ marginRight: 6 }} />
            <Text style={styles.btnWhiteText}>Ver notas</Text>
          </Pressable>
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
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 28,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTextGroup: {},
  statLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: GOLD,
  },
  fichaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  fichaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  fichaLeftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  codeBadge: {
    width: 52,
    height: 52,
    backgroundColor: NAVY,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F1026',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  codeBadgeText: {
    color: GOLD,
    fontWeight: '800',
    fontSize: 17,
  },
  fichaTitleGroup: {
    flex: 1,
  },
  fichaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  fichaSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  goldPill: {
    backgroundColor: GOLD,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  goldPillText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  whitePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  whitePillText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: 24,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  progressPercentage: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: GOLD,
    borderRadius: 5,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  btnGold: {
    backgroundColor: GOLD,
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnGoldText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  btnWhite: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnWhiteText: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '600',
  },
});
