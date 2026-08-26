import { Slot, useRouter, usePathname } from 'expo-router';
import { View, Text, StyleSheet, Pressable, Image, useWindowDimensions, ScrollView } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

const NAVY = '#12103C';
const GOLD = '#cfa235';
const GOLD_LIGHT = 'rgba(207, 162, 53, 0.15)';

export default function AprendizLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [logoutHover, setLogoutHover] = useState(false);

  const menuItems = [
    { name: 'Inicio', path: '/aprendiz', icon: 'home-outline' as const },
    { name: 'Mi horario', path: '/aprendiz/horario', icon: 'calendar-outline' as const },
    { name: 'Asistencia', path: '/aprendiz/asistencia', icon: 'checkmark-circle-outline' as const },
    { name: 'Calificaciones', path: '/aprendiz/calificaciones', icon: 'star-outline' as const },
    { name: 'Observaciones', path: '/aprendiz/observaciones', icon: 'eye-outline' as const },
    { name: 'Notificaciones', path: '/aprendiz/notificaciones', icon: 'notifications-outline' as const },
    { name: 'Documentos', path: '/aprendiz/documentos', icon: 'document-text-outline' as const },
    { name: 'Configuración', path: '/aprendiz/configuracion', icon: 'settings-outline' as const },
  ];

  const MenuItem = ({ name, path, icon }: { name: string; path: string; icon: any }) => {
    const isActive = pathname === path;
    const [isHovered, setIsHovered] = useState(false);

    return (
      <Pressable
        onPress={() => router.push(path as any)}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        style={[
          styles.menuItem,
          isActive && styles.menuItemActive,
          isHovered && !isActive && styles.menuItemHover,
        ]}
      >
        <Ionicons
          name={isActive ? (icon.replace('-outline', '') as any) : icon}
          size={18}
          color={isActive ? '#FFFFFF' : 'rgba(255,255,255,0.7)'}
          style={{ marginRight: 12 }}
        />
        <Text
          style={[
            styles.menuText,
            isActive && styles.menuTextActive,
            isHovered && !isActive && styles.menuTextHover,
          ]}
        >
          {name}
        </Text>
      </Pressable>
    );
  };

  if (!isDesktop) {
    return (
      <View style={styles.container}>
        <View style={styles.mobileHeader}>
          <Ionicons name="menu" size={28} color={NAVY} />
          <View style={styles.mobileHeaderRight}>
            <Ionicons name="notifications-outline" size={22} color={NAVY} style={{ marginRight: 15 }} />
            <Ionicons name="person-circle" size={30} color={NAVY} />
          </View>
        </View>

        <View style={styles.content}>
          <Slot />
        </View>

        <View style={styles.mobileNav}>
          <Pressable style={styles.mobileNavItem} onPress={() => router.push('/aprendiz' as any)}>
            <Text style={styles.mobileNavText}>Inicio</Text>
          </Pressable>
          <Pressable style={styles.mobileNavItem} onPress={() => router.push('/aprendiz/horario' as any)}>
            <Text style={styles.mobileNavText}>Horario</Text>
          </Pressable>
          <Pressable style={styles.mobileNavItem} onPress={() => router.push('/aprendiz/asistencia' as any)}>
            <Text style={styles.mobileNavText}>Asistencia</Text>
          </Pressable>
          <Pressable style={styles.mobileNavItem} onPress={() => router.push('/aprendiz/calificaciones' as any)}>
            <Text style={styles.mobileNavText}>Notas</Text>
          </Pressable>
          <Pressable style={styles.mobileNavItem}>
            <Text style={styles.mobileNavText}>Más</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        {/* Logo + role section */}
        <View style={styles.logoSection}>
          <View style={styles.logoWrapper}>
            <Image
              source={require('../../assets/images/logo.jpeg')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.roleSubtitle}>Aprendiz</Text>
          <View style={styles.divider} />
        </View>

        {/* Menu */}
        <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
          {menuItems.map((item) => (
            <MenuItem key={item.name} name={item.name} path={item.path} icon={item.icon} />
          ))}
        </ScrollView>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <View style={styles.divider} />
          <Pressable
            style={[styles.logoutBtn, logoutHover && styles.logoutBtnHover]}
            onHoverIn={() => setLogoutHover(true)}
            onHoverOut={() => setLogoutHover(false)}
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color={logoutHover ? '#FF4444' : 'rgba(255,255,255,0.7)'}
              style={{ marginRight: 10 }}
            />
            <Text style={[styles.logoutText, logoutHover && styles.logoutTextHover]}>
              Cerrar Sesión
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  sidebar: {
    width: 260,
    backgroundColor: NAVY,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  logoSection: {
    paddingTop: 24,
    paddingBottom: 8,
    alignItems: 'center',
  },
  logoWrapper: {
    width: 130,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 130,
    height: 110,
  },
  roleSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
    fontSize: 14,
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 4,
    width: '80%',
  },
  menuContainer: {
    flex: 1,
    paddingVertical: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 28,
    marginHorizontal: 10,
    borderRadius: 8,
    marginVertical: 1,
  },
  menuItemActive: {
    backgroundColor: GOLD,
  },
  menuItemHover: {
    backgroundColor: GOLD_LIGHT,
  },
  menuText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
  },
  menuTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  menuTextHover: {
    color: '#FFFFFF',
  },
  logoutSection: {
    paddingBottom: 20,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginHorizontal: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  logoutBtnHover: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  logoutText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
  },
  logoutTextHover: {
    color: '#FF4444',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Mobile styles
  mobileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  mobileHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mobileNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: NAVY,
    paddingVertical: 15,
  },
  mobileNavItem: {
    alignItems: 'center',
  },
  mobileNavText: {
    color: GOLD,
    fontSize: 14,
  },
});
