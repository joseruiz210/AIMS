import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NAVY = '#12103C';
const GOLD = '#cfa235';

const competencias = [
  { nombre: 'Analisis de Datos', nota: 4.5, max: 5 },
  { nombre: 'POO', nota: 4.0, max: 5 },
  { nombre: 'Requisitos', nota: 3.8, max: 5 },
  { nombre: 'Programación BD', nota: 4.2, max: 5 },
];

const statCards = [
  { label: 'PROMEDIO', value: '4.0', highlight: true },
  { label: 'ASISTENCIA', value: '96%', highlight: true },
  { label: 'MATERIAS', value: '6', highlight: false },
];

export default function AprendizHome() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header greeting + bell */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bienvenida,</Text>
          <Text style={styles.name}>Maria Torres</Text>
        </View>
        <View style={styles.headerActions}>
          <View style={styles.bellWrap}>
            <Ionicons name="notifications-outline" size={24} color={NAVY} />
            <View style={styles.bellBadge} />
          </View>
        </View>
      </View>

      {/* Stat Cards */}
      <View style={styles.statsRow}>
        {statCards.map((card, i) => (
          <View key={i} style={[styles.statCard, !isDesktop && styles.statCardMobile]}>
            <Text style={[styles.statValue, card.highlight && styles.statValueGold]}>
              {card.value}
            </Text>
            <Text style={styles.statLabel}>{card.label}</Text>
          </View>
        ))}
      </View>

      {/* Mis Competencias */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>MIS COMPETENCIAS</Text>

        {competencias.map((comp, i) => (
          <View key={i} style={styles.compRow}>
            <Text style={styles.compNombre}>{comp.nombre}</Text>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${(comp.nota / comp.max) * 100}%` as any }]} />
            </View>
            <Text style={styles.compNota}>{comp.nota.toFixed(1)}</Text>
          </View>
        ))}
      </View>

      {/* Próximas clases */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>PRÓXIMAS CLASES HOY</Text>
        <View style={styles.emptyCard}>
          <Ionicons name="calendar-outline" size={38} color="#D0D0D0" />
          <Text style={styles.emptyText}>Sin clases programadas</Text>
        </View>
      </View>

      {/* Notificaciones recientes */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>NOTIFICACIONES RECIENTES</Text>
        <View style={styles.emptyCard}>
          <Ionicons name="notifications-outline" size={38} color="#D0D0D0" />
          <Text style={styles.emptyText}>No hay notificaciones nuevas</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 28,
    paddingBottom: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#888',
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: NAVY,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellWrap: {
    position: 'relative',
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F4F6F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 28,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: '#E8E8E8',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  statCardMobile: {
    minWidth: '28%',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: NAVY,
    marginBottom: 4,
  },
  statValueGold: {
    color: GOLD,
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#E8E8E8',
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    color: '#888',
    letterSpacing: 1,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  compRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  compNombre: {
    width: 140,
    fontSize: 14,
    color: '#333',
  },
  barBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#CDCDCD',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: GOLD,
    borderRadius: 4,
  },
  compNota: {
    width: 32,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#aaa',
    fontStyle: 'italic',
  },
});
