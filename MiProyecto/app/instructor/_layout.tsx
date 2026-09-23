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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import LogoutModal from '../../components/LogoutModal';

const NAVY_DARK = '#0F1026';
const NAVY = NAVY_DARK;
const GOLD = '#D4AF37';
const GOLD_LIGHT = 'rgba(212, 175, 55, 0.15)';
const BG_PAGE = '#F8FAFC';

interface MenuItemType {
  name: string;
  path: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const menuItems: MenuItemType[] = [
  { name: 'Inicio', path: '/instructor/inicio', icon: 'home-outline' },
  { name: 'Mis Fichas', path: '/instructor/fichas', icon: 'grid-outline' },
  { name: 'Actividades', path: '/instructor/actividades', icon: 'folder-open-outline' },
  { name: 'Aprendices', path: '/instructor/aprendices', icon: 'people-outline' },
  { name: 'Matrículas', path: '/instructor/matriculas', icon: 'id-card-outline' },
  { name: 'Asistencia', path: '/instructor/asistencia', icon: 'checkbox-outline' },
  { name: 'Calificaciones', path: '/instructor/calificaciones', icon: 'bar-chart-outline' },
  { name: 'Observaciones', path: '/instructor/observaciones', icon: 'chatbubbles-outline' },
  { name: 'Reportes', path: '/instructor/reportes', icon: 'document-text-outline' },
  { name: 'Mensajes', path: '/instructor/mensajes', icon: 'mail-outline' },
  { name: 'Notificaciones', path: '/instructor/notificaciones', icon: 'notifications-outline' },
  { name: 'Configuración', path: '/instructor/configuracion', icon: 'settings-outline' },
];

const bottomNavItems = [
  { name: 'Inicio', path: '/instructor/inicio', icon: 'home-outline' as const },
  { name: 'Fichas', path: '/instructor/fichas', icon: 'grid-outline' as const },
  { name: 'Actividades', path: '/instructor/actividades', icon: 'folder-open-outline' as const },
  { name: 'Asistencia', path: '/instructor/asistencia', icon: 'checkbox-outline' as const },
];

function SidebarContent({
  pathname,
  router,
  userName,
  onClose,
  onLogout,
}: {
  pathname: string;
  router: any;
  userName: string;
  onClose?: () => void;
  onLogout: () => void;
}) {
  const [logoutHover, setLogoutHover] = useState(false);

  const MenuItem = ({ name, path, icon }: MenuItemType) => {
    const isActive = pathname === path || (path === '/instructor/inicio' && pathname === '/instructor');
    const [isHovered, setIsHovered] = useState(false);

    return (
      <Pressable
        onPress={() => {
          onClose?.();
          router.push(path as any);
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
          <Text style={styles.roleSubtitle}>Instructor</Text>
        </View>
        {userName ? (
          <Text style={styles.sidebarUserName} numberOfLines={1}>
            {userName}
          </Text>
        ) : null}
      </View>

      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => (
          <MenuItem key={item.name} {...item} />
        ))}
      </ScrollView>

      <View style={styles.logoutSection}>
        <Pressable
          style={[styles.logoutBtn, logoutHover && styles.logoutBtnHover]}
          onHoverIn={() => setLogoutHover(true)}
          onHoverOut={() => setLogoutHover(false)}
          onPress={onLogout}
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

export default function InstructorLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const { logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userName, setUserName] = useState('Instructor');

  useEffect(() => {
    authService.checkSession().then(({ user }) => {
      if (user) {
        const nombre = (user as any).firstName
          ? `${(user as any).firstName} ${(user as any).lastName || ''}`.trim()
          : user.nombre || 'Instructor';
        setUserName(nombre);
      }
    }).catch(() => {});
  }, []);

  if (!isDesktop) {
    return (
      <SafeAreaView style={styles.mobileContainer} edges={['top', 'bottom', 'left', 'right']}>
        {/* Mobile Header Bar */}
        <View style={styles.mobileHeader}>
          <Pressable onPress={() => setDrawerOpen(true)} style={styles.hamburgerBtn}>
            <Ionicons name="menu" size={26} color={NAVY_DARK} />
          </Pressable>
          
          <View style={styles.mobileHeaderCenter}>
            <Text style={styles.mobileHeaderTitle}>AIMS</Text>
            <Text style={styles.mobileHeaderSubtitle}>Panel Instructor</Text>
          </View>

          <View style={styles.mobileHeaderRight}>
            <Ionicons name="person-circle" size={30} color={NAVY_DARK} />
          </View>
        </View>

        {/* Content View */}
        <View style={styles.content}>
          <Slot />
        </View>

        {/* Mobile Bottom Navigation Bar */}
        <View style={styles.mobileNav}>
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.path || (item.path === '/instructor/inicio' && pathname === '/instructor');
            return (
              <Pressable
                key={item.path}
                style={styles.mobileNavItem}
                onPress={() => router.push(item.path as any)}
              >
                <Ionicons
                  name={isActive ? (item.icon.replace('-outline', '') as any) : item.icon}
                  size={20}
                  color={isActive ? GOLD : 'rgba(255,255,255,0.7)'}
                />
                <Text style={[styles.mobileNavText, isActive && styles.mobileNavTextActive]}>
                  {item.name}
                </Text>
              </Pressable>
            );
          })}

          <Pressable style={styles.mobileNavItem} onPress={() => setDrawerOpen(true)}>
            <Ionicons name="ellipsis-horizontal" size={20} color="rgba(255,255,255,0.7)" />
            <Text style={styles.mobileNavText}>Más</Text>
          </Pressable>
        </View>

        {/* Mobile Drawer Modal */}
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
              <Pressable style={styles.drawerClose} onPress={() => setDrawerOpen(false)}>
                <Ionicons name="close" size={24} color="rgba(255,255,255,0.7)" />
              </Pressable>
              <SidebarContent
                pathname={pathname}
                router={router}
                userName={userName}
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
      </SafeAreaView>
    );
  }

  // Desktop Layout
  return (
    <View style={styles.container}>
      {/* Desktop Sidebar */}
      <View style={styles.sidebar}>
        <SidebarContent
          pathname={pathname}
          router={router}
          userName={userName}
          onLogout={() => setShowLogoutModal(true)}
        />
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        <View style={styles.desktopHeader}>
          <View style={styles.headerUserSection}>
            <View style={styles.userInfoGroup}>
              <Ionicons name="person-circle" size={28} color={GOLD} />
              <Text style={styles.userName}>{userName}</Text>
            </View>
          </View>
        </View>

        <View style={styles.slotWrap}>
          <Slot />
        </View>
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
    backgroundColor: BG_PAGE,
  },
  mobileContainer: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: BG_PAGE,
  },
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
  sidebarUserName: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 6,
    paddingHorizontal: 12,
    textAlign: 'center',
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
    backgroundColor: BG_PAGE,
  },
  desktopHeader: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 28,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerUserSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  userInfoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  slotWrap: {
    flex: 1,
  },
  // Mobile styles
  mobileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  hamburgerBtn: {
    padding: 6,
  },
  mobileHeaderCenter: {
    alignItems: 'center',
  },
  mobileHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: NAVY_DARK,
    letterSpacing: 1,
  },
  mobileHeaderSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  mobileHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Mobile bottom nav
  mobileNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: NAVY_DARK,
    paddingVertical: 8,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  mobileNavItem: {
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
  },
  mobileNavText: {
    color: 'rgba(255,255,255,0.65)',
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
    width: 250,
    backgroundColor: NAVY_DARK,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 999,
  },
  drawerClose: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 1000,
    padding: 6,
  },
});

