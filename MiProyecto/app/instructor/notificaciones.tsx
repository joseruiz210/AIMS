import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { comunicadosService, ComunicadoItem } from '../../services/comunicadosService';

const NAVY = '#0F1026';
const GOLD = '#cfa235';

export default function NotificacionesScreen() {
  const [items, setItems] = useState<ComunicadoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotificaciones();
  }, []);

  const loadNotificaciones = async () => {
    setLoading(true);
    try {
      const data = await comunicadosService.getComunicados();
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.pageTitle}>Notificaciones</Text>
        <Pressable style={styles.refreshBtn} onPress={loadNotificaciones}>
          <Ionicons name="reload-outline" size={16} color={NAVY} />
          <Text style={styles.refreshBtnText}>Actualizar</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={GOLD} />
          <Text style={{ marginTop: 10, color: '#64748B' }}>Cargando notificaciones...</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.card}>
          <Ionicons name="notifications-off-outline" size={40} color="#64748B" style={{ marginBottom: 8 }} />
          <Text style={styles.cardTitle}>Centro de Alertas y Avisos</Text>
          <Text style={styles.cardText}>No tienes notificaciones pendientes en este momento.</Text>
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
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  refreshBtnText: {
    color: NAVY,
    fontWeight: '600',
    fontSize: 13,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: NAVY,
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  listContainer: {
    gap: 12,
  },
  notifCard: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
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
