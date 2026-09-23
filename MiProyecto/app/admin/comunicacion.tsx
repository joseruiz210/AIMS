import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  useWindowDimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { comunicadosService } from '../../services/comunicadosService';
import { adminService } from '../../services/adminService';

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
  const [feedback, setFeedback] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadEnviados = useCallback(async () => {
    try {
      const list = await comunicadosService.getComunicados();
      if (Array.isArray(list)) {
        setEnviados(
          list.map((c) => ({
            id: c.id,
            titulo: c.titulo,
            destinatario: c.destinatario || 'General',
            fecha: c.fecha || 'Reciente',
            leidos: c.leidos || 0,
          }))
        );
      } else {
        setEnviados([]);
      }
    } catch (err) {
      console.error('Error cargando historial de comunicados:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEnviados();
  }, [loadEnviados]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEnviados();
  }, [loadEnviados]);

  const handleEnviar = async () => {
    setErrorMessage(null);
    if (!asunto.trim()) {
      setErrorMessage('Por favor escribe el asunto del comunicado.');
      return;
    }
    if (!mensaje.trim()) {
      setErrorMessage('Por favor escribe el mensaje a transmitir.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Guardar comunicado oficial en el backend
      const nuevo = await comunicadosService.crearComunicado({
        titulo: asunto.trim(),
        mensaje: mensaje.trim(),
        destinatario: destinatario.trim() || 'Todos los usuarios',
        autor: 'Administración',
        tipo: 'INSTITUCIONAL',
      });

      // 2. Despachar notificación Push e interna a los destinatarios objetivo
      const targetRole = destinatario.toLowerCase().includes('aprendiz')
        ? 'APRENDIZ'
        : destinatario.toLowerCase().includes('instructor')
        ? 'INSTRUCTOR'
        : null;

      try {
        await adminService.sendGlobalNotification({
          title: asunto.trim(),
          body: mensaje.trim(),
          tipo: 'COMUNICADO',
          targetRole,
        });
      } catch (pushErr) {
        console.warn('Advertencia al enviar notificación push global:', pushErr);
      }

      setEnviados((prev) => [
        {
          id: nuevo.id,
          titulo: nuevo.titulo,
          destinatario: nuevo.destinatario,
          fecha: nuevo.fecha,
          leidos: 0,
        },
        ...prev,
      ]);

      setAsunto('');
      setMensaje('');
      setFeedback(true);
      setTimeout(() => setFeedback(false), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al enviar el comunicado. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <Text style={styles.successText}>¡Comunicado enviado con éxito a los aprendices y usuarios!</Text>
            </View>
          )}

          {/* Error banner */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Destinatario */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>DESTINATARIO</Text>
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
<<<<<<< HEAD
            style={({ hovered }: any) => [styles.sendBtn, (hovered || sending) && styles.sendBtnHover]}
            onPress={handleEnviar}
            disabled={sending}
          >
            {sending ? (
=======
            style={({ hovered }: any) => [
              styles.sendBtn,
              hovered && styles.sendBtnHover,
              isSubmitting && { opacity: 0.7 },
            ]}
            onPress={handleEnviar}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
>>>>>>> origin/main
              <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
            ) : (
              <Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            )}
<<<<<<< HEAD
            <Text style={styles.sendBtnText}>{sending ? 'Enviando...' : 'Enviar comunicado'}</Text>
=======
            <Text style={styles.sendBtnText}>
              {isSubmitting ? 'Enviando...' : 'Enviar comunicado'}
            </Text>
>>>>>>> origin/main
          </Pressable>
        </View>

        {/* Right History Box */}
        <View style={styles.historyCard}>
          <View style={styles.historyHeaderRow}>
            <Text style={styles.cardHeaderTitleDark}>Comunicados enviados</Text>
            <Pressable onPress={loadEnviados}>
              <Ionicons name="refresh-outline" size={18} color="#64748B" />
            </Pressable>
          </View>

          {loading ? (
            <View style={{ paddingVertical: 30, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={GOLD} />
              <Text style={{ marginTop: 8, color: '#64748B', fontSize: 13 }}>Cargando enviados...</Text>
            </View>
          ) : enviados.length === 0 ? (
            <View style={{ paddingVertical: 30, alignItems: 'center' }}>
              <Ionicons name="chatbubbles-outline" size={36} color="#94A3B8" />
              <Text style={{ marginTop: 8, color: '#64748B', fontSize: 14 }}>No hay comunicados enviados aún</Text>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  historyCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 1.2,
    marginBottom: 18,
  },
  cardHeaderTitleDark: {
    fontSize: 15,
    fontWeight: '700',
    color: NAVY,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    color: '#15803D',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    justifyContent: 'center',
    height: 44,
  },
  input: {
    fontSize: 14,
    color: '#0F172A',
  },
  sendBtn: {
    backgroundColor: GOLD,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  sendBtnHover: {
    opacity: 0.9,
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
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
  },
  itemDest: {
    fontSize: 12,
    color: '#64748B',
  },
  readBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  readText: {
    fontSize: 11,
    color: '#64748B',
  },
});
