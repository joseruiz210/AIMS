import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NAVY = '#12103C';
const GOLD = '#cfa235';

interface ComunicadoEnviado {
  id: string;
  titulo: string;
  destinatario: string;
  fecha: string;
  leidos: number;
}

const INITIAL_ENVIADOS: ComunicadoEnviado[] = [
  {
    id: '1',
    titulo: 'Recordatorio de entrega final',
    destinatario: 'Todos los aprendices',
    fecha: '28 Jul',
    leidos: 648,
  },
  {
    id: '2',
    titulo: 'Reunión de coordinación - agosto',
    destinatario: 'Instructores',
    fecha: '22 Jul',
    leidos: 37,
  },
  {
    id: '3',
    titulo: 'Cambio de salón para mañana',
    destinatario: 'Ficha 1234321',
    fecha: '18 Jul',
    leidos: 26,
  },
];

export default function ComunicacionAdminScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 850;

  const [destinatario, setDestinatario] = useState('Todos los aprendices');
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviados, setEnviados] = useState<ComunicadoEnviado[]>(INITIAL_ENVIADOS);
  const [feedback, setFeedback] = useState(false);

  const handleEnviar = () => {
    if (!asunto || !mensaje) return;
    const nuevo: ComunicadoEnviado = {
      id: Date.now().toString(),
      titulo: asunto,
      destinatario: destinatario || 'Todos los usuarios',
      fecha: 'Hoy',
      leidos: 0,
    };
    setEnviados([nuevo, ...enviados]);
    setAsunto('');
    setMensaje('');
    setFeedback(true);
    setTimeout(() => setFeedback(false), 3000);
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
            style={({ hovered }: any) => [styles.sendBtn, hovered && styles.sendBtnHover]}
            onPress={handleEnviar}
          >
            <Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.sendBtnText}>Enviar comunicado</Text>
          </Pressable>
        </View>

        {/* Right History Box */}
        <View style={styles.historyCard}>
          <Text style={styles.cardHeaderTitleDark}>Comunicados enviados</Text>

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
