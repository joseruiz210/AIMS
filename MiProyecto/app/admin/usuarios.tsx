import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NAVY = '#12103C';
const GOLD = '#cfa235';

export default function UsuariosAdmin() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const statCards = [
    { title: 'ADMINISTRADORES', value: '0', subtitle: 'ACTIVOS', icon: 'shield-outline' as const },
    { title: 'INSTRUCTORES', value: '0', subtitle: 'ACTIVOS', icon: 'person-outline' as const },
    { title: 'APRENDICES', value: '0', subtitle: 'MATRICULADOS', icon: 'school-outline' as const },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.subtitle}>Gestión de</Text>
          <Text style={styles.title}>Usuarios</Text>
        </View>
        <Pressable style={styles.newButton}>
          <Ionicons name="add" size={18} color="#FFF" />
          <Text style={styles.newButtonText}>Nuevo</Text>
        </Pressable>
      </View>

      <View style={styles.cardsContainer}>
        {statCards.map((card, index) => (
          <View key={index} style={[styles.card, !isDesktop && styles.mobileCard]}>
            <View style={styles.cardRow}>
              <View style={styles.cardIconWrap}>
                <Ionicons name={card.icon} size={22} color={GOLD} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <View style={styles.cardValueRow}>
                  <Text style={styles.cardValue}>{card.value}</Text>
                  <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.tableContainer}>
        <View style={styles.filters}>
          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={18} color="#999" style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, !isDesktop && styles.mobileSearchInput]}
              placeholder="Buscar por nombre, correo o rol"
              placeholderTextColor="#999"
            />
          </View>
          <View style={[styles.dropdown, !isDesktop && styles.mobileDropdown]}>
            <Text style={styles.dropdownText}>Todos los roles</Text>
            <Ionicons name="chevron-down" size={16} color="#999" />
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>NOMBRE</Text>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>ROL</Text>
            <Text style={[styles.tableHeaderText, { flex: 3 }]}>CORREO</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>ESTADO</Text>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>ACCIONES</Text>
          </View>

          {/* Empty state */}
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={44} color="#D0D0D0" />
            <Text style={styles.emptyTitle}>No hay usuarios registrados</Text>
            <Text style={styles.emptySubtext}>Presiona + Nuevo para agregar el primer usuario</Text>
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
  content: {
    padding: 30,
    paddingBottom: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: NAVY,
  },
  newButton: {
    backgroundColor: GOLD,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    gap: 6,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  newButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 28,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    flex: 1,
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  mobileCard: {
    minWidth: '100%',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cardIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(207, 162, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  cardValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  cardValue: {
    fontSize: 26,
    fontWeight: '700',
    color: GOLD,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#aaa',
  },
  tableContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  filters: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F6F9',
    borderRadius: 10,
    paddingHorizontal: 14,
    flex: 2,
    minWidth: 200,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  mobileSearchInput: {
    minWidth: '100%',
  },
  dropdown: {
    backgroundColor: '#F4F6F9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minWidth: 150,
  },
  mobileDropdown: {
    flex: 1,
    minWidth: '100%',
  },
  dropdownText: {
    color: '#888',
    fontSize: 14,
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    paddingBottom: 12,
    marginBottom: 10,
  },
  tableHeaderText: {
    fontSize: 11,
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#999',
    fontSize: 16,
    marginTop: 14,
    fontWeight: '500',
  },
  emptySubtext: {
    color: '#ccc',
    fontSize: 13,
    marginTop: 6,
  },
});
