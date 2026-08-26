import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GOLD = '#D4AF37';
const BG_PAGE = '#F8FAFC';

export default function ConfiguracionScreenPremium() {
  const [notifEmail, setNotifEmail] = React.useState(true);
  const [notifPush, setNotifPush] = React.useState(true);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.pageTitle}>Configuración</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Notificaciones</Text>
        
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="mail-outline" size={20} color={GOLD} />
            <Text style={styles.rowText}>Notificaciones por Correo</Text>
          </View>
          <Switch value={notifEmail} onValueChange={setNotifEmail} trackColor={{ false: '#CBD5E1', true: GOLD }} />
        </View>

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="notifications-outline" size={20} color={GOLD} />
            <Text style={styles.rowText}>Alertas Push Móviles</Text>
          </View>
          <Switch value={notifPush} onValueChange={setNotifPush} trackColor={{ false: '#CBD5E1', true: GOLD }} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Seguridad y Cuenta</Text>
        
        <Pressable style={styles.btnAction}>
          <Ionicons name="key-outline" size={18} color="#1E293B" />
          <Text style={styles.btnActionText}>Cambiar Contraseña</Text>
        </Pressable>

        <Pressable style={styles.btnAction}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#1E293B" />
          <Text style={styles.btnActionText}>Verificación en dos pasos</Text>
        </Pressable>
      </View>
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
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  btnAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  btnActionText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
});
