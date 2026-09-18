import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { comunicadosService, ComunicadoItem } from '../../services/comunicadosService';

const NAVY = '#0F1026';
const GOLD = '#D4AF37';

export default function NotificacionesScreen() {
  const [items, setItems] = useState<ComunicadoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    loadNotificaciones().finally(() => { if (!isMounted) return; });
    return () => { isMounted = false; };
  }, []);

  const loadNotificaciones = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await comunicadosService.getComunicados();
      setItems(data);
    } catch (error: any) {
      console.error('Error cargando notificaciones:', error);
      setErrorMsg(error?.message || 'No se pudieron cargar las notificaciones. Verifica tu conexión.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setErrorMsg(null);
    try {
      const data = await comunicadosService.getComunicados();
      setItems(data);
    } catch (error: any) {
      setErrorMsg(error?.message || 'No se pudieron cargar las notificaciones.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={GOLD}
          colors={[GOLD, NAVY]}
        />
      }
    >
      <View style={styles.headerRow}>
        <Text style={styles.pageTitle}>Notificaciones</Text>
        <Pressable style={styles.refreshBtn} onPress={loadNotificaciones}>
          <Ionicons name="reload-outline" size={16} color={NAVY} />
          <Text style={styles.refreshBtnText}>Actualizar</Text>
        </Pressable>
      </View>

      {errorMsg && (
        <View style={styles.errorWrap}>
          <Ionicons name="cloud-offline-outline" size={20} color="#DC2626" />
          <Text style={styles.errorText}>{errorMsg}</Text>
          <Pressable style={styles.retryBtn} onPress={loadNotificaciones}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={GOLD} />
          <Text style={styles.loadingText}>Cargando notificaciones...</Text>
        </View>
      ) : items.length === 0 && !errorMsg ? (
        <View style={styles.card}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="notifications-off-outline" size={48} color={GOLD} />
          </View>
          <Text style={styles.cardTitle}>Centro de Alertas y Avisos</Text>
          <Text style={styles.cardText}>No tienes notificaciones pendientes en este momento.</Text>
          <Text style={styles.emptyHint}>Desliza hacia abajo para actualizar</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {items.map((item) => (
            <View key={item.id} style={styles.notifCard}>
              <View style={styles.iconCircle}>
                <Ionicons name="megaphone-outline" size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.notifHeader}>
                  <Text style={styles.notifTitle}>{item.titulo}</Text>
                  <Text style={styles.notifDate}>{item.fecha}</Text>
                </View>
                <Text style={styles.notifDest}>Para: {item.destinatario}</Text>
                <Text style={styles.notifBody}>{item.mensaje}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    paddingHorizontal: 28,
    paddingVertical: 20,
    paddingBottom: 40,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: NAVY,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  refreshBtnText: {
    color: NAVY,
    fontWeight: '600',
    fontSize: 13,
  },
  errorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: { color: '#DC2626', flex: 1, fontSize: 13 },
  retryBtn: { backgroundColor: '#DC2626', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  retryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  loadingWrap: { padding: 40, alignItems: 'center', gap: 10 },
  loadingText: { color: '#64748B' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: NAVY,
  },
  cardText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  emptyHint: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  listContainer: {
    gap: 12,
  },
  notifCard: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: NAVY,
  },
  notifDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  notifDest: {
    fontSize: 12,
    color: GOLD,
    marginTop: 2,
    fontWeight: '600',
  },
  notifBody: {
    fontSize: 14,
    color: '#334155',
    marginTop: 6,
    lineHeight: 20,
  },
});
