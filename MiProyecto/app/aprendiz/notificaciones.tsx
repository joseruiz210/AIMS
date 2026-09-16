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
import { Ionicons } from '@expo/vector-icons';
import ActionModal from '../../components/ActionModal';
import { comunicadosService } from '../../services/comunicadosService';

const NAVY = '#12103C';
const GOLD = '#cfa235';

interface NotificacionItem {
  id: string;
  titulo: string;
  mensaje: string;
  hora: string;
  leida: boolean;
  categoria: 'Académica' | 'Anuncio' | 'Asistencia';
}

export default function NotificacionesAprendizScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [items, setItems] = useState<NotificacionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState<NotificacionItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadNotificaciones();
  }, []);

  const loadNotificaciones = async () => {
    setLoading(true);
    try {
      const data = await comunicadosService.getComunicados();
      const mapped: NotificacionItem[] = data.map((item: any) => ({
        id: item.id,
        titulo: item.titulo || 'Comunicado Institucional',
        mensaje: item.mensaje || '',
        hora: item.fecha ? new Date(item.fecha).toLocaleDateString('es-CO') : 'Reciente',
        leida: item.leidos ? item.leidos > 0 : false,
        categoria: item.destinatario?.includes('ASISTENCIA')
          ? 'Asistencia'
          : item.destinatario?.includes('ACADEMICO')
          ? 'Académica'
          : 'Anuncio',
      }));
      setItems(mapped);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = () => {
    setItems(items.map((i) => ({ ...i, leida: true })));
  };

  const handleOpenNotif = (notif: NotificacionItem) => {
    setSelectedNotif(notif);
    setModalVisible(true);
    setItems(items.map((i) => (i.id === notif.id ? { ...i, leida: true } : i)));
    comunicadosService.marcarLeido(notif.id).catch(() => {});
  };

  const pad = isDesktop ? 24 : 14;

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.contentContainer, { padding: pad }]}>
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
    borderRadius: 10,
  },
  readAllBtnHover: {
    backgroundColor: '#b88d2a',
  },
  readAllBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    gap: 14,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#D0D8E4',
    alignItems: 'flex-start',
    gap: 14,
  },
  notifCardUnread: {
    backgroundColor: 'rgba(207, 162, 53, 0.06)',
    borderColor: 'rgba(207, 162, 53, 0.3)',
  },
  notifCardHover: {
    borderColor: GOLD,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(207, 162, 53, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 16,
    fontWeight: '700',
    color: NAVY,
    flex: 1,
    marginRight: 8,
  },
  notifTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  notifBody: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D0D8E4',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: NAVY,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
});





