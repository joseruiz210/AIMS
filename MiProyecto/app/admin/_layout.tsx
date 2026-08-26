import { Slot, useRouter, usePathname } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  useWindowDimensions,
  ScrollView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import LogoutModal from '../../components/LogoutModal';

const NAVY = '#12103C';
const GOLD = '#cfa235';
const GOLD_LIGHT = 'rgba(207, 162, 53, 0.15)';

const menuItems = [
  { name: 'Inicio', path: '/admin', icon: 'home-outline' as const },
  { name: 'Usuarios', path: '/admin/usuarios', icon: 'people-outline' as const },
  { name: 'Programas', path: '/admin/programas', icon: 'book-outline' as const },
  { name: 'Fichas', path: '/admin/fichas', icon: 'folder-open-outline' as const },
  { name: 'Aprendices', path: '/admin/aprendices', icon: 'school-outline' as const },
  { name: 'Instructores', path: '/admin/instructores', icon: 'briefcase-outline' as const },
  { name: 'Matrículas', path: '/admin/matriculas', icon: 'document-text-outline' as const },
  { name: 'Asistencia', path: '/admin/asistencia', icon: 'checkmark-circle-outline' as const },
  { name: 'Calificación', path: '/admin/calificaciones', icon: 'star-outline' as const },
  { name: 'Comunicación', path: '/admin/comunicacion', icon: 'chatbubbles-outline' as const },
  { name: 'Reportes', path: '/admin/reportes', icon: 'stats-chart-outline' as const },
  { name: 'Configuración', path: '/admin/configuracion', icon: 'settings-outline' as const },
];

const bottomNavItems = [
  { name: 'Inicio', path: '/admin', icon: 'home-outline' as const },
  { name: 'Usuarios', path: '/admin/usuarios', icon: 'people-outline' as const },
  { name: 'Reportes', path: '/admin/reportes', icon: 'stats-chart-outline' as const },
  { name: 'Config', path: '/admin/configuracion', icon: 'settings-outline' as const },
];

function SidebarContent({
  pathname,
  router,
  onClose,
  onLogout,
}: {
  pathname: string;
  router: any;
  onClose?: () => void;
  onLogout: () => void;
}) {
  const [logoutHover, setLogoutHover] = useState(false);

  const MenuItem = ({ name, path, icon }: { name: string; path: string; icon: any }) => {
    const isActive = pathname === path;
    const [isHovered, setIsHovered] = useState(false);

    return (
      <Pressable
        onPress={() => {
          router.push(path as any);
          onClose?.();
        }}
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

  return (
    <View style={styles.sidebarInner}>
      {/* Logo + role section */}
      <View style={styles.logoSection}>
        <View style={styles.logoWrapper}>
          <Image
            source={require('../../assets/images/logo.jpeg')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.roleSubtitle}>Administrador</Text>
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
          onPress={onLogout}
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
  );
}

export default function AdminLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const { user, isLoading, logout } = useAuth();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && user && user.role !== 'ADMIN') {
      router.replace('/');
    }
  }, [isLoading, router, user]);

  if (isLoading || (user && user.role !== 'ADMIN')) {
    return <View style={styles.container} />;
  }

  if (!isDesktop) {
    return (
      <View style={styles.mobileContainer}>
        {/* Mobile Header */}
        <View style={styles.mobileHeader}>
          <Pressable style={styles.hamburgerBtn} onPress={() => setDrawerOpen(true)}>
            <Ionicons name="menu" size={26} color={NAVY} />
          </Pressable>
          <Text style={styles.mobileHeaderTitle}>AIMS</Text>
          <View style={styles.mobileHeaderRight}>
            <Pressable
              style={styles.headerIconBtn}
              onPress={() => router.push('/admin/configuracion' as any)}
            >
              <Ionicons name="person-circle" size={28} color={NAVY} />
            </Pressable>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Slot />
        </View>

        {/* Bottom Tab Nav */}
        <View style={styles.mobileNav}>
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Pressable
                key={item.path}
                style={styles.mobileNavItem}
                onPress={() => router.push(item.path as any)}
              >
                <Ionicons
                  name={isActive ? (item.icon.replace('-outline', '') as any) : item.icon}
                  size={22}
                  color={isActive ? GOLD : 'rgba(255,255,255,0.6)'}
                />
                <Text style={[styles.mobileNavText, isActive && styles.mobileNavTextActive]}>
                  {item.name}
                </Text>
              </Pressable>
            );
          })}
          <Pressable style={styles.mobileNavItem} onPress={() => setShowLogoutModal(true)}>
            <Ionicons name="log-out-outline" size={22} color="rgba(255,255,255,0.6)" />
            <Text style={styles.mobileNavText}>Salir</Text>
          </Pressable>
        </View>

        {/* Drawer Overlay */}
        <Modal
          visible={drawerOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setDrawerOpen(false)}
        >
          <View style={styles.drawerOverlay}>
            <TouchableOpacity
              style={styles.drawerBackdrop}
              activeOpacity={1}
              onPress={() => setDrawerOpen(false)}
            />
            <View style={styles.drawerPanel}>
              {/* Close button */}
              <Pressable style={styles.drawerClose} onPress={() => setDrawerOpen(false)}>
                <Ionicons name="close" size={24} color="rgba(255,255,255,0.7)" />
              </Pressable>
              <SidebarContent
                pathname={pathname}
                router={router}
                onClose={() => setDrawerOpen(false)}
                onLogout={() => {
                  setDrawerOpen(false);
                  setShowLogoutModal(true);
                }}
              />
            </View>
          </View>
        </Modal>

        <LogoutModal
          visible={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={() => {
            setShowLogoutModal(false);
            logout();
          }}
        />
      </View>
    );
  }

  // Desktop layout
  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <SidebarContent
          pathname={pathname}
          router={router}
          onLogout={() => setShowLogoutModal(true)}
        />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Slot />
      </View>

      <LogoutModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          logout();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F4F6F9',
  },
  mobileContainer: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F4F6F9',
  },
  // Sidebar (desktop only)
  sidebar: {
    width: 260,
    backgroundColor: NAVY,
    height: '100%',
  },
  sidebarInner: {
    flex: 1,
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
    backgroundColor: '#F4F6F9',
  },
  // Mobile header
  mobileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  hamburgerBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F4F6F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: NAVY,
    letterSpacing: 3,
  },
  mobileHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    position: 'relative',
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F4F6F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Mobile bottom nav
  mobileNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: NAVY,
    paddingVertical: 10,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  mobileNavItem: {
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
  },
  mobileNavText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  mobileNavTextActive: {
    color: GOLD,
    fontWeight: '700',
  },
  // Drawer overlay
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawerPanel: {
    width: 280,
    backgroundColor: NAVY,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 16,
    flexDirection: 'column',
  },
  drawerClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
