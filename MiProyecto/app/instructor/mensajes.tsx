import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { comunicadosService, ComunicadoItem } from '../../services/comunicadosService';

const GOLD = '#D4AF37';
const BG_PAGE = '#F8FAFC';
const NAVY = '#0F1026';

export default function MensajesScreen() {
  const [messages, setMessages] = useState<ComunicadoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      setMessages(await comunicadosService.getComunicados());
    } catch (error: any) {
      console.error('Error cargando mensajes:', error);
      setErrorMsg(error?.message || 'No se pudieron cargar los mensajes. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    loadData().finally(() => { if (!isMounted) return; });
    return () => { isMounted = false; };
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setErrorMsg(null);
    try {
      setMessages(await comunicadosService.getComunicados());
    } catch (error: any) {
      setErrorMsg(error?.message || 'No se pudieron cargar los mensajes.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await comunicadosService.marcarLeido(id);
      setMessages(previous => previous.map(message => message.id === id ? { ...message, leidos: 1 } : message));
    } catch (error) {
      console.error('Error marcando como leído:', error);
    }
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
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
        <View>
          <Text style={styles.title}>Mensajería y comunicados</Text>
          <Text style={styles.subtitle}>Avisos y notificaciones institucionales</Text>
        </View>
        <Pressable style={styles.refreshButton} onPress={loadData}>
          <Ionicons name="reload-outline" size={18} color={NAVY} />
          <Text style={styles.refreshText}>Actualizar</Text>
        </Pressable>
      </View>

      {errorMsg && (
        <View style={styles.errorWrap}>
          <Ionicons name="cloud-offline-outline" size={20} color="#DC2626" />
          <Text style={styles.errorText}>{errorMsg}</Text>
          <Pressable style={styles.retryBtn} onPress={loadData}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      )}

      {messages.length === 0 && !errorMsg ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="mail-open-outline" size={48} color={GOLD} />
          </View>
          <Text style={styles.cardTitle}>Bandeja al día</Text>
          <Text style={styles.mutedText}>No hay mensajes o comunicados pendientes.</Text>
          <Text style={styles.emptyHint}>Desliza hacia abajo para actualizar</Text>
        </View>
      ) : messages.map((message) => (
        <Pressable key={message.id} style={styles.messageCard} onPress={() => void markAsRead(message.id)}>
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
  content: { padding: 28, paddingBottom: 48, gap: 12 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: BG_PAGE },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 8 },
  title: { color: NAVY, fontSize: 25, fontWeight: '700' },
  subtitle: { color: '#64748B', marginTop: 5 },
  refreshButton: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  refreshText: { color: NAVY, fontWeight: '600' },
  errorWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FEF2F2', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#FECACA' },
  errorText: { color: '#DC2626', flex: 1, fontSize: 13 },
  retryBtn: { backgroundColor: '#DC2626', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  retryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  messageCard: { flexDirection: 'row', gap: 14, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 18, borderWidth: 1, borderColor: '#E2E8F0' },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: NAVY, alignItems: 'center', justifyContent: 'center' },
  messageHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  messageText: { color: '#334155', marginTop: 8, lineHeight: 21 },
  destination: { color: GOLD, fontSize: 12, marginTop: 5, fontWeight: '600' },
  flexOne: { flex: 1 },
  cardTitle: { color: NAVY, fontSize: 16, fontWeight: '700' },
  mutedText: { color: '#64748B', fontSize: 14 },
  emptyCard: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 40, gap: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  emptyIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyHint: { color: '#94A3B8', fontSize: 12, marginTop: 4, fontStyle: 'italic' },
});
