import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useCallback } from 'react';
import { adminService, AdminUser } from '../../services/adminService';
import ActionModal from '../../components/ActionModal';

const NAVY = '#12103C';
const GOLD = '#cfa235';

export default function UsuariosAdmin() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [counts, setCounts] = useState({ admin: 0, instructor: 0, aprendiz: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [list, admins, instructores, aprendices] = await Promise.all([
        adminService.getUsers({ search }),
        adminService.countByRole('ADMIN'),
        adminService.countByRole('INSTRUCTOR'),
        adminService.countByRole('APRENDIZ'),
      ]);
      setUsers(list.users);
      setCounts({ admin: admins, instructor: instructores, aprendiz: aprendices });
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(loadData, 400); // debounce del buscador
    return () => clearTimeout(timeout);
  }, [loadData]);

  const statCards = [
    { title: 'ADMINISTRADORES', value: String(counts.admin), subtitle: 'ACTIVOS', icon: 'shield-outline' as const },
    { title: 'INSTRUCTORES', value: String(counts.instructor), subtitle: 'ACTIVOS', icon: 'person-outline' as const },
    { title: 'APRENDICES', value: String(counts.aprendiz), subtitle: 'MATRICULADOS', icon: 'school-outline' as const },
  ];

  const handleCreateUser = async (values: Record<string, string>) => {
    const nombreCompleto = values['Nombre Completo'] || 'Nuevo Usuario';
    const email = values['Correo Institucional'] || `user_${Date.now()}@sena.edu.co`;
    const rolInput = (values['Rol del Usuario'] || 'APRENDIZ').trim().toUpperCase();
    const role: 'ADMIN' | 'INSTRUCTOR' | 'APRENDIZ' = ['ADMIN', 'INSTRUCTOR', 'APRENDIZ'].includes(rolInput)
      ? (rolInput as any)
      : 'APRENDIZ';

    const parts = nombreCompleto.trim().split(' ');
    const firstName = parts[0] || 'Usuario';
    const lastName = parts.slice(1).join(' ') || 'SENA';

    const newUser: AdminUser = {
      id: String(Date.now()),
      firstName,
      lastName,
      email,
      role,
      isActive: true,
    };

    setUsers((prev) => [newUser, ...prev]);
    setCounts((prev) => ({
      ...prev,
      [role.toLowerCase()]: (prev[role.toLowerCase() as keyof typeof prev] || 0) + 1,
    }));

    try {
      await adminService.createUser({
        firstName,
        lastName,
        email,
        role,
      });
    } catch {
      // Guardado local
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.subtitle}>Gestión de</Text>
          <Text style={styles.title}>Usuarios</Text>
        </View>
        <Pressable style={styles.newButton} onPress={() => setModalVisible(true)}>
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
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>NOMBRE</Text>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>ROL</Text>
            <Text style={[styles.tableHeaderText, { flex: 3 }]}>CORREO</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>ESTADO</Text>
          </View>

          {loading ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#888' }}>Cargando usuarios...</Text>
            </View>
          ) : users.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#888' }}>No se encontraron usuarios</Text>
            </View>
          ) : (
            users.map((u) => (
              <View key={u.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2, fontWeight: '600' }]}>
                  {u.firstName} {u.lastName}
                </Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>{u.role}</Text>
                <Text style={[styles.tableCell, { flex: 3, color: '#666' }]}>{u.email}</Text>
                <Text style={[styles.tableCell, { flex: 1.5, color: u.isActive ? '#10B981' : '#EF4444', fontWeight: '600' }]}>
                  {u.isActive ? 'Activo' : 'Inactivo'}
                </Text>
              </View>
            ))
          )}
        </View>
      </View>

      <ActionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreateUser}
        title="Crear Nuevo Usuario"
        subtitle="Gestión de Accesos a la Plataforma AIMS"
        iconName="person-add-outline"
        confirmText="Registrar Usuario"
        fields={[
          { label: 'Nombre Completo', placeholder: 'Ej: Valentina Torres' },
          { label: 'Correo Institucional', placeholder: 'Ej: v.torres@sena.edu.co' },
          { label: 'Rol del Usuario', placeholder: 'APRENDIZ / INSTRUCTOR / ADMIN' },
          { label: 'Ficha o Área Asignada', placeholder: 'Ej: 2845671 o Coordinación Académica' },
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
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tableCell: {
    fontSize: 13,
    color: '#333',
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
