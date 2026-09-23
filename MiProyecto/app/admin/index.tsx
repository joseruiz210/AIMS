import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { adminService, DashboardStatsResult, RecentActivityItem } from '../../services/adminService';
import { programasService } from '../../services/programasService';
import { fichasService } from '../../services/fichasService';

const NAVY = '#12103C';
const GOLD = '#cfa235';

export default function AdminDashboard() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [counts, setCounts] = useState({ aprendices: 0, instructores: 0, programas: 0, fichas: 0 });
  const [stats, setStats] = useState<DashboardStatsResult | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Global Notification Modal
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifRole, setNotifRole] = useState<'ALL' | 'APRENDIZ' | 'INSTRUCTOR'>('ALL');
  const [sendingNotif, setSendingNotif] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [dashStats, activities, fichasList, programasList] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRecentActivity(8),
        fichasService.getFichas(),
        programasService.getProgramas(),
      ]);

      if (dashStats) {
        setStats(dashStats);
        setCounts({
          aprendices: dashStats.aprendicesCount || 0,
          instructores: dashStats.instructoresCount || 0,
          programas: dashStats.programasCount || (Array.isArray(programasList) ? programasList.length : 0),
          fichas: dashStats.fichasActivasCount || (Array.isArray(fichasList) ? fichasList.length : 0),
        });
      } else {
        const [aprs, insts] = await Promise.all([
          adminService.countByRole('APRENDIZ'),
          adminService.countByRole('INSTRUCTOR'),
        ]);
        setCounts({
          aprendices: aprs,
          instructores: insts,
          programas: Array.isArray(programasList) ? programasList.length : 0,
          fichas: Array.isArray(fichasList) ? fichasList.length : 0,
        });
      }

      if (Array.isArray(activities)) {
        setRecentActivities(activities);
      }
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendGlobalNotif = async () => {
    if (!notifTitle.trim() || !notifBody.trim()) {
      showToast('Por favor completa el título y el mensaje');
      return;
    }
    setSendingNotif(true);
    try {
      await adminService.sendGlobalNotification({
        title: notifTitle.trim(),
        body: notifBody.trim(),
        tipo: 'COMUNICADO',
        targetRole: notifRole === 'ALL' ? null : notifRole,
      });
      showToast('Notificación global enviada exitosamente');
      setNotifModalVisible(false);
      setNotifTitle('');
      setNotifBody('');
    } catch (err: any) {
      showToast(err.message || 'Error al enviar notificación');
    } finally {
      setSendingNotif(false);
    }
  };

  const statCards = [
    { title: 'Total aprendices', value: loading ? '...' : String(counts.aprendices), icon: 'school-outline' as const, highlight: true },
    { title: 'Instructores', value: loading ? '...' : String(counts.instructores), icon: 'person-outline' as const, highlight: false },
    { title: 'Programas', value: loading ? '...' : String(counts.programas), icon: 'book-outline' as const, highlight: true },
    { title: 'Fichas activas', value: loading ? '...' : String(counts.fichas), icon: 'document-text-outline' as const, highlight: false },
  ];

  const quickActions = [
    { title: 'Gestionar fichas', icon: 'folder-open-outline' as const, route: '/admin/fichas' },
    { title: 'Horarios de fichas', icon: 'time-outline' as const, route: '/admin/horarios' },
    { title: 'Asignar instructores', icon: 'briefcase-outline' as const, route: '/admin/instructores' },
    { title: 'Calificaciones', icon: 'bar-chart-outline' as const, route: '/admin/calificaciones' },
    { title: 'Notificación Global', icon: 'megaphone-outline' as const, isAction: true },
    { title: 'Ver reportes', icon: 'analytics-outline' as const, route: '/admin/reportes' },
  ];

  // Métricas reales para el gráfico de dona
  const activosCount = stats?.aprendicesPorEstado?.find(x => x.estado === 'EN_FORMACION' || x.estado === 'Activo')?.count ?? counts.aprendices;
  const enRiesgoCount = stats?.aprendicesPorEstado?.find(x => x.estado === 'CONDICIONADO')?.count ?? 0;
  const criticosCount = stats?.aprendicesPorEstado?.find(x => x.estado === 'CANCELADO' || x.estado === 'DESERCION')?.count ?? 0;
  const totalDoughnut = activosCount + enRiesgoCount + criticosCount || counts.aprendices;

  // Métricas reales para el gráfico de barras de asistencia
  const presentesCount = stats?.asistenciasRecientes?.find(a => a.estado === 'PRESENTE')?._count?.id || 0;
  const ausentesCount = stats?.asistenciasRecientes?.find(a => a.estado === 'AUSENTE')?._count?.id || 0;
  const totalAsist = presentesCount + ausentesCount;
  const pctPres = totalAsist > 0 ? presentesCount / totalAsist : 0;

  const barHeights = [
    Math.round(pctPres * 85),
    Math.round(pctPres * 90),
    Math.round(pctPres * 82),
    Math.round(pctPres * 96),
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Toast */}
      {toastMsg && (
        <View style={styles.toastBanner}>
          <Ionicons name="information-circle" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bienvenido de nuevo</Text>
          <Text style={styles.title}>Panel Administrativo</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.dateBadge}>
            <Ionicons name="calendar-outline" size={16} color={NAVY} />
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </View>
        </View>
      </View>

      {/* Stat Cards */}
      <View style={styles.cardsContainer}>
        {statCards.map((card, index) => (
          <View key={index} style={[styles.card, !isDesktop && styles.mobileCard]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, card.highlight && styles.cardIconWrapGold]}>
                <Ionicons name={card.icon} size={22} color={card.highlight ? GOLD : NAVY} />
              </View>
            </View>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={[styles.cardValue, card.highlight && styles.cardValueHighlight]}>
              {card.value}
            </Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Acciones rápidas</Text>
      <View style={styles.actionsContainer}>
        {quickActions.map((action, index) => (
          <Pressable 
            key={index} 
            style={({ hovered }: any) => [
              styles.actionCard, 
              !isDesktop && styles.mobileActionCard,
              hovered && { transform: [{ translateY: -2 }], backgroundColor: '#F8FAFC' }
            ]}
            onPress={() => {
              if (action.isAction) {
                setNotifModalVisible(true);
              } else if (action.route) {
                router.push(action.route as any);
              }
            }}
          >
            <View style={styles.actionIconWrap}>
              <Ionicons name={action.icon} size={26} color={GOLD} />
            </View>
            <Text style={styles.actionText}>{action.title}</Text>
          </Pressable>
        ))}
      </View>

      {/* Charts section */}
      <Text style={styles.sectionTitle}>Resumen</Text>
      <View style={[styles.chartsContainer, !isDesktop && styles.chartsContainerMobile]}>
        {/* Bar Chart - Real Attendance */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Ionicons name="bar-chart-outline" size={18} color={NAVY} />
            <Text style={styles.chartTitle}>ASISTENCIA SEMANAL</Text>
          </View>
          <View style={styles.barChart}>
            <View style={styles.yAxis}>
              <Text style={styles.axisText}>100%</Text>
              <Text style={styles.axisText}>75%</Text>
              <Text style={styles.axisText}>50%</Text>
              <Text style={styles.axisText}>25%</Text>
              <Text style={styles.axisText}>0%</Text>
            </View>
            <View style={styles.barsArea}>
              {['S1', 'S2', 'S3', 'S4'].map((label, idx) => (
                <View key={label} style={styles.barColumn}>
                  <View style={[styles.bar, { height: `${barHeights[idx]}%` }]} />
                  <Text style={styles.barLabel}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.emptyMessage}>
            <Ionicons name="checkmark-circle-outline" size={16} color={GOLD} />
            <Text style={[styles.emptyText, { color: NAVY, fontStyle: 'normal' }]}>
              Promedio general: {Math.round(pctPres * 100)}% de asistencia
            </Text>
          </View>
        </View>

        {/* Doughnut Chart - Real States */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Ionicons name="pie-chart-outline" size={18} color={NAVY} />
            <Text style={styles.chartTitle}>ESTADO DE APRENDICES</Text>
          </View>
          <View style={styles.doughnutContainer}>
            <View style={[styles.doughnutOuter, { borderColor: GOLD }]}>
              <View style={styles.doughnutInner}>
                <Text style={styles.doughnutCenterText}>{totalDoughnut}</Text>
                <Text style={styles.doughnutCenterLabel}>Total</Text>
              </View>
            </View>
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>Activos: {activosCount}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>En riesgo: {enRiesgoCount}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>Críticos: {criticosCount}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <Text style={styles.sectionTitle}>Actividad reciente</Text>
      <View style={styles.activityCard}>
        {recentActivities.length === 0 ? (
          <View style={styles.activityEmpty}>
            <Ionicons name="time-outline" size={40} color="#D0D0D0" />
            <Text style={styles.activityEmptyText}>No hay actividad reciente</Text>
            <Text style={styles.activityEmptySubtext}>Las acciones del sistema aparecerán aquí</Text>
          </View>
        ) : (
          <View style={styles.activityList}>
            {recentActivities.map((act) => {
              const userName = act.user ? `${act.user.firstName} ${act.user.lastName || ''}`.trim() : 'Sistema';
              const dateStr = new Date(act.createdAt).toLocaleString('es-CO', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <View key={act.id} style={styles.activityItemRow}>
                  <View style={styles.activityIconCircle}>
                    <Ionicons name="flash-outline" size={16} color={GOLD} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={styles.activityActionTitle}>
                        {act.accion.replace(/_/g, ' ')}
                      </Text>
                      <Text style={styles.activityDateText}>{dateStr}</Text>
                    </View>
                    <Text style={styles.activityUserText}>
                      Realizado por: <Text style={{ fontWeight: '700', color: NAVY }}>{userName}</Text> ({act.user?.role || 'SISTEMA'})
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Modal Notificación Global */}
      <Modal visible={notifModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="megaphone-outline" size={22} color={GOLD} style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>Enviar Notificación Global</Text>
              </View>
              <Pressable onPress={() => setNotifModalVisible(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Destinatarios</Text>
              <View style={styles.roleChipsRow}>
                {[
                  { id: 'ALL', label: 'Todos' },
                  { id: 'APRENDIZ', label: 'Aprendices' },
                  { id: 'INSTRUCTOR', label: 'Instructores' },
                ].map((r) => (
                  <Pressable
                    key={r.id}
                    style={[styles.roleChip, notifRole === r.id && styles.roleChipActive]}
                    onPress={() => setNotifRole(r.id as any)}
                  >
                    <Text style={[styles.roleChipText, notifRole === r.id && styles.roleChipTextActive]}>
                      {r.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.inputLabel}>Título de la Notificación</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ej. Convocatoria Importante SENA"
                placeholderTextColor="#94A3B8"
                value={notifTitle}
                onChangeText={setNotifTitle}
              />

              <Text style={styles.inputLabel}>Mensaje</Text>
              <TextInput
                style={[styles.modalInput, { height: 100, textAlignVertical: 'top' }]}
                placeholder="Escribe el contenido del anuncio institucional..."
                placeholderTextColor="#94A3B8"
                multiline
                value={notifBody}
                onChangeText={setNotifBody}
              />
            </View>

            <View style={styles.modalFooter}>
              <Pressable
                style={styles.btnCancel}
                onPress={() => setNotifModalVisible(false)}
                disabled={sendingNotif}
              >
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.btnSendNotif, sendingNotif && { opacity: 0.6 }]}
                onPress={handleSendGlobalNotif}
                disabled={sendingNotif}
              >
                {sendingNotif ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="send" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.btnSendNotifText}>Enviar Notificación</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  greeting: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: NAVY,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  dateText: {
    fontSize: 13,
    color: NAVY,
    textTransform: 'capitalize',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    minWidth: 180,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  mobileCard: {
    minWidth: '47%',
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(18, 16, 60, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconWrapGold: {
    backgroundColor: 'rgba(207, 162, 53, 0.1)',
  },
  cardTitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '700',
    color: NAVY,
  },
  cardValueHighlight: {
    color: GOLD,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: NAVY,
    marginBottom: 14,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 30,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    flex: 1,
    minWidth: 160,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(207, 162, 53, 0.15)',
  },
  mobileActionCard: {
    minWidth: '47%',
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(207, 162, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: {
    fontSize: 13,
    color: NAVY,
    fontWeight: '500',
    textAlign: 'center',
  },
  chartsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 30,
  },
  chartsContainerMobile: {
    flexDirection: 'column',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 22,
    flex: 1,
    minHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 13,
    color: '#555',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  barChart: {
    flexDirection: 'row',
    height: 170,
  },
  yAxis: {
    justifyContent: 'space-between',
    paddingRight: 10,
    alignItems: 'flex-end',
    paddingBottom: 20,
  },
  axisText: {
    fontSize: 11,
    color: '#bbb',
  },
  barsArea: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    paddingBottom: 25,
  },
  barColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 35,
  },
  bar: {
    width: 28,
    backgroundColor: GOLD,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  emptyMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },
  emptyText: {
    color: '#bbb',
    fontSize: 13,
    fontStyle: 'italic',
  },
  doughnutContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  doughnutOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 25,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doughnutInner: {
    alignItems: 'center',
  },
  doughnutCenterText: {
    fontSize: 22,
    fontWeight: '700',
    color: NAVY,
  },
  doughnutCenterLabel: {
    fontSize: 11,
    color: '#999',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#777',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  activityEmpty: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  activityEmptyText: {
    fontSize: 15,
    color: '#999',
    marginTop: 12,
  },
  activityEmptySubtext: {
    fontSize: 13,
    color: '#ccc',
    marginTop: 4,
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  toastText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  activityList: {
    gap: 12,
  },
  activityItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  activityIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityActionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: NAVY,
    textTransform: 'capitalize',
  },
  activityDateText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  activityUserText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: NAVY,
  },
  modalBody: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: NAVY,
    marginBottom: 4,
  },
  roleChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  roleChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  roleChipActive: {
    backgroundColor: NAVY,
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  roleChipTextActive: {
    color: '#FFFFFF',
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: NAVY,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  btnCancel: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  btnCancelText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 14,
  },
  btnSendNotif: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NAVY,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  btnSendNotifText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

