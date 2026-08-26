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

type TabType = 'Institución' | 'Período académico' | 'Notificaciones' | 'Seguridad';

export default function ConfiguracionAdminScreen() {
  const { width } = useWindowDimensions();

  const [activeTab, setActiveTab] = useState<TabType>('Institución');

  // Institution State
  const [nombreCentro, setNombreCentro] = useState('Centro de Formación SENA');
  const [nit, setNit] = useState('8999999034');
  const [direccion, setDireccion] = useState('Calle 37 # 45, Medellín');
  const [correoInst, setCorreoInst] = useState('hcdhcdhcgd@sena.edu.co');
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSave = () => {
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Text style={styles.pageTitle}>Configuración</Text>
      </View>

      {/* Tabs Row */}
      <View style={styles.tabsRow}>
        {(['Institución', 'Período académico', 'Notificaciones', 'Seguridad'] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setActiveTab(t)}
            style={[styles.tabBtn, activeTab === t && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
              {t}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Form Card Box */}
      <View style={styles.formCard}>
        <Text style={styles.cardHeaderTitle}>INFORMACION DE LA INSTITUCION</Text>

        {savedFeedback && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" style={{ marginRight: 6 }} />
            <Text style={styles.successText}>¡Configuración guardada correctamente!</Text>
          </View>
        )}

        {/* NOMBRE DEL CENTRO */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>NOMBRE DEL CENTRO</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={nombreCentro}
              onChangeText={setNombreCentro}
            />
          </View>
        </View>

        {/* NIT */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>NIT</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={nit}
              onChangeText={setNit}
            />
          </View>
        </View>

        {/* DIRECCIÓN */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>DIRECCION</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={direccion}
              onChangeText={setDireccion}
            />
          </View>
        </View>

        {/* CORREO INSTITUCIONAL */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>CORREO INSTITUCIONAL</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={correoInst}
              onChangeText={setCorreoInst}
              keyboardType="email-address"
            />
          </View>
        </View>

        {/* Save Button */}
        <Pressable
          style={({ hovered }: any) => [styles.saveBtn, hovered && styles.saveBtnHover]}
          onPress={handleSave}
        >
          <Text style={styles.saveBtnText}>Guardar cambios</Text>
        </Pressable>
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
  tabsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 22,
  },
  tabBtn: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: GOLD,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#D9D9D9',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.8,
    marginBottom: 20,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DEF7EC',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
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
  },
  saveBtn: {
    backgroundColor: GOLD,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveBtnHover: {
    backgroundColor: '#b88d2a',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
