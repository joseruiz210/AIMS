import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ComunicadoItem, comunicadosService } from '../../services/comunicadosService';

const NAVY = '#0F1026';
const GOLD = '#D4AF37';

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
    void loadData();
  }, []);

  const markAsRead = async (id: string) => {
    await comunicadosService.marcarLeido(id);
    setMessages((current) => current.map((message) => message.id === id ? { ...message, leidos: 1 } : message));
  };

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color={GOLD} /><Text style={styles.muted}>Cargando mensajes...</Text></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View><Text style={styles.title}>Mensajería y comunicados</Text><Text style={styles.subtitle}>Avisos y notificaciones institucionales</Text></View>
        <Pressable style={styles.refresh} onPress={() => void loadData()}><Ionicons name="reload-outline" size={18} color={NAVY} /><Text>Actualizar</Text></Pressable>
      </View>
      {messages.length === 0 ? (
        <View style={styles.empty}><Ionicons name="mail-open-outline" size={44} color="#94A3B8" /><Text style={styles.titleSmall}>Bandeja al día</Text><Text style={styles.muted}>No hay comunicados pendientes.</Text></View>
      ) : messages.map((message) => (
        <Pressable key={message.id} style={styles.card} onPress={() => void markAsRead(message.id)}>
          <View style={styles.icon}><Ionicons name="megaphone-outline" size={20} color="#FFFFFF" /></View>
          <View style={styles.body}><Text style={styles.titleSmall}>{message.titulo}</Text><Text style={styles.destination}>Destinatario: {message.destinatario}</Text><Text style={styles.text}>{message.mensaje}</Text><Text style={styles.muted}>{message.fecha}</Text></View>
          {!message.leidos && <View style={styles.unread} />}
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' }, content: { padding: 28, paddingBottom: 48, gap: 12 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 8 },
  title: { color: NAVY, fontSize: 25, fontWeight: '700' }, titleSmall: { color: NAVY, fontSize: 16, fontWeight: '700' },
  subtitle: { color: '#64748B', marginTop: 5 }, muted: { color: '#64748B', fontSize: 14 },
  refresh: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, backgroundColor: '#FFFFFF', borderRadius: 8 },
  empty: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 32, gap: 10 },
  card: { flexDirection: 'row', gap: 14, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 18 },
  icon: { width: 42, height: 42, borderRadius: 21, backgroundColor: NAVY, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 5 }, destination: { color: GOLD, fontSize: 12 }, text: { color: '#334155', lineHeight: 21 },
  unread: { width: 8, height: 8, borderRadius: 4, backgroundColor: GOLD },
});
