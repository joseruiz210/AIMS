import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const roleLabel = user?.role === 'APRENDIZ' ? 'Aprendiz' : 'Instructor';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Ionicons name="school-outline" size={28} color="#FFFFFF" />
        </View>
        <Pressable onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color="#12103C" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={styles.eyebrow}>Plataforma AIMS</Text>
        <Text style={styles.title}>Hola, {user?.nombre || 'usuario'}</Text>
        <Text style={styles.subtitle}>Has iniciado sesión como {roleLabel}.</Text>

        <View style={styles.roleCard}>
          <View style={styles.roleIcon}>
            <Ionicons name={user?.role === 'APRENDIZ' ? 'book-outline' : 'people-outline'} size={30} color="#CFA235" />
          </View>
          <View style={styles.roleInfo}>
            <Text style={styles.cardTitle}>Área de {roleLabel}</Text>
            <Text style={styles.cardText}>
              Tu cuenta está activa. Desde aquí podrás consultar la información asignada a tu perfil.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Próximamente</Text>
        <View style={styles.emptyState}>
          <Ionicons name="construct-outline" size={34} color="#CFA235" />
          <Text style={styles.emptyTitle}>Estamos preparando tu espacio</Text>
          <Text style={styles.emptyText}>Las funciones de tu rol aparecerán aquí.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },
  header: {
    backgroundColor: '#12103C',
    paddingHorizontal: 28,
    paddingVertical: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#CFA235',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  logoutText: {
    color: '#12103C',
    fontWeight: '600',
  },
  content: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    padding: 30,
  },
  eyebrow: {
    color: '#CFA235',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: '#12103C',
    fontSize: 30,
    fontWeight: '700',
    marginTop: 8,
  },
  subtitle: {
    color: '#667085',
    fontSize: 16,
    marginTop: 8,
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    shadowColor: '#12103C',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  roleIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF8E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleInfo: {
    flex: 1,
  },
  cardTitle: {
    color: '#12103C',
    fontSize: 19,
    fontWeight: '700',
  },
  cardText: {
    color: '#667085',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  sectionTitle: {
    color: '#12103C',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 34,
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 28,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#12103C',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyText: {
    color: '#667085',
    fontSize: 14,
    marginTop: 6,
  },
});
