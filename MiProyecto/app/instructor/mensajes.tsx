import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { comunicadosService, ComunicadoItem } from '../../services/comunicadosService';

const GOLD = '#D4AF37';
const BG_PAGE = '#F8FAFC';
const NAVY = '#0F1026';

export default function MensajesScreen() {
  const [messages, setMessages] = useState<ComunicadoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      setMessages(await comunicadosService.getComunicados());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const markAsRead = async (id: string) => {
    await comunicadosService.marcarLeido(id);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GOLD} />
        <Text style={styles.mutedText}>Cargando mensajes...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Mensajeria y comunicados</Text>
          <Text style={styles.subtitle}>Avisos y notificaciones institucionales</Text>
        </View>
        <Pressable style={styles.refreshButton} onPress={loadData}>
          <Ionicons name="reload-outline" size={18} color={NAVY} />
          <Text style={styles.refreshText}>Actualizar</Text>
        </Pressable>
      </View>

      {messages.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="mail-open-outline" size={44} color="#94A3B8" />
          <Text style={styles.cardTitle}>Bandeja al dia</Text>
          <Text style={styles.mutedText}>No hay mensajes o comunicados pendientes.</Text>
        </View>
      ) : messages.map((message) => (
        <Pressable key={message.id} style={styles.messageCard} onPress={() => markAsRead(message.id)}>
          <View style={styles.avatar}>
            <Ionicons name="megaphone-outline" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.flexOne}>
            <View style={styles.messageHeader}>
              <Text style={styles.cardTitle}>{message.titulo}</Text>
              <Text style={styles.mutedText}>{message.fecha}</Text>
            </View>
            <Text style={styles.destination}>Destinatario: {message.destinatario}</Text>
            <Text style={styles.messageText}>{message.mensaje}</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_PAGE },
  content: { padding: 28, paddingBottom: 48 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: BG_PAGE },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 },
  title: { color: NAVY, fontSize: 25, fontWeight: '700' },
  subtitle: { color: '#64748B', marginTop: 5 },
  refreshButton: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, backgroundColor: '#FFFFFF', borderRadius: 8 },
  refreshText: { color: NAVY, fontWeight: '600' },
  messageCard: { flexDirection: 'row', gap: 14, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 18, marginBottom: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: NAVY, alignItems: 'center', justifyContent: 'center' },
  messageHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  messageText: { color: '#334155', marginTop: 8, lineHeight: 21 },
  destination: { color: GOLD, fontSize: 12, marginTop: 5 },
  flexOne: { flex: 1 },
  cardTitle: { color: NAVY, fontSize: 16, fontWeight: '700' },
  mutedText: { color: '#64748B', fontSize: 14 },
  emptyCard: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 32, gap: 10 },
});
