import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { comunicadosService, ComunicadoItem } from '../../services/comunicadosService';

const GOLD = '#D4AF37';
const BG_PAGE = '#F8FAFC';
const NAVY = '#0F1026';

const MESSAGES = [
  {
    id: '1',
    sender: 'Carlos Mendoza',
    initials: 'CM',
    time: '10:45 AM',
    text: 'Profesor, adjunto la excusa médica de la semana pasada.',
    unread: true,
  },
  {
    id: '2',
    sender: 'Laura Jiménez',
    initials: 'LJ',
    time: 'Ayer',
    text: 'Muchas gracias por el material de refuerzo en SQL.',
    unread: false,
  },
];
export default function MensajesScreenPremium() {
  const [messages, setMessages] = useState<ComunicadoItem[]>([]);
  const [loading, setLoading] = useState(true);

export default function MensajesScreenPremium() {
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await comunicadosService.getComunicados();
      setMessages(data);
    } catch (err) {
      console.error('Error cargando mensajes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePressMessage = async (id: string) => {
    await comunicadosService.marcarLeido(id);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GOLD} />
        <Text style={styles.loadingText}>Cargando mensajes desde PostgreSQL...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.pageTitle}>Mensajes</Text>
      
      <View style={styles.list}>
        {MESSAGES.map(item => (
          <Pressable key={item.id} style={[styles.msgCard, item.unread && styles.msgCardUnread]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.initials}</Text>
            </View>
            <View style={styles.contentWrap}>
              <View style={styles.topRow}>
                <Text style={styles.sender}>{item.sender}</Text>
                <Text style={styles.time}>{item.time}</Text>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>Mensajería y Comunicados</Text>
          <Text style={styles.pageSubtitle}>Canal institucional de avisos y notificaciones</Text>
        </View>

        <Pressable style={styles.refreshBtn} onPress={loadData}>
          <Ionicons name="reload-outline" size={16} color="#475569" />
          <Text style={styles.refreshBtnText}>Actualizar</Text>
        </Pressable>
      </View>

      {messages.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="mail-open-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyTitle}>Bandeja al día</Text>
          <Text style={styles.emptySub}>
            No tienes mensajes o comunicados institucionales pendientes en la base de datos.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {messages.map(item => (
            <Pressable
              key={item.id}
              style={styles.msgCard}
              onPress={() => handlePressMessage(item.id)}
            >
              <View style={styles.avatar}>
                <Ionicons name="megaphone-outline" size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.msgText}>{item.text}</Text>
            </View>
          </Pressable>
        ))}
      </View>
              <View style={styles.contentWrap}>
                <View style={styles.topRow}>
                  <Text style={styles.sender}>{item.titulo}</Text>
                  <Text style={styles.time}>{item.fecha}</Text>
                </View>
                <Text style={styles.destText}>Destinatario: {item.destinatario}</Text>
                <Text style={styles.msgText}>{item.mensaje}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_PAGE,
  },
  contentContainer: {
    paddingHorizontal: 28,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: BG_PAGE,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  headerRow: {
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
    color: '#0F172A',
    marginBottom: 20,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
  },
  refreshBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  list: {
    gap: 12,
    gap: 14,
  },
  msgCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowRadius: 8,
    elevation: 2,
  },
  msgCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: GOLD,
    backgroundColor: '#FFFDF5',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: NAVY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  contentWrap: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sender: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: '#64748B',
  },
  destText: {
    fontSize: 12,
    color: GOLD,
    fontWeight: '600',
    marginBottom: 6,
  },
  msgText: {
    fontSize: 13,
    color: '#475569',
    color: '#334155',
    lineHeight: 19,
  },
});
