import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Image,

  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;


  const goToLogin = () => {
    router.push({ pathname: '/auth', params: { mode: 'login' } });
  };

  const goToRegister = () => {
    router.push({ pathname: '/auth', params: { mode: 'register' } });
  };



  return (
    <View style={styles.outerContainer}>
      {/* Background Gradient Dark Academia & Deep Midnight */}
      <LinearGradient
        colors={['#020308', '#050B1C', '#0A122E', '#060B1E', '#020308']}
        locations={[0, 0.22, 0.55, 0.82, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient Glows */}
      <View style={[styles.glowOrb, styles.goldGlowTop]} />
      <View style={[styles.glowOrb, styles.blueGlowCenter]} />
      <View style={[styles.glowOrb, styles.amberGlowBottom]} />
      <View style={[styles.glowOrb, styles.cyanGlowSide]} />

      {/* Constellation Star Sparkles */}
      <View style={[styles.sparkleDot, { top: '8%', left: '15%' }]} />
      <View style={[styles.sparkleDot, { top: '16%', right: '20%' }]} />
      <View style={[styles.sparkleDot, { top: '34%', left: '8%' }]} />
      <View style={[styles.sparkleDot, { top: '55%', right: '12%' }]} />
      <View style={[styles.sparkleDot, { top: '78%', left: '22%' }]} />
      <View style={[styles.sparkleDot, { top: '88%', right: '28%' }]} />

      <SafeAreaView style={styles.safeArea}>
        {/* Navigation Bar */}
        <View style={styles.navbar}>
          <View style={styles.navBrand}>
            <Image
              source={require('../assets/images/logo.jpeg')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <View style={styles.brandTextGroup}>
              <View style={styles.brandTitleRow}>
                <Text style={styles.brandLogoText}>AIMS</Text>
                <View style={styles.brandBadge}>
                  <Text style={styles.brandBadgeText}>SYSTEM</Text>
                </View>
              </View>
              <Text style={styles.brandSubtitle}>ACADEMIC INTELLIGENT MANAGEMENT</Text>
            </View>
          </View>

          {/* Desktop Nav Links */}
          {isDesktop && (
            <View style={styles.navLinks}>
              {/* Removed Links */}
            </View>
          )}

          {/* Auth Actions Header */}
          <View style={styles.navAuthGroup}>
            {user ? (
              <TouchableOpacity
                style={styles.btnPrimaryNav}
                activeOpacity={0.85}
                onPress={() => {
                  if (user.role === 'ADMIN') router.push('/admin');
                  else if (user.role === 'INSTRUCTOR') router.push('/instructor/inicio');
                  else router.push('/aprendiz');
                }}
              >
                <Ionicons name="person-circle-outline" size={18} color="#0B1228" style={{ marginRight: 6 }} />
                <Text style={styles.btnPrimaryNavText}>MI PANEL</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.btnSecondaryNav}
                  activeOpacity={0.8}
                  onPress={goToRegister}
                >
                  <Text style={styles.btnSecondaryNavText}>Crear Cuenta</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnPrimaryNav}
                  activeOpacity={0.85}
                  onPress={goToLogin}
                >
                  <Text style={styles.btnPrimaryNavText}>Iniciar Sesión</Text>
                  <Ionicons name="arrow-forward" size={16} color="#0B1228" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Main Content Area */}
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* HERO SECTION INSPIRADA EN EL TEMPLATE */}
          <View style={[styles.heroContainer, !isDesktop && styles.heroContainerMobile]}>
            {/* Left Hero Column */}
            <View style={[styles.heroLeft, !isDesktop && styles.heroLeftMobile]}>
              <View style={styles.statusPill}>
                <View style={styles.pulseDot} />
                <Text style={styles.statusPillText}>Sistema de Gestión Académica</Text>
              </View>

              <Text style={styles.heroTitle}>
                Bienvenido(a)<Text style={styles.heroTitleDot}>.</Text>
              </Text>

              <Text style={styles.heroSubtitle}>
                Una plataforma diseñada para facilitar la consulta de tu información. Los aprendices pueden ver su historial académico y asistencias, mientras que los instructores pueden gestionar calificaciones fácilmente.
              </Text>



              {/* Action Buttons */}
              <View style={styles.heroCtaGroup}>
                <TouchableOpacity
                  style={styles.btnGoldPrimary}
                  activeOpacity={0.85}
                  onPress={goToRegister}
                >
                  <LinearGradient
                    colors={['#D4AF37', '#F3E5AB', '#AA7C11']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.btnGradient}
                  >
                    <Text style={styles.btnGoldText}>CREAR CUENTA</Text>
                    <Ionicons name="sparkles" size={16} color="#0A0F26" style={{ marginLeft: 6 }} />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnOutlineSecondary}
                  activeOpacity={0.8}
                  onPress={goToLogin}
                >
                  <Text style={styles.btnOutlineText}>Iniciar Sesión</Text>
                  <Ionicons name="log-in-outline" size={18} color="#E2E8F0" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              </View>

              {/* Micro stats counter */}
              <View style={styles.statsBar}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>100%</Text>
                  <Text style={styles.statLabel}>En Línea</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>Roles</Text>
                  <Text style={styles.statLabel}>Aprendices • Instructores</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>Fácil</Text>
                  <Text style={styles.statLabel}>Acceso Rápido</Text>
                </View>
              </View>
            </View>

            {/* Right Hero Column: Decorative Topographic Waves + Landing Card */}
            <View style={[styles.heroRight, !isDesktop && styles.heroRightMobile]}>
              {/* Synthetic Concentric Topographic Curves (Inspired by template) */}
              <View style={styles.topographicContainer}>
                <View style={[styles.topoRing, styles.topoRing1]} />
                <View style={[styles.topoRing, styles.topoRing2]} />
                <View style={[styles.topoRing, styles.topoRing3]} />
                <View style={[styles.topoRing, styles.topoRing4]} />
                <View style={[styles.topoRing, styles.topoRing5]} />
                <View style={[styles.topoRing, styles.topoRing6]} />
                <View style={[styles.topoRing, styles.topoRing7]} />
              </View>

              {/* Floating Academic Hologram Card */}
              <View style={styles.floatingCard}>
                <View style={styles.floatingCardHeader}>
                  <View style={styles.floatingIconBadge}>
                    <Ionicons name="school" size={24} color="#D4AF37" />
                  </View>
                  <View>
                    <Text style={styles.floatingCardTag}>AIMS</Text>
                    <Text style={styles.floatingCardTitle}>Portal Educativo.</Text>
                  </View>
                </View>

                <Text style={styles.floatingCardText}>
                  Acceso centralizado para el seguimiento de asistencias, calificaciones, fichas de formación y evaluación automatizada con inteligencia artificial.
                </Text>

                <View style={styles.floatingBadgesRow}>
                  <View style={styles.featurePill}>
                    <Ionicons name="calendar-outline" size={14} color="#10B981" />
                    <Text style={styles.featurePillText}>Asistencias</Text>
                  </View>
                  <View style={styles.featurePill}>
                    <Ionicons name="document-text-outline" size={14} color="#60A5FA" />
                    <Text style={styles.featurePillText}>Calificaciones</Text>
                  </View>
                  <View style={styles.featurePill}>
                    <Ionicons name="person-outline" size={14} color="#D4AF37" />
                    <Text style={styles.featurePillText}>Historial</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.floatingCardButton}
                  activeOpacity={0.85}
                  onPress={goToLogin}
                >
                  <Text style={styles.floatingCardButtonText}>ENTRAR AL PORTAL</Text>
                  <Ionicons name="arrow-forward-circle" size={18} color="#D4AF37" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* FEATURES SECTION (3 COLUMNS) */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionBadge}>CARACTERÍSTICAS DEL SISTEMA</Text>
              <Text style={styles.sectionTitle}>Todo lo que tu formación necesita</Text>
              <Text style={styles.sectionDescription}>
                AIMS integra las herramientas pedagógicas y administrativas en una suite moderna y ágil.
              </Text>
            </View>

            <View style={[styles.cardsGrid, !isDesktop && styles.cardsGridMobile]}>
              {/* Card 1 */}
              <View style={styles.featureCard}>
                <View style={[styles.cardIconBox, styles.cardIconGold]}>
                  <Ionicons name="calendar-outline" size={26} color="#D4AF37" />
                </View>
                <Text style={styles.cardHeading}>Control de Asistencias</Text>
                <Text style={styles.cardBody}>
                  Registro automático y seguro en tiempo real, alertas de inasistencias y reportes consolidados por ficha de formación.
                </Text>

              </View>

              {/* Card 2 */}
              <View style={styles.featureCard}>
                <View style={[styles.cardIconBox, styles.cardIconBlue]}>
                  <Ionicons name="sparkles-outline" size={26} color="#60A5FA" />
                </View>
                <Text style={styles.cardHeading}>Calificaciones</Text>
                <Text style={styles.cardBody}>
                  Asistencia inteligente para instructores en la retroalimentación cualitativa y cuantitativa de evidencias y talleres.
                </Text>

              </View>

              {/* Card 3 */}
              <View style={styles.featureCard}>
                <View style={[styles.cardIconBox, styles.cardIconGold]}>
                  <Ionicons name="people-outline" size={26} color="#D4AF37" />
                </View>
                <Text style={styles.cardHeading}>Gestión de Fichas</Text>
                <Text style={styles.cardBody}>
                  Monitoreo de instructores líderes, asignación de competencias, sedes y trimestres con sincronización continua.
                </Text>

              </View>
            </View>
          </View>

          {/* CALL TO ACTION BANNER */}
          <View style={styles.ctaBannerWrapper}>
            <LinearGradient
              colors={['#0F1838', '#14204F', '#090D24']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaBanner}
            >
              <View style={styles.ctaTextGroup}>
                <Text style={styles.ctaTitle}>¿Listo para comenzar?</Text>
                <Text style={styles.ctaSubtitle}>
                  Ingresa con tus credenciales de SENA o comunícate con tu administrador de centro.
                </Text>
              </View>
              <View style={styles.ctaButtonsGroup}>
                <TouchableOpacity
                  style={styles.btnGoldPrimary}
                  activeOpacity={0.85}
                  onPress={goToLogin}
                >
                  <LinearGradient
                    colors={['#D4AF37', '#F3E5AB', '#AA7C11']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.btnGradient}
                  >
                    <Text style={styles.btnGoldText}>ACCEDER AHORA</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnOutlineSecondary}
                  activeOpacity={0.8}
                  onPress={goToRegister}
                >
                  <Text style={styles.btnOutlineText}>Crear Cuenta Nueva</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <View style={[styles.footerMain, !isDesktop && styles.footerMainMobile]}>
              <View style={styles.footerBrandCol}>
                <View style={styles.navBrand}>
                  <Image
                    source={require('../assets/images/logo.jpeg')}
                    style={styles.footerLogo}
                    resizeMode="contain"
                  />
                  <View style={styles.brandTextGroup}>
                    <Text style={styles.footerBrandTitle}>AIMS</Text>
                    <Text style={styles.footerBrandSubtitle}>Academic Intelligent Management</Text>
                  </View>
                </View>
                <Text style={styles.footerBio}>
                  Plataforma integral de gestión educativa y analítica académica institucional para la comunidad formativa.
                </Text>
              </View>

              <View style={styles.footerLinksRow}>
                <View style={styles.footerCol}>
                  <Text style={styles.footerColHeading}>Accesos Rápidos</Text>
                  <TouchableOpacity onPress={goToLogin}>
                    <Text style={styles.footerColLink}>Iniciar Sesión</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={goToRegister}>
                    <Text style={styles.footerColLink}>Registrar Aprendiz</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                    <Text style={styles.footerColLink}>Recuperar Clave</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.footerCol}>
                  <Text style={styles.footerColHeading}>Roles del Sistema</Text>
                  <Text style={styles.footerColLink}>Aprendices</Text>
                  <Text style={styles.footerColLink}>Instructores</Text>
                  <Text style={styles.footerColLink}>Administradores</Text>
                </View>

                <View style={styles.footerCol}>
                  <Text style={styles.footerColHeading}>Soporte</Text>
                  <Text style={styles.footerColLink}>soporte@sena.edu.co</Text>
                  <Text style={styles.footerColLink}>Centro de Formación</Text>
                  <Text style={styles.footerColLink}>Términos y Privacidad</Text>
                </View>
              </View>
            </View>

            <View style={styles.footerBottom}>
              <Text style={styles.footerBottomText}>
                © 2026 AIMS - Sistema de Gestión Académica. Todos los derechos reservados.
              </Text>
              <View style={styles.footerSecurityBadge}>
                <Ionicons name="lock-closed" size={12} color="#10B981" />
                <Text style={styles.footerSecurityText}>Conexión Segura</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#020308',
  },
  safeArea: {
    flex: 1,
  },

  /* Ambient Glows */
  glowOrb: {
    position: 'absolute',
    borderRadius: 999,
  },
  goldGlowTop: {
    width: 600,
    height: 600,
    backgroundColor: '#D4AF37',
    opacity: 0.12,
    top: -240,
    left: '10%',
  },
  blueGlowCenter: {
    width: 550,
    height: 550,
    backgroundColor: '#1E3A8A',
    opacity: 0.2,
    top: '25%',
    right: -150,
  },
  amberGlowBottom: {
    width: 500,
    height: 500,
    backgroundColor: '#C59427',
    opacity: 0.14,
    bottom: -150,
    left: -100,
  },
  cyanGlowSide: {
    width: 400,
    height: 400,
    backgroundColor: '#0284C7',
    opacity: 0.08,
    top: '60%',
    right: '25%',
  },

  /* Star Dust Sparks */
  sparkleDot: {
    position: 'absolute',
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#D4AF37',
    opacity: 0.4,
  },

  /* Top Navbar */
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: 'rgba(2, 3, 8, 0.75)',
    zIndex: 20,
    flexWrap: 'wrap',
    gap: 8,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(12px)',
      },
    }),
  },
  navBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 42,
    height: 42,
    borderRadius: 8,
    marginRight: 12,
  },
  brandTextGroup: {
    justifyContent: 'center',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2.5,
  },
  brandBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  brandBadgeText: {
    color: '#D4AF37',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  brandSubtitle: {
    color: '#94A3B8',
    fontSize: 9,
    letterSpacing: 1.2,
    marginTop: 2,
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 26,
  },
  navItem: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  navItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#D4AF37',
  },
  navItemText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  navItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  navAuthGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  btnSecondaryNav: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  btnSecondaryNavText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  btnPrimaryNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: '#D4AF37',
  },
  btnPrimaryNavText: {
    color: '#0A0F26',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  /* Scroll container */
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 0,
  },

  /* HERO SECTION */
  heroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingTop: 50,
    paddingBottom: 60,
    maxWidth: 1280,
    alignSelf: 'center',
    width: '100%',
  },
  heroContainerMobile: {
    flexDirection: 'column',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  heroLeft: {
    flex: 1.1,
    paddingRight: 40,
  },
  heroLeftMobile: {
    paddingRight: 0,
    marginBottom: 40,
    width: '100%',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  statusPillText: {
    color: '#F3E5AB',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 72,
    marginBottom: 16,
  },
  heroTitleDot: {
    color: '#D4AF37',
  },
  heroSubtitle: {
    color: '#94A3B8',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 28,
    maxWidth: 540,
  },

  /* Search bar (as in template) */
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderRadius: 28,
    paddingHorizontal: 18,
    height: 54,
    marginBottom: 26,
    maxWidth: 500,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(8px)',
      },
    }),
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
  },
  searchButton: {
    padding: 6,
  },

  /* CTA Buttons */
  heroCtaGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 36,
  },
  btnGoldPrimary: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 26,
  },
  btnGoldText: {
    color: '#0A0F26',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  btnOutlineSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  btnOutlineText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
  },

  /* Stats Bar */
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    maxWidth: 500,
  },
  statItem: {
    justifyContent: 'center',
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },

  /* HERO RIGHT: CONCENTRIC RINGS & FLOATING CARD */
  heroRight: {
    flex: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 460,
    width: '100%',
  },
  heroRightMobile: {
    minHeight: 400,
  },
  topographicContainer: {
    position: 'absolute',
    width: 440,
    height: 440,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topoRing: {
    position: 'absolute',
    borderRadius: 220,
    borderWidth: 1.2,
  },
  topoRing1: {
    width: 420,
    height: 420,
    borderColor: 'rgba(59, 130, 246, 0.15)',
    transform: [{ scaleX: 1.1 }],
  },
  topoRing2: {
    width: 360,
    height: 360,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    transform: [{ scaleY: 1.08 }, { rotate: '15deg' }],
  },
  topoRing3: {
    width: 300,
    height: 300,
    borderColor: 'rgba(168, 85, 247, 0.35)',
    transform: [{ scaleX: 1.15 }, { rotate: '-10deg' }],
  },
  topoRing4: {
    width: 240,
    height: 240,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    transform: [{ scaleY: 1.1 }, { rotate: '25deg' }],
  },
  topoRing5: {
    width: 180,
    height: 180,
    borderColor: 'rgba(236, 72, 153, 0.4)',
    transform: [{ scaleX: 1.2 }, { rotate: '-20deg' }],
  },
  topoRing6: {
    width: 120,
    height: 120,
    borderColor: 'rgba(96, 165, 250, 0.5)',
    transform: [{ scaleY: 1.15 }],
  },
  topoRing7: {
    width: 60,
    height: 60,
    borderColor: 'rgba(212, 175, 55, 0.7)',
  },

  /* Floating Card Overlapping Waves */
  floatingCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: 'rgba(10, 15, 36, 0.88)',
    borderRadius: 22,
    padding: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderTopWidth: 4,
    borderTopColor: '#D4AF37',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 28,
    elevation: 16,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(16px)',
      },
    }),
  },
  floatingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 14,
  },
  floatingIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingCardTag: {
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  floatingCardTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  floatingCardText: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 18,
  },
  floatingBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 22,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featurePillText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '600',
  },
  floatingCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1.2,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  floatingCardButtonText: {
    color: '#F3E5AB',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },

  /* SECTION: CARDS */
  sectionContainer: {
    paddingHorizontal: 30,
    paddingVertical: 50,
    maxWidth: 1280,
    alignSelf: 'center',
    width: '100%',
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  sectionBadge: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionDescription: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 600,
  },
  cardsGrid: {
    flexDirection: 'row',
    gap: 24,
    justifyContent: 'center',
  },
  cardsGridMobile: {
    flexDirection: 'column',
  },
  featureCard: {
    flex: 1,
    backgroundColor: 'rgba(15, 20, 45, 0.65)',
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopWidth: 3,
    borderTopColor: 'rgba(212, 175, 55, 0.5)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(10px)',
      },
    }),
  },
  cardIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  cardIconGold: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  cardIconBlue: {
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.35)',
  },
  cardHeading: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  cardBody: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 20,
  },
  cardLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 'auto',
  },
  cardLinkText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '700',
  },

  /* CTA BANNER WRAPPER */
  ctaBannerWrapper: {
    paddingHorizontal: 30,
    paddingVertical: 20,
    maxWidth: 1280,
    alignSelf: 'center',
    width: '100%',
  },
  ctaBanner: {
    borderRadius: 24,
    padding: 36,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 20,
  },
  ctaTextGroup: {
    flex: 1,
    minWidth: 280,
  },
  ctaTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
  },
  ctaSubtitle: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 22,
  },
  ctaButtonsGroup: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
  },

  /* FOOTER */
  footer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#020308',
    paddingHorizontal: 30,
    paddingTop: 48,
    paddingBottom: 0,
  },
  footerMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    maxWidth: 1280,
    alignSelf: 'center',
    width: '100%',
    marginBottom: 40,
    gap: 40,
  },
  footerMainMobile: {
    flexDirection: 'column',
  },
  footerBrandCol: {
    flex: 1.2,
    maxWidth: 380,
  },
  footerLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 10,
  },
  footerBrandTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
  footerBrandSubtitle: {
    color: '#94A3B8',
    fontSize: 8,
    letterSpacing: 1,
  },
  footerBio: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 14,
  },
  footerLinksRow: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 24,
  },
  footerCol: {
    minWidth: 140,
  },
  footerColHeading: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  footerColLink: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 10,
  },
  footerBottom: {
    maxWidth: 1280,
    alignSelf: 'center',
    width: '100%',
    paddingTop: 24,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  footerBottomText: {
    color: '#64748B',
    fontSize: 11,
  },
  footerSecurityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerSecurityText: {
    color: '#94A3B8',
    fontSize: 11,
  },
});
