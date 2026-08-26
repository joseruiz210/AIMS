import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NAVY = '#12103C';
const GOLD = '#cfa235';

export default function AdminDashboard() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const statCards = [
    { title: 'Total aprendices', value: '0', icon: 'school-outline' as const, highlight: true },
    { title: 'Instructores', value: '0', icon: 'person-outline' as const, highlight: false },
    { title: 'Programas', value: '0', icon: 'book-outline' as const, highlight: true },
    { title: 'Fichas activas', value: '0', icon: 'document-text-outline' as const, highlight: false },
  ];

  const quickActions = [
    { title: 'Registrar usuario', icon: 'person-add-outline' as const },
    { title: 'Nueva ficha', icon: 'add-circle-outline' as const },
    { title: 'Tomar asistencia', icon: 'checkmark-done-outline' as const },
    { title: 'Ver reportes', icon: 'analytics-outline' as const },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bienvenido de nuevo</Text>
          <Text style={styles.title}>Panel Administrativo</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.dateBadge}>
            <Ionicons name="calendar-outline" size={16} color={NAVY} />
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </View>
        </View>
      </View>

      {/* Stat Cards */}
      <View style={styles.cardsContainer}>
        {statCards.map((card, index) => (
          <View key={index} style={[styles.card, !isDesktop && styles.mobileCard]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, card.highlight && styles.cardIconWrapGold]}>
                <Ionicons name={card.icon} size={22} color={card.highlight ? GOLD : NAVY} />
              </View>
            </View>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={[styles.cardValue, card.highlight && styles.cardValueHighlight]}>
              {card.value}
            </Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Acciones rápidas</Text>
      <View style={styles.actionsContainer}>
        {quickActions.map((action, index) => (
          <View key={index} style={[styles.actionCard, !isDesktop && styles.mobileActionCard]}>
            <View style={styles.actionIconWrap}>
              <Ionicons name={action.icon} size={26} color={GOLD} />
            </View>
            <Text style={styles.actionText}>{action.title}</Text>
          </View>
        ))}
      </View>

      {/* Charts section */}
      <Text style={styles.sectionTitle}>Resumen</Text>
      <View style={[styles.chartsContainer, !isDesktop && styles.chartsContainerMobile]}>
        {/* Bar Chart - Empty */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Ionicons name="bar-chart-outline" size={18} color={NAVY} />
            <Text style={styles.chartTitle}>ASISTENCIA SEMANAL</Text>
          </View>
          <View style={styles.barChart}>
            <View style={styles.yAxis}>
              <Text style={styles.axisText}>28</Text>
              <Text style={styles.axisText}>21</Text>
              <Text style={styles.axisText}>14</Text>
              <Text style={styles.axisText}>7</Text>
              <Text style={styles.axisText}>0</Text>
            </View>
            <View style={styles.barsArea}>
              {['S1', 'S2', 'S3', 'S4'].map((label) => (
                <View key={label} style={styles.barColumn}>
                  <View style={[styles.bar, { height: 0 }]} />
                  <Text style={styles.barLabel}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.emptyMessage}>
            <Ionicons name="information-circle-outline" size={16} color="#bbb" />
            <Text style={styles.emptyText}>Sin datos disponibles</Text>
          </View>
        </View>

        {/* Doughnut Chart - Empty */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Ionicons name="pie-chart-outline" size={18} color={NAVY} />
            <Text style={styles.chartTitle}>ESTADO DE APRENDICES</Text>
          </View>
          <View style={styles.doughnutContainer}>
            <View style={styles.doughnutOuter}>
              <View style={styles.doughnutInner}>
                <Text style={styles.doughnutCenterText}>0</Text>
                <Text style={styles.doughnutCenterLabel}>Total</Text>
              </View>
            </View>
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.legendText}>Activos: 0</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
              <Text style={styles.legendText}>En riesgo: 0</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
              <Text style={styles.legendText}>Críticos: 0</Text>
            </View>
          </View>
          <View style={styles.emptyMessage}>
            <Ionicons name="information-circle-outline" size={16} color="#bbb" />
            <Text style={styles.emptyText}>Sin datos disponibles</Text>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <Text style={styles.sectionTitle}>Actividad reciente</Text>
      <View style={styles.activityCard}>
        <View style={styles.activityEmpty}>
          <Ionicons name="time-outline" size={40} color="#D0D0D0" />
          <Text style={styles.activityEmptyText}>No hay actividad reciente</Text>
          <Text style={styles.activityEmptySubtext}>Las acciones del sistema aparecerán aquí</Text>
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
  content: {
    padding: 30,
    paddingBottom: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  greeting: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: NAVY,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  dateText: {
    fontSize: 13,
    color: NAVY,
    textTransform: 'capitalize',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    minWidth: 180,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  mobileCard: {
    minWidth: '45%',
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(18, 16, 60, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconWrapGold: {
    backgroundColor: 'rgba(207, 162, 53, 0.1)',
  },
  cardTitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '700',
    color: NAVY,
  },
  cardValueHighlight: {
    color: GOLD,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: NAVY,
    marginBottom: 14,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 30,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    flex: 1,
    minWidth: 160,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(207, 162, 53, 0.15)',
  },
  mobileActionCard: {
    minWidth: '45%',
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(207, 162, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: {
    fontSize: 13,
    color: NAVY,
    fontWeight: '500',
    textAlign: 'center',
  },
  chartsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 30,
  },
  chartsContainerMobile: {
    flexDirection: 'column',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 22,
    flex: 1,
    minHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 13,
    color: '#555',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  barChart: {
    flexDirection: 'row',
    height: 170,
  },
  yAxis: {
    justifyContent: 'space-between',
    paddingRight: 10,
    alignItems: 'flex-end',
    paddingBottom: 20,
  },
  axisText: {
    fontSize: 11,
    color: '#bbb',
  },
  barsArea: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    paddingBottom: 25,
  },
  barColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 35,
  },
  bar: {
    width: 28,
    backgroundColor: GOLD,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  emptyMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },
  emptyText: {
    color: '#bbb',
    fontSize: 13,
    fontStyle: 'italic',
  },
  doughnutContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  doughnutOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 25,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doughnutInner: {
    alignItems: 'center',
  },
  doughnutCenterText: {
    fontSize: 22,
    fontWeight: '700',
    color: NAVY,
  },
  doughnutCenterLabel: {
    fontSize: 11,
    color: '#999',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#777',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  activityEmpty: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  activityEmptyText: {
    fontSize: 15,
    color: '#999',
    marginTop: 12,
  },
  activityEmptySubtext: {
    fontSize: 13,
    color: '#ccc',
    marginTop: 4,
  },
});
