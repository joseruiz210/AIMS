import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/authService';
import { fichasService, Ficha } from '../../services/fichasService';
import { evidenciasService, EvidenciaItem } from '../../services/evidenciasService';
import { asistenciaService } from '../../services/asistenciaService';
import { calificacionesService } from '../../services/calificacionesService';

const NAVY = '#0F1026';
const NAVY_CARD = '#16143A';
const GOLD = '#D4AF37';
const GOLD_LIGHT = 'rgba(212, 175, 55, 0.12)';
const BG_PAGE = '#F8FAFC';
const GREEN = '#10B981';
const BLUE = '#2563EB';

export default function InstructorInicioScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Instructor');
  const [userEmail, setUserEmail] = useState('');
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [evidencias, setEvidencias] = useState<EvidenciaItem[]>([]);
  const [totalAprendices, setTotalAprendices] = useState(13);
  const [asistenciaPromedio, setAsistenciaPromedio] = useState<number>(90);
  const [calificacionPromedio, setCalificacionPromedio] = useState<number>(4.3);
  const [weeklyAttendance, setWeeklyAttendance] = useState([
    { day: 'Lun', percentage: 92, label: '92%' },
    { day: 'Mar', percentage: 85, label: '85%' },
    { day: 'Mié', percentage: 96, label: '96%' },
    { day: 'Jue', percentage: 78, label: '78%' },
    { day: 'Vie', percentage: 90, label: '90%' },
  ]);
  const [mayorAsistencia, setMayorAsistencia] = useState({ dia: 'Miércoles', pct: 96 });
  const [menorAsistencia, setMenorAsistencia] = useState({ dia: 'Jueves', pct: 78 });

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const { user } = await authService.checkSession();
        if (!isMounted) return;
        if (user) {
          const nombreCompleto =
            (user as any).firstName
              ? `${(user as any).firstName} ${(user as any).lastName || ''}`.trim()
              : user.nombre || 'Instructor';
          setUserName(nombreCompleto);
          setUserEmail((user as any).email || user.correo || '');
        }

        const [fichasData, evidenciasData] = await Promise.all([
          fichasService.getFichas(),
          evidenciasService.getEvidenciasInstructor(),
        ]);

        if (!isMounted) return;
        setFichas(fichasData);
        setEvidencias(evidenciasData);

        // Calcular total de aprendices sumando matriculas
        const aprendicesCount = fichasData.reduce(
          (acc, f) => acc + (f.aprendicesCount || 0),
          0
        );
        if (aprendicesCount > 0) {
          setTotalAprendices(aprendicesCount);
        }

        if (fichasData.length > 0) {
          const targetFicha = fichasData[0];

          // 1. Cargar calificaciones reales desde PostgreSQL
          try {
            const califs = await calificacionesService.getCalificacionesByFicha(targetFicha.id);
            if (isMounted && califs && califs.length > 0) {
              const notas = califs.map(c => c.overallNota).filter(n => n > 0);
              if (notas.length > 0) {
                const prom = Number((notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1));
                setCalificacionPromedio(prom);
              }
            }
          } catch (e) {
            console.error(e);
          }

          // 2. Cargar asistencias reales desde PostgreSQL
          try {
            const asistenciasData = await asistenciaService.getAsistenciasByFicha(targetFicha.id);
            if (isMounted && asistenciasData && asistenciasData.length > 0) {
              const presentes = asistenciasData.filter(a => a.estado === 'PRESENTE' || (a.estado as any) === 'EXCUSADO' || (a.estado as any) === 'EXCUSA').length;
              const pct = Math.round((presentes / asistenciasData.length) * 100);
              setAsistenciaPromedio(pct);

              const byDateMap = new Map<string, { presentes: number; total: number }>();
              asistenciasData.forEach(r => {
                const d = r.fecha ? r.fecha.split('T')[0] : 'Hoy';
                const cur = byDateMap.get(d) || { presentes: 0, total: 0 };
                cur.total += 1;
                if (r.estado === 'PRESENTE' || (r.estado as any) === 'EXCUSADO' || (r.estado as any) === 'EXCUSA') cur.presentes += 1;
                byDateMap.set(d, cur);
              });

              if (byDateMap.size >= 2) {
                const sortedDates = Array.from(byDateMap.keys()).sort().slice(-5);
                const dynamicBars = sortedDates.map(dateStr => {
                  const dt = new Date(dateStr);
                  const dayName = dt.toLocaleDateString('es-CO', { weekday: 'short' });
                  const info = byDateMap.get(dateStr)!;
                  const p = Math.round((info.presentes / info.total) * 100);
                  return {
                    day: dayName.charAt(0).toUpperCase() + dayName.slice(1, 3),
                    percentage: p,
                    label: `${p}%`,
                  };
                });
                setWeeklyAttendance(dynamicBars);

                const sortedByPct = [...dynamicBars].sort((a, b) => b.percentage - a.percentage);
                setMayorAsistencia({ dia: sortedByPct[0].day, pct: sortedByPct[0].percentage });
                setMenorAsistencia({ dia: sortedByPct[sortedByPct.length - 1].day, pct: sortedByPct[sortedByPct.length - 1].percentage });
              }
            }
          } catch (e) {
            console.error(e);
          }
        }
      } catch (error) {
        console.warn('Error cargando dashboard instructor:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const primaryFicha = fichas.length > 0 ? fichas[0] : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, isMobile && styles.contentContainerMobile]}
      showsVerticalScrollIndicator={false}
    >
      {/* ─── BANNER DE BIENVENIDA INSTITUCIONAL SENA ─── */}
      <View style={[styles.welcomeCard, isMobile && styles.welcomeCardMobile]}>
        <View style={styles.welcomePatternLeft} />
        <View style={styles.welcomePatternRight} />

        <View style={[styles.welcomeContent, !isDesktop && styles.welcomeContentMobile]}>
          <View style={{ flex: 1 }}>
            <View style={styles.welcomeBadgeRow}>
              <View style={styles.senaBadge}>
                <Ionicons name="school-outline" size={13} color={GOLD} style={{ marginRight: 5 }} />
                <Text style={styles.senaBadgeText}>SENA CTMA • Formación Profesional</Text>
              </View>
              <View style={styles.statusOnlinePill}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Sistema AIMS Activo</Text>
              </View>
            </View>

            <Text style={styles.welcomeGreeting}>¡Bienvenido, {userName}!</Text>
            <Text style={styles.welcomeDescription}>
              Panel docente para la gestión de fichas, seguimiento de asistencia, actividades académicas y evaluación formativa de evidencias.
            </Text>

            {primaryFicha ? (
              <View style={styles.fichaDetailRow}>
                <Ionicons name="layers-outline" size={15} color={GOLD} />
                <Text style={styles.fichaDetailText}>
                  Ficha <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{primaryFicha.numero}</Text> • {primaryFicha.programaNombre} ({primaryFicha.jornada})
                </Text>
              </View>
            ) : null}
          </View>

          {/* Botones de acción rápida en el banner */}
          <View style={[styles.welcomeActions, !isDesktop && styles.welcomeActionsMobile]}>
            <Pressable
              style={({ hovered }: any) => [
                styles.actionBtnPrimary,
                hovered && styles.actionBtnPrimaryHover,
              ]}
              onPress={() => router.push('/instructor/actividades' as any)}
            >
              <Ionicons name="add-circle-outline" size={16} color="#0F1026" style={{ marginRight: 6 }} />
              <Text style={styles.actionBtnPrimaryText}>Nueva Actividad</Text>
            </Pressable>

            <Pressable
              style={({ hovered }: any) => [
                styles.actionBtnSecondary,
                hovered && styles.actionBtnSecondaryHover,
              ]}
              onPress={() => router.push('/instructor/asistencia' as any)}
            >
              <Ionicons name="checkbox-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.actionBtnSecondaryText}>Tomar Asistencia</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* ─── 4 TARJETAS DE MÉTRICAS CLAVE CONECTADAS A LA BD ─── */}
      <View style={[styles.metricsGrid, isMobile && styles.metricsGridMobile]}>
        {/* Métrica 1: Aprendices */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <View style={[styles.metricIconWrap, { backgroundColor: 'rgba(212, 175, 55, 0.12)' }]}>
              <Ionicons name="people" size={20} color={GOLD} />
            </View>
            <Text style={styles.metricTrend}>En Formación</Text>
          </View>
          <Text style={[styles.metricValue, { color: NAVY }]}>{totalAprendices}</Text>
          <Text style={styles.metricLabel}>Aprendices Matriculados</Text>
          <Text style={styles.metricSub}>Ficha {primaryFicha?.numero || '2670142'}</Text>
        </View>

        {/* Métrica 2: Actividades */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <View style={[styles.metricIconWrap, { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}>
              <Ionicons name="folder-open" size={20} color={BLUE} />
            </View>
            <Text style={[styles.metricTrend, { color: BLUE }]}>Activas</Text>
          </View>
          <Text style={[styles.metricValue, { color: BLUE }]}>{evidencias.length}</Text>
          <Text style={styles.metricLabel}>Evidencias Asignadas</Text>
          <Text style={styles.metricSub}>Con rúbrica sobre 5.0</Text>
        </View>

        {/* Métrica 3: Asistencia */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <View style={[styles.metricIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
              <Ionicons name="checkmark-circle" size={20} color={GREEN} />
            </View>
            <Text style={[styles.metricTrend, { color: GREEN }]}>Promedio General</Text>
          </View>
          <Text style={[styles.metricValue, { color: GREEN }]}>{asistenciaPromedio}%</Text>
          <Text style={styles.metricLabel}>Cumplimiento de Asistencia</Text>
          <Text style={styles.metricSub}>Objetivo institucional ≥ 85%</Text>
        </View>

        {/* Métrica 4: Calificación Promedio */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <View style={[styles.metricIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
              <Ionicons name="star" size={20} color="#F59E0B" />
            </View>
            <Text style={[styles.metricTrend, { color: '#F59E0B' }]}>Aprobado ≥ 3.5</Text>
          </View>
          <Text style={[styles.metricValue, { color: '#D97706' }]}>{calificacionPromedio.toFixed(1)}</Text>
          <Text style={styles.metricLabel}>Promedio de la Ficha ADSO</Text>
          <Text style={styles.metricSub}>Escala oficial SENA 0.0 - 5.0</Text>
        </View>
      </View>

      {/* ─── ACCESOS RÁPIDOS A MÓDULOS DOCENTES ─── */}
      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="grid-outline" size={18} color={NAVY} />
          <Text style={styles.sectionTitle}>Módulos y Gestión Rápida</Text>
        </View>
        <Text style={styles.sectionSubtitle}>Acceso directo a las herramientas principales del instructor</Text>
      </View>

      <View style={[styles.quickModulesGrid, isMobile && styles.quickModulesGridMobile]}>
        {/* Modulo 1: Actividades y Rúbricas */}
        <Pressable
          style={({ hovered }: any) => [styles.quickModuleCard, hovered && styles.quickModuleCardHover]}
          onPress={() => router.push('/instructor/actividades' as any)}
        >
          <View style={[styles.quickModuleIcon, { backgroundColor: 'rgba(212, 175, 55, 0.15)' }]}>
            <Ionicons name="folder-open-outline" size={22} color={GOLD} />
          </View>
          <View style={styles.quickModuleTextCol}>
            <Text style={styles.quickModuleName}>Actividades y Rúbricas</Text>
            <Text style={styles.quickModuleDesc}>
              Crear tareas, definir rúbricas y consultar notas de aprendices.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </Pressable>

        {/* Modulo 2: Registro de Asistencia */}
        <Pressable
          style={({ hovered }: any) => [styles.quickModuleCard, hovered && styles.quickModuleCardHover]}
          onPress={() => router.push('/instructor/asistencia' as any)}
        >
          <View style={[styles.quickModuleIcon, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
            <Ionicons name="checkbox-outline" size={22} color={GREEN} />
          </View>
          <View style={styles.quickModuleTextCol}>
            <Text style={styles.quickModuleName}>Control de Asistencia</Text>
            <Text style={styles.quickModuleDesc}>
              Llamar a lista de la sesión y registrar novedades del día.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </Pressable>

        {/* Modulo 3: Calificaciones */}
        <Pressable
          style={({ hovered }: any) => [styles.quickModuleCard, hovered && styles.quickModuleCardHover]}
          onPress={() => router.push('/instructor/calificaciones' as any)}
        >
          <View style={[styles.quickModuleIcon, { backgroundColor: 'rgba(99, 102, 241, 0.12)' }]}>
            <Ionicons name="bar-chart-outline" size={22} color="#6366F1" />
          </View>
          <View style={styles.quickModuleTextCol}>
            <Text style={styles.quickModuleName}>Calificaciones y Juicios</Text>
            <Text style={styles.quickModuleDesc}>
              Asignar notas numéricas y emitir juicios de competencia.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </Pressable>

        {/* Modulo 4: Directorio de Aprendices */}
        <Pressable
          style={({ hovered }: any) => [styles.quickModuleCard, hovered && styles.quickModuleCardHover]}
          onPress={() => router.push('/instructor/aprendices' as any)}
        >
          <View style={[styles.quickModuleIcon, { backgroundColor: 'rgba(14, 165, 233, 0.12)' }]}>
            <Ionicons name="people-outline" size={22} color="#0EA5E9" />
          </View>
          <View style={styles.quickModuleTextCol}>
            <Text style={styles.quickModuleName}>Directorio de Aprendices</Text>
            <Text style={styles.quickModuleDesc}>
              Consultar estados académicos, teléfonos y correos SENA.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </Pressable>
      </View>

      {/* ─── FILA CENTRAL: ACTIVIDADES RECIENTES + GRÁFICO DE ASISTENCIA ─── */}
      <View style={[styles.mainPanelsRow, !isDesktop && styles.mainPanelsRowStacked]}>
        {/* Panel Izquierdo: Actividades y Tareas Asignadas */}
        <View style={styles.activitiesPanel}>
          <View style={styles.panelHeaderRow}>
            <View>
              <Text style={styles.panelTitle}>Evidencias Académicas en Curso</Text>
              <Text style={styles.panelSubtitle}>Actividades vigentes asignadas a las fichas de formación</Text>
            </View>

            <Pressable
              style={styles.panelActionBtn}
              onPress={() => router.push('/instructor/actividades' as any)}
            >
              <Text style={styles.panelActionBtnText}>Ver Todas</Text>
              <Ionicons name="arrow-forward" size={14} color={GOLD} />
            </Pressable>
          </View>

          {loading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={GOLD} />
              <Text style={{ marginTop: 10, color: '#64748B' }}>Cargando evidencias...</Text>
            </View>
          ) : evidencias.length === 0 ? (
            <View style={styles.emptyCardWrap}>
              <Ionicons name="folder-open-outline" size={40} color="#94A3B8" />
              <Text style={styles.emptyCardTitle}>No hay actividades publicadas</Text>
              <Text style={styles.emptyCardSubtitle}>
                Crea una nueva evidencia para asignarla a tus fichas de formación.
              </Text>
            </View>
          ) : (
            evidencias.slice(0, 3).map((item, idx) => (
              <View key={item.id || idx} style={styles.activityItemCard}>
                <View style={styles.activityItemHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.activityTitle} numberOfLines={1}>
                      {item.titulo}
                    </Text>
                    <Text style={styles.activityDesc} numberOfLines={2}>
                      {item.descripcion}
                    </Text>
                  </View>

                  <View style={styles.activityPill}>
                    <Ionicons name="calendar-outline" size={12} color="#475569" style={{ marginRight: 4 }} />
                    <Text style={styles.activityPillText}>{item.fechaLimite}</Text>
                  </View>
                </View>

                <View style={styles.activityItemFooter}>
                  <View style={styles.activityFooterBadge}>
                    <Ionicons name="bookmark" size={12} color={GOLD} style={{ marginRight: 4 }} />
                    <Text style={styles.activityFooterBadgeText}>{item.materia || 'ADSO'}</Text>
                  </View>

                  <Pressable
                    style={styles.reviewSubmissionsBtn}
                    onPress={() => router.push('/instructor/actividades' as any)}
                  >
                    <Ionicons name="eye-outline" size={14} color={BLUE} style={{ marginRight: 4 }} />
                    <Text style={styles.reviewSubmissionsText}>Ver Entregas</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Panel Derecho: Asistencia Semanal */}
        <View style={styles.chartPanel}>
          <View style={styles.panelHeaderRow}>
            <View>
              <Text style={styles.panelTitle}>Asistencia Semanal</Text>
              <Text style={styles.panelSubtitle}>Promedio diario por sesión</Text>
            </View>

            <View style={styles.legendWrap}>
              <View style={styles.legendDot} />
              <Text style={styles.legendLabel}>Asistencia %</Text>
            </View>
          </View>

          <View style={styles.chartBody}>
            {/* Eje Y */}
            <View style={styles.yAxis}>
              <Text style={styles.yAxisText}>100%</Text>
              <Text style={styles.yAxisText}>75%</Text>
              <Text style={styles.yAxisText}>50%</Text>
              <Text style={styles.yAxisText}>25%</Text>
              <Text style={styles.yAxisText}>0%</Text>
            </View>

            {/* Columnas de Barras */}
            <View style={styles.barsArea}>
              <View style={styles.gridLinesWrap}>
                <View style={styles.gridLine} />
                <View style={styles.gridLine} />
                <View style={styles.gridLine} />
                <View style={styles.gridLine} />
                <View style={styles.gridLine} />
              </View>

              <View style={styles.barsFlexRow}>
                {weeklyAttendance.map((item, idx) => (
                  <View key={idx} style={styles.barColWrap}>
                    <Text style={styles.barLabelTooltip}>{item.label}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { height: `${item.percentage}%` }]} />
                    </View>
                    <Text style={styles.barDayText}>{item.day}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Resumen al pie del gráfico */}
          <View style={styles.chartSummaryFooter}>
            <View style={styles.summaryItem}>
              <Ionicons name="checkmark-done-outline" size={16} color={GREEN} />
              <Text style={styles.summaryItemText}>
                Mayor Asistencia: <Text style={{ fontWeight: '700', color: NAVY }}>{mayorAsistencia.dia} ({mayorAsistencia.pct}%)</Text>
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="alert-circle-outline" size={16} color="#F59E0B" />
              <Text style={styles.summaryItemText}>
                Menor Asistencia: <Text style={{ fontWeight: '700', color: NAVY }}>{menorAsistencia.dia} ({menorAsistencia.pct}%)</Text>
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* ─── AVISO INSTITUCIONAL Y SOPORTE PEDAGÓGICO ─── */}
      <View style={styles.pedagogicalNoticeCard}>
        <View style={styles.pedagogicalHeaderRow}>
          <View style={styles.pedagogicalIconWrap}>
            <Ionicons name="ribbon-outline" size={24} color={GOLD} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.pedagogicalTitle}>
              Sistema de Evaluación y Rúbricas Formativas SENA
            </Text>
            <View style={styles.pedagogicalBadge}>
              <Text style={styles.pedagogicalBadgeText}>Evaluación Integral ADSO</Text>
            </View>
          </View>
        </View>

        <Text style={styles.pedagogicalText}>
          Cada evidencia entregada por los aprendices es valorada bajo la escala oficial de 0.0 a 5.0 (aprobatoria ≥ 3.5), generando retroalimentación detallada sobre fortalezas y recomendaciones pedagógicas. Puedes revisar las entregas en la sección de Actividades.
        </Text>

        <Pressable
          style={({ hovered }: any) => [
            styles.pedagogicalBtn,
            hovered && styles.pedagogicalBtnHover,
          ]}
          onPress={() => router.push('/instructor/actividades' as any)}
        >
          <Text style={styles.pedagogicalBtnText}>Ir a Actividades</Text>
          <Ionicons name="arrow-forward" size={16} color="#0F1026" />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_PAGE,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 48,
  },
  contentContainerMobile: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 40,
  },

  // ─── BANNER DE BIENVENIDA ───
  welcomeCard: {
    backgroundColor: NAVY,
    borderRadius: 20,
    padding: 26,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#0F1026',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
  welcomeCardMobile: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
  },
  welcomePatternLeft: {
    position: 'absolute',
    left: -40,
    top: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  welcomePatternRight: {
    position: 'absolute',
    right: -30,
    bottom: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
    zIndex: 1,
  },
  welcomeContentMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  welcomeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  senaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.16)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  senaBadgeText: {
    fontSize: 12,
    color: GOLD,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  statusOnlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: GREEN,
  },
  onlineText: {
    fontSize: 11,
    color: '#A7F3D0',
    fontWeight: '600',
  },
  welcomeGreeting: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  welcomeDescription: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 22,
    maxWidth: 620,
    marginBottom: 14,
  },
  fichaDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  fichaDetailText: {
    fontSize: 13,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  welcomeActions: {
    flexDirection: 'column',
    gap: 10,
    minWidth: 200,
  },
  welcomeActionsMobile: {
    width: '100%',
    flexDirection: 'column',
    gap: 10,
    marginTop: 16,
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GOLD,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  actionBtnPrimaryHover: {
    backgroundColor: '#E5C04B',
  },
  actionBtnPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F1026',
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
  },
  actionBtnSecondaryHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  actionBtnSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // ─── MÉTRICAS CLAVE ───
  metricsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 28,
  },
  metricsGridMobile: {
    flexWrap: 'wrap',
  },
  metricCard: {
    flex: 1,
    minWidth: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricTrend: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  metricSub: {
    fontSize: 12,
    color: '#64748B',
  },

  // ─── SECCIÓN DE MÓDULOS RÁPIDOS ───
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: NAVY,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  quickModulesGrid: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 28,
  },
  quickModulesGridMobile: {
    flexDirection: 'column',
  },
  quickModuleCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  quickModuleCardHover: {
    borderColor: GOLD,
    transform: [{ translateY: -2 }],
    shadowOpacity: 0.08,
  },
  quickModuleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  quickModuleTextCol: {
    flex: 1,
  },
  quickModuleName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  quickModuleDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  iaPill: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  iaPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: GOLD,
  },

  // ─── PANELES PRINCIPALES (ACTIVIDADES + GRÁFICO) ───
  mainPanelsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 24,
  },
  mainPanelsRowStacked: {
    flexDirection: 'column',
  },
  activitiesPanel: {
    flex: 1.2,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  chartPanel: {
    flex: 0.9,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  panelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  panelSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  panelActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  panelActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: GOLD,
  },
  emptyCardWrap: {
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
    marginTop: 10,
  },
  emptyCardSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  activityItemCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  activityItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  activityDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 17,
  },
  activityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activityPillText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  activityItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F6',
  },
  activityFooterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityFooterBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  reviewSubmissionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  reviewSubmissionsText: {
    fontSize: 12,
    fontWeight: '700',
    color: BLUE,
  },

  // ─── GRÁFICO DE ASISTENCIA ───
  legendWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GOLD,
  },
  legendLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  chartBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
    marginBottom: 16,
  },
  yAxis: {
    width: 38,
    height: 120,
    marginTop: 16,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  yAxisText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
    lineHeight: 12,
  },
  barsArea: {
    flex: 1,
    position: 'relative',
    height: 166,
  },
  gridLinesWrap: {
    position: 'absolute',
    top: 22,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: 'space-between',
    zIndex: 0,
  },
  gridLine: {
    height: 1,
    backgroundColor: '#F1F5F9',
    width: '100%',
  },
  barsFlexRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    zIndex: 1,
  },
  barColWrap: {
    alignItems: 'center',
    width: 38,
  },
  barLabelTooltip: {
    fontSize: 11,
    fontWeight: '700',
    color: GOLD,
    height: 16,
    lineHeight: 16,
    marginBottom: 6,
    textAlign: 'center',
  },
  barTrack: {
    width: 20,
    height: 120,
    justifyContent: 'flex-end',
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: GOLD,
    borderRadius: 6,
  },
  barDayText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    height: 16,
    lineHeight: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  chartSummaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 10,
    flexWrap: 'wrap',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryItemText: {
    fontSize: 12,
    color: '#64748B',
  },

  // ─── AVISO PEDAGÓGICO ───
  pedagogicalNoticeCard: {
    flexDirection: 'column',
    alignItems: 'stretch',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
    marginBottom: 20,
    gap: 14,
  },
  pedagogicalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pedagogicalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  pedagogicalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: NAVY,
    lineHeight: 22,
  },
  pedagogicalBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  pedagogicalBadgeText: {
    fontSize: 11,
    color: '#B45309',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  pedagogicalText: {
    fontSize: 13.5,
    color: '#475569',
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  pedagogicalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: GOLD,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 12,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 4,
  },
  pedagogicalBtnHover: {
    backgroundColor: '#C59E2E',
  },
  pedagogicalBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F1026',
    letterSpacing: 0.3,
  },
});
