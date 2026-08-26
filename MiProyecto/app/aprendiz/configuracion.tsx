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
import ActionModal from '../../components/ActionModal';

const NAVY = '#12103C';
const GOLD = '#cfa235';

export default function ConfiguracionAprendizScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const [nombre, setNombre] = useState('Valentina Torres');
  const [correo, setCorreo] = useState('vtorres@formacionsena.edu.co');
  const [telefono, setTelefono] = useState('+57 312 456 7890');
  const ficha = '2845671 - ADSO';
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');

  const [modalVisible, setModalVisible] = useState(false);

  const handleSave = () => {
    setModalVisible(true);
  };

  const pad = isDesktop ? 24 : 14;

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.contentContainer, { padding: pad }]}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Text style={styles.pageTitle}>Configuración de Perfil</Text>
        <Text style={styles.pageSubtitle}>Actualiza tus datos personales y credenciales de acceso.</Text>
      </View>

      {/* Profile Card Box */}
      <View style={styles.cardBox}>
        <Text style={styles.sectionHeaderTitle}>INFORMACIÓN PERSONAL</Text>

        {/* Nombre */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Nombre Completo</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
            />
          </View>
        </View>

        {/* Correo */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Correo Institucional</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              value={correo}
              onChangeText={setCorreo}
              keyboardType="email-address"
            />
          </View>
        </View>

        {/* Teléfono */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Teléfono de Contacto</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Ficha & Programa */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Ficha Asignada</Text>
          <View style={[styles.inputWrapper, styles.inputDisabled]}>
            <Ionicons name="school-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.input, { color: '#64748B' }]}
              value={ficha}
              editable={false}
            />
          </View>
        </View>

        {/* Security Section */}
        <Text style={[styles.sectionHeaderTitle, { marginTop: 24 }]}>SEGURIDAD & CONTRASEÑA</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Contraseña Actual</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              placeholder="••••••••••••"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={currentPass}
              onChangeText={setCurrentPass}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Nueva Contraseña</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="key-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              placeholder="••••••••••••"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={newPass}
              onChangeText={setNewPass}
            />
          </View>
        </View>

        {/* Submit Save Button */}
        <Pressable
          style={({ hovered }: any) => [styles.saveBtn, hovered && styles.saveBtnHover]}
          onPress={handleSave}
        >
          <Ionicons name="save-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.saveBtnText}>Guardar Cambios de Perfil</Text>
        </Pressable>
      </View>

      {/* Confirmation Modal */}
      <ActionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Confirmación de Actualización"
        subtitle="Los cambios del perfil han sido guardados"
        iconName="checkmark-circle-outline"
        confirmText="Aceptar"
        fields={[
          { label: 'Nombre Registrado', placeholder: nombre },
          { label: 'Correo de Notificaciones', placeholder: correo },
        ]}
      />
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
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: NAVY,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  cardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#D0D8E4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
  },
  sectionHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: NAVY,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  inputDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#D0D8E4',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: NAVY,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GOLD,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
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





