import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ComunicadoItem, comunicadosService } from '../../services/comunicadosService';

export default function MensajesScreenPremium() {
  const [messages, setMessages] = useState<ComunicadoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { void loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      setMessages(await comunicadosService.getComunicados());
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    await comunicadosService.marcarLeido(id);
    setMessages(previous => previous.map(message => message.id === id ? { ...message, leidos: 1 } : message));
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color="#D4AF37" /><Text>Cargando mensajes...</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View><Text style={styles.title}>Mensajería y Comunicados</Text><Text style={styles.subtitle}>Canal institucional de avisos y notificaciones</Text></View>
        <Pressable style={styles.refresh} onPress={loadData}><Ionicons name="reload-outline" size={16} color="#475569" /><Text>Actualizar</Text></Pressable>
      </View>
      {messages.length === 0 ? <View style={styles.empty}><Ionicons name="mail-open-outline" size={44} color="#94A3B8" /><Text style={styles.emptyTitle}>Bandeja al día</Text><Text style={styles.subtitle}>No hay comunicados pendientes.</Text></View> : messages.map(message => (
        <Pressable key={message.id} style={styles.card} onPress={() => void markAsRead(message.id)}>
          <View style={styles.icon}><Ionicons name="mail-outline" size={22} color="#D4AF37" /></View>
          <View style={styles.messageBody}><Text style={styles.messageTitle}>{message.titulo}</Text><Text style={styles.messageText}>{message.mensaje}</Text><Text style={styles.date}>{message.fecha}</Text></View>
          {!message.leidos && <View style={styles.unread} />}
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 28, gap: 16, paddingBottom: 40 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  title: { color: '#0F172A', fontSize: 24, fontWeight: '700' },
  subtitle: { color: '#64748B', marginTop: 4 },
  refresh: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 9, backgroundColor: '#E2E8F0', borderRadius: 8 },
  empty: { alignItems: 'center', gap: 8, padding: 32, backgroundColor: '#FFFFFF', borderRadius: 16 },
  emptyTitle: { color: '#0F172A', fontSize: 16, fontWeight: '700' },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  icon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center' },
  messageBody: { flex: 1, gap: 5 },
  messageTitle: { color: '#0F172A', fontSize: 15, fontWeight: '700' },
  messageText: { color: '#475569', fontSize: 13 },
  date: { color: '#94A3B8', fontSize: 11 },
  unread: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D4AF37' },
});
