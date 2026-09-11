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
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import LogoutModal from '../../components/LogoutModal';

const NAVY_DARK = '#0F1026';
const NAVY = NAVY_DARK;
const GOLD = '#D4AF37';
const GOLD_LIGHT = 'rgba(212, 175, 55, 0.15)';

const menuItems = [
  { name: 'Inicio', path: '/aprendiz', icon: 'home-outline' as const },
  { name: 'Tareas', path: '/aprendiz/tareas', icon: 'clipboard-outline' as const },
  { name: 'Mi horario', path: '/aprendiz/horario', icon: 'calendar-outline' as const },
  { name: 'Asistencia', path: '/aprendiz/asistencia', icon: 'checkbox-outline' as const },
  { name: 'Calificaciones', path: '/aprendiz/calificaciones', icon: 'bar-chart-outline' as const },
  { name: 'Observaciones', path: '/aprendiz/observaciones', icon: 'chatbubbles-outline' as const },
  { name: 'Notificaciones', path: '/aprendiz/notificaciones', icon: 'notifications-outline' as const },
  { name: 'Documentos', path: '/aprendiz/documentos', icon: 'document-text-outline' as const },
  { name: 'Configuración', path: '/aprendiz/configuracion', icon: 'settings-outline' as const },
];

const bottomNavItems = [
  { name: 'Inicio', path: '/aprendiz', icon: 'home-outline' as const },
  { name: 'Tareas', path: '/aprendiz/tareas', icon: 'clipboard-outline' as const },
  { name: 'Notas', path: '/aprendiz/calificaciones', icon: 'bar-chart-outline' as const },
  { name: 'Horario', path: '/aprendiz/horario', icon: 'calendar-outline' as const },
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
        <View style={styles.iconContainer}>
          <Ionicons
            name={isActive ? (icon.replace('-outline', '') as any) : icon}
            size={18}
            color={isActive ? '#FFFFFF' : GOLD}
          />
        </View>
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
        <View style={styles.roleBadge}>
          <Text style={styles.roleSubtitle}>Aprendiz</Text>
        </View>
      </View>

      {/* Menu */}
      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => (
          <MenuItem key={item.name} name={item.name} path={item.path} icon={item.icon} />
        ))}
      </ScrollView>

      {/* Logout */}
      <View style={styles.logoutSection}>
        <Pressable
          style={[styles.logoutBtn, logoutHover && styles.logoutBtnHover]}
          onPress={onLogout}
          onHoverIn={() => setLogoutHover(true)}
          onHoverOut={() => setLogoutHover(false)}
        >
          <Ionicons
            name="log-out-outline"
            size={18}
            color={logoutHover ? GOLD : 'rgba(255,255,255,0.7)'}
            style={{ marginRight: 10 }}
          />
          <Text style={[styles.logoutText, logoutHover && styles.logoutTextHover]}>
            Cerrar Sesión →
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function AprendizLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const { logout } = useAuth();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
              onPress={() => router.push('/aprendiz/notificaciones' as any)}
            >
              <Ionicons name="notifications-outline" size={22} color={NAVY} />
              <View style={styles.headerBadge} />
            </Pressable>
            <Pressable
              style={styles.headerIconBtn}
              onPress={() => router.push('/aprendiz/configuracion' as any)}
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
    width: 230,
    backgroundColor: NAVY_DARK,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.05)',
  },
  sidebarInner: {
    flex: 1,
    flexDirection: 'column',
    height: '100%',
  },
  logoSection: {
    paddingTop: 20,
    paddingBottom: 14,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    marginBottom: 8,
  },
  logoWrapper: {
    width: 100,
    height: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 100,
    height: 75,
  },
  roleBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  roleSubtitle: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  menuContainer: {
    flex: 1,
    paddingVertical: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginHorizontal: 10,
    borderRadius: 8,
    marginVertical: 2,
  },
  menuItemActive: {
    backgroundColor: GOLD,
  },
  menuItemHover: {
    backgroundColor: GOLD_LIGHT,
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 10,
  },
  menuText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    fontWeight: '400',
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
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  logoutBtnHover: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  logoutText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
  },
  logoutTextHover: {
    color: GOLD,
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
    color: NAVY_DARK,
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
  headerBadge: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  // Mobile bottom nav
  mobileNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: NAVY_DARK,
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
    width: 240,
    backgroundColor: NAVY_DARK,
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



