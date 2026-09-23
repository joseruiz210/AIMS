import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ActionModal from '../../components/ActionModal';
import { comunicadosService } from '../../services/comunicadosService';
import { authService } from '../../services/authService';
import { getApiBaseUrl } from '../../services/api';

const NAVY = '#12103C';
const GOLD = '#cfa235';

interface NotificacionItem {
  id: string;
  titulo: string;
  mensaje: string;
  hora: string;
  leida: boolean;
  categoria: 'Académica' | 'Anuncio' | 'Asistencia' | 'Horario';
  timestamp?: number;
}

export default function NotificacionesAprendizScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [items, setItems] = useState<NotificacionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<NotificacionItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadNotificaciones = useCallback(async () => {
    try {
      const baseUrl = getApiBaseUrl();
      let notifs: NotificacionItem[] = [];

      // 1. Cargar notificaciones personales y de eventos (asistencia, calificaciones, horario, etc.)
      try {
        const res = await authService.fetchWithAuth(`${baseUrl}/notificaciones`);
        if (res.ok) {
          const json = await res.json();
          const rawList = Array.isArray(json.data)
            ? json.data
            : json.data?.notificaciones || (Array.isArray(json) ? json : []);

          if (Array.isArray(rawList)) {
            notifs = rawList.map((n: any) => {
              const createdDate = n.createdAt ? new Date(n.createdAt) : null;
              return {
                id: String(n.id),
                titulo: n.titulo || 'Notificación',
                mensaje: n.mensaje || '',
                hora: createdDate && !isNaN(createdDate.getTime())
                  ? createdDate.toLocaleDateString('es-CO', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Reciente',
                leida: !!n.leida,
                categoria:
                  n.tipo === 'HORARIO'
                    ? 'Horario'
                    : n.tipo === 'CALIFICACION'
                    ? 'Académica'
                    : n.tipo === 'ASISTENCIA'
                    ? 'Asistencia'
                    : 'Anuncio',
                timestamp: createdDate && !isNaN(createdDate.getTime()) ? createdDate.getTime() : 0,
              };
            });
          }
        }
      } catch (err) {
        console.warn('Error consultando /notificaciones:', err);
      }

      // 2. Cargar comunicados institucionales y de ficha (emitidos por Admin e Instructores)
      try {
        const comunicados = await comunicadosService.getComunicados();
        if (Array.isArray(comunicados)) {
          const mapped: NotificacionItem[] = comunicados.map((item: any) => {
            let formattedHora = 'Reciente';
            let timeVal = 0;
            if (item.fecha) {
              try {
                const d = new Date(item.fecha);
                if (!isNaN(d.getTime())) {
                  timeVal = d.getTime();
                  formattedHora = d.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });
                } else {
                  formattedHora = String(item.fecha);
                }
              } catch {
                formattedHora = String(item.fecha);
              }
            }

            return {
              id: String(item.id),
              titulo: item.titulo || (item.autor ? `Aviso de ${item.autor}` : 'Comunicado Institucional'),
              mensaje: item.mensaje || '',
              hora: formattedHora,
              leida: item.leidos ? item.leidos > 0 : false,
              categoria: item.destinatario?.includes('ASISTENCIA')
                ? 'Asistencia'
                : item.destinatario?.includes('ACADEMICO')
                ? 'Académica'
                : 'Anuncio',
              timestamp: timeVal,
            };
          });

          // Combinar y deduplicar por id
          const seen = new Set<string>();
          const combined: NotificacionItem[] = [];

          for (const it of [...notifs, ...mapped]) {
            if (!seen.has(it.id)) {
              seen.add(it.id);
              combined.push(it);
            }
          }

          // Ordenar cronológicamente (más recientes arriba)
          combined.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          setItems(combined);
          return;
        }
      } catch (err) {
        console.warn('Error consultando comunicados:', err);
      }

      setItems(notifs);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotificaciones();
  }, [loadNotificaciones]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotificaciones();
  }, [loadNotificaciones]);

  const handleMarkAllRead = () => {
    setItems((prev) => prev.map((i) => ({ ...i, leida: true })));
    const baseUrl = getApiBaseUrl();
    authService.fetchWithAuth(`${baseUrl}/notificaciones/read-all`, { method: 'PATCH' }).catch(() => {});
  };

  const handleOpenNotif = (notif: NotificacionItem) => {
    setSelectedNotif(notif);
    setModalVisible(true);
    setItems((prev) => prev.map((i) => (i.id === notif.id ? { ...i, leida: true } : i)));
    const baseUrl = getApiBaseUrl();
    authService.fetchWithAuth(`${baseUrl}/notificaciones/${notif.id}/read`, { method: 'PATCH' }).catch(() => {});
    comunicadosService.marcarLeido(notif.id).catch(() => {});
  };

  const pad = isDesktop ? 24 : 14;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { padding: pad }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={GOLD}
          colors={[GOLD, NAVY]}
        />
      }
    >
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.pageTitle}>Notificaciones</Text>
          <Text style={styles.pageSubtitle}>Mantente al día con tus clases, eventos e información académica.</Text>
        </View>

        <Pressable
          style={({ hovered }: any) => [styles.readAllBtn, hovered && styles.readAllBtnHover]}
          onPress={handleMarkAllRead}
        >
          <Ionicons name="checkmark-done-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.readAllBtnText}>Marcar leídas</Text>
        </Pressable>
      </View>

      {/* Notifications List */}
      {loading ? (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={GOLD} />
          <Text style={{ marginTop: 12, color: '#64748B', fontSize: 14 }}>Cargando notificaciones...</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="notifications-off-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyTitle}>Sin notificaciones nuevas</Text>
          <Text style={styles.emptySubtext}>Estás al día con todos tus comunicados y avisos institucionales.</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {items.map((item) => (
            <Pressable
              key={item.id}
              style={({ hovered }: any) => [
                styles.notifCard,
                !item.leida && styles.notifCardUnread,
                hovered && styles.notifCardHover,
              ]}
              onPress={() => handleOpenNotif(item)}
            >
              <View style={styles.iconCircle}>
                <Ionicons
                  name={
                    item.categoria === 'Académica'
                      ? 'school-outline'
                      : item.categoria === 'Asistencia'
                      ? 'checkmark-circle-outline'
                      : 'megaphone-outline'
                  }
                  size={22}
                  color={GOLD}
                />
              </View>

              <View style={styles.textContainer}>
                <View style={styles.titleRow}>
                  <Text style={styles.notifTitle}>{item.titulo}</Text>
                  <Text style={styles.notifTime}>{item.hora}</Text>
                </View>
                <Text style={styles.notifBody}>{item.mensaje}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {/* Action Modal */}
      {selectedNotif && (
        <ActionModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title={selectedNotif.titulo}
          subtitle={`Categoría: ${selectedNotif.categoria} • ${selectedNotif.hora}`}
          iconName="notifications-outline"
          confirmText="Entendido"
          fields={[
            { label: 'Detalle de la Notificación', placeholder: selectedNotif.mensaje, type: 'multiline' },
          ]}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 12,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: NAVY,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  readAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GOLD,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  readAllBtnHover: {
    opacity: 0.9,
  },
  readAllBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: NAVY,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 400,
  },
  listContainer: {
    gap: 12,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'flex-start',
    gap: 14,
  },
  notifCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: GOLD,
    backgroundColor: '#FCFCFD',
  },
  notifCardHover: {
    borderColor: GOLD,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(207, 162, 53, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: NAVY,
    flex: 1,
    marginRight: 8,
  },
  notifTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  notifBody: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
});
