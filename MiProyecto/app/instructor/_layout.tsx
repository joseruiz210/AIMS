import { Slot, useRouter, usePathname } from 'expo-router';
import { View, Text, StyleSheet, Pressable, Image, useWindowDimensions, ScrollView } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

const NAVY_DARK = '#0F1026';
const NAVY_LIGHT = '#1A183B';
const GOLD = '#D4AF37';
const GOLD_LIGHT = 'rgba(212, 175, 55, 0.15)';
const BG_PAGE = '#F8FAFC';

interface MenuItemType {
  name: string;
  path: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export default function InstructorLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [logoutHover, setLogoutHover] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems: MenuItemType[] = [
    { name: 'Inicio', path: '/instructor/inicio', icon: 'home-outline' },
    { name: 'Mis fichas', path: '/instructor/fichas', icon: 'grid-outline' },
    { name: 'Aprendices', path: '/instructor/aprendices', icon: 'people-outline' },
    { name: 'Asistencia', path: '/instructor/asistencia', icon: 'checkbox-outline' },
    { name: 'Calificaciones', path: '/instructor/calificaciones', icon: 'bar-chart-outline' },
    { name: 'Observaciones', path: '/instructor/observaciones', icon: 'chatbubbles-outline' },
    { name: 'Reportes', path: '/instructor/reportes', icon: 'document-text-outline' },
    { name: 'Mensajes', path: '/instructor/mensajes', icon: 'mail-outline' },
    { name: 'Configuración', path: '/instructor/configuracion', icon: 'settings-outline' },
  ];

  const MenuItem = ({ name, path, icon }: MenuItemType) => {
    const isActive = pathname === path || (path === '/instructor/inicio' && pathname === '/instructor');
    const [isHovered, setIsHovered] = useState(false);

    return (
      <Pressable
        onPress={() => {
          setMobileMenuOpen(false);
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

  if (!isDesktop) {
    return (
      <View style={styles.container}>
        {/* Mobile Header Bar */}
        <View style={styles.mobileHeader}>
          <Pressable onPress={() => setMobileMenuOpen(!mobileMenuOpen)} style={styles.hamburgerBtn}>
            <Ionicons name={mobileMenuOpen ? "close" : "menu"} size={26} color={NAVY_DARK} />
          </Pressable>
          
          <View style={styles.mobileHeaderRight}>
            <Pressable 
              style={styles.headerIconWrap}
              onPress={() => router.push('/instructor/notificaciones')}
            >
              <Ionicons name="notifications-outline" size={22} color={NAVY_DARK} />
              <View style={styles.bellDot} />
            </Pressable>
            <Ionicons name="person-circle" size={30} color={NAVY_DARK} />
          </View>
        </View>

        {/* Mobile Drawer Dropdown */}
        {mobileMenuOpen && (
          <View style={styles.mobileDrawer}>
            {menuItems.map((item) => (
              <MenuItem key={item.name} {...item} />
            ))}
            <Pressable 
              style={styles.mobileLogoutBtn}
              onPress={() => {
                setMobileMenuOpen(false);
                router.push('/');
              }}
            >
              <Ionicons name="log-out-outline" size={18} color={GOLD} style={{ marginRight: 8 }} />
              <Text style={styles.mobileLogoutText}>Cerrar Sesión →</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.content}>
          <Slot />
        </View>

        {/* Mobile Bottom Navigation Bar */}
        <View style={styles.mobileNav}>
          <Pressable style={styles.mobileNavItem} onPress={() => router.push('/instructor/inicio')}>
            <Ionicons
              name="home-outline"
              size={18}
              color={(pathname === '/instructor' || pathname === '/instructor/inicio') ? GOLD : '#FFFFFF'}
            />
            <Text style={[(pathname === '/instructor' || pathname === '/instructor/inicio') ? styles.mobileNavTextActive : styles.mobileNavText]}>
              Inicio
            </Text>
          </Pressable>

          <Pressable style={styles.mobileNavItem} onPress={() => router.push('/instructor/aprendices')}>
            <Ionicons
              name="people-outline"
              size={18}
              color={pathname === '/instructor/aprendices' ? GOLD : '#FFFFFF'}
            />
            <Text style={[pathname === '/instructor/aprendices' ? styles.mobileNavTextActive : styles.mobileNavText]}>
              Usuarios
            </Text>
          </Pressable>

          <Pressable style={styles.mobileNavItem} onPress={() => router.push('/instructor/fichas')}>
            <Ionicons
              name="grid-outline"
              size={18}
              color={pathname === '/instructor/fichas' ? GOLD : '#FFFFFF'}
            />
            <Text style={[pathname === '/instructor/fichas' ? styles.mobileNavTextActive : styles.mobileNavText]}>
              Programas
            </Text>
          </Pressable>

          <Pressable style={styles.mobileNavItem} onPress={() => router.push('/instructor/reportes')}>
            <Ionicons
              name="document-text-outline"
              size={18}
              color={pathname === '/instructor/reportes' ? GOLD : '#FFFFFF'}
            />
            <Text style={[pathname === '/instructor/reportes' ? styles.mobileNavTextActive : styles.mobileNavText]}>
              Reportes
            </Text>
          </Pressable>

          <Pressable style={styles.mobileNavItem} onPress={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Ionicons name="ellipsis-horizontal" size={18} color="#FFFFFF" />
            <Text style={styles.mobileNavText}>Más</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Desktop Sidebar */}
      <View style={styles.sidebar}>
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
            onPress={() => router.push('/')}
          >
            <Ionicons name="log-out-outline" size={18} color={logoutHover ? GOLD : 'rgba(255,255,255,0.7)'} style={{ marginRight: 10 }} />
            <Text style={[styles.logoutText, logoutHover && styles.logoutTextHover]}>
              Cerrar Sesión →
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        {/* Header bar on top right for User profile */}
        <View style={styles.desktopHeader}>
          <View style={styles.headerUserSection}>
            <Pressable 
              style={styles.iconBtn}
              onPress={() => router.push('/instructor/notificaciones')}
            >
              <Ionicons name="notifications-outline" size={24} color={NAVY_DARK} />
              <View style={styles.bellDot} />
            </Pressable>
            <View style={styles.userInfoGroup}>
              <Ionicons name="person-circle" size={32} color={NAVY_DARK} />
              <Text style={styles.userName}>Roberto vargas</Text>
            </View>
          </View>
        </View>

        <View style={styles.slotWrap}>
          <Slot />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
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
  iconBtn: {
    padding: 4,
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EF4444',
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  hamburgerBtn: {
    padding: 4,
  },
  mobileHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconWrap: {
    padding: 4,
    position: 'relative',
  },
  mobileDrawer: {
    backgroundColor: NAVY_DARK,
    paddingVertical: 10,
  },
  mobileLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginTop: 8,
  },
  mobileLogoutText: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '600',
  },
  mobileNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: NAVY_DARK,
    paddingVertical: 10,
  },
  mobileNavItem: {
    alignItems: 'center',
    gap: 2,
  },
  mobileNavText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  mobileNavTextActive: {
    color: GOLD,
    fontSize: 11,
    fontWeight: '600',
  },
});
