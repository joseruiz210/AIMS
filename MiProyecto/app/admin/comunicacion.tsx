import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { comunicadosService, ComunicadoItem } from '../../services/comunicadosService';
import { authService } from '../../services/authService';
import { getApiBaseUrl } from '../../services/api';

const NAVY = '#12103C';
const GOLD = '#cfa235';

interface ComunicadoEnviado {
  id: string;
  titulo: string;
  destinatario: string;
  fecha: string;
  leidos: number;
}

export default function ComunicacionAdminScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 850;

  const [destinatario, setDestinatario] = useState('Todos los aprendices');
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviados, setEnviados] = useState<ComunicadoEnviado[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [feedback, setFeedback] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadComunicados();
  }, []);

  const loadComunicados = async () => {
    setLoadingHistory(true);
    try {
      const data = await comunicadosService.getComunicados();
      setEnviados(
        data.map((c: ComunicadoItem) => ({
          id: c.id,
          titulo: c.titulo,
          destinatario: c.destinatario || 'Todos los usuarios',
          fecha: c.fecha || 'Sin fecha',
          leidos: c.leidos || 0,
        }))
      );
    } catch (err) {
      console.error('Error al cargar comunicados:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleEnviar = async () => {
    if (!asunto || !mensaje) return;
    setSending(true);
    try {
      const API_BASE_URL = getApiBaseUrl();
      const response = await authService.fetchWithAuth(`${API_BASE_URL}/comunicados`, {
        method: 'POST',
        body: JSON.stringify({ titulo: asunto, mensaje }),
      });
      if (response.ok) {
        setAsunto('');
        setMensaje('');
        setFeedback(true);
        setTimeout(() => setFeedback(false), 3000);
        await loadComunicados();
      }
    } catch (err) {
      console.error('Error al enviar comunicado:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Text style={styles.pageTitle}>Comunicación</Text>
      </View>

      {/* Main Grid: Form + History */}
      <View style={[styles.mainLayout, !isDesktop && styles.mainLayoutMobile]}>
        {/* Left Form Box */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeaderTitle}>NUEVO COMUNICADO</Text>

          {/* Feedback banner */}
          {feedback && (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" style={{ marginRight: 6 }} />
              <Text style={styles.successText}>¡Comunicado enviado con éxito!</Text>
            </View>
          )}

          {/* Destinatario */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>DESTINARIO</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Todos los aprendices, Ficha XXX..."
                placeholderTextColor="#94A3B8"
                value={destinatario}
                onChangeText={setDestinatario}
              />
            </View>
          </View>

          {/* Asunto */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>ASUNTO</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Escribe el asunto"
                placeholderTextColor="#94A3B8"
                value={asunto}
                onChangeText={setAsunto}
              />
            </View>
          </View>

          {/* Mensaje */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>MENSAJE</Text>
            <View style={[styles.inputWrapper, { height: 120, alignItems: 'flex-start' }]}>
              <TextInput
                style={[styles.input, { height: '100%', textAlignVertical: 'top' }]}
                placeholder="Escribe tu comunicado aquí..."
                placeholderTextColor="#94A3B8"
                multiline
                value={mensaje}
                onChangeText={setMensaje}
              />
            </View>
          </View>

          {/* Submit Button */}
          <Pressable
            style={({ hovered }: any) => [styles.sendBtn, (hovered || sending) && styles.sendBtnHover]}
            onPress={handleEnviar}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
            ) : (
              <Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            )}
            <Text style={styles.sendBtnText}>{sending ? 'Enviando...' : 'Enviar comunicado'}</Text>
          </Pressable>
        </View>

        {/* Right History Box */}
        <View style={styles.historyCard}>
          <Text style={styles.cardHeaderTitleDark}>Comunicados enviados</Text>

          {loadingHistory ? (
            <ActivityIndicator size="small" color="#cfa235" style={{ marginVertical: 20 }} />
          ) : enviados.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Ionicons name="chatbubble-outline" size={36} color="#94A3B8" />
              <Text style={{ color: '#64748B', marginTop: 8, fontSize: 13 }}>No hay comunicados enviados</Text>
            </View>
          ) : (
          <View style={styles.historyList}>
            {enviados.map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{item.titulo}</Text>
                  <Text style={styles.itemDate}>{item.fecha}</Text>
                </View>

                <View style={styles.itemFooter}>
                  <Text style={styles.itemDest}>Para: {item.destinatario}</Text>
                  <View style={styles.readBadge}>
                    <Ionicons name="eye-outline" size={14} color="#64748B" style={{ marginRight: 4 }} />
                    <Text style={styles.readText}>{item.leidos} leídos</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
          )}
        </View>
      </View>
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
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: NAVY,
  },
  mainLayout: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'flex-start',
  },
  mainLayoutMobile: {
    flexDirection: 'column',
  },
  formCard: {
    flex: 1.2,
    backgroundColor: '#D9D9D9',
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  historyCard: {
    flex: 1,
    backgroundColor: '#EAEAEA',
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginBottom: 18,
  },
  cardHeaderTitleDark: {
    fontSize: 15,
    fontWeight: '700',
    color: NAVY,
    marginBottom: 18,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DEF7EC',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  successText: {
    fontSize: 13,
    color: '#03543F',
    fontWeight: '600',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: {
    fontSize: 14,
    color: NAVY,
    flex: 1,
  },
  sendBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: GOLD,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  sendBtnHover: {
    backgroundColor: '#b88d2a',
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: NAVY,
    flex: 1,
    marginRight: 8,
  },
  itemDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  itemDest: {
    fontSize: 13,
    color: '#64748B',
  },
  readBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readText: {
    fontSize: 12,
    color: '#64748B',
  },
});
