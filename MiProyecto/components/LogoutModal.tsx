import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NAVY = '#12103C';
const GOLD = '#cfa235';

interface LogoutModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({ visible, onClose, onConfirm }: LogoutModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header Title */}
          <Text style={styles.title}>Cerrar Sesión en AIMS</Text>

          {/* Exit Icon Illustration */}
          <View style={styles.iconContainer}>
            <View style={styles.iconBox}>
              <Ionicons name="log-out-outline" size={56} color="#3B82F6" />
            </View>
          </View>

          {/* Main Question */}
          <Text style={styles.questionText}>
            ¿Estas seguro de que deseas salir de la plataforma?
          </Text>

          {/* Subtext Notice */}
          <Text style={styles.subtext}>
            Se guardarán todos tus cambios de la sesión actual.
          </Text>

          {/* Action Buttons Row */}
          <View style={styles.buttonsRow}>
            <Pressable
              style={({ hovered }: any) => [
                styles.cancelBtn,
                hovered && styles.cancelBtnHover,
              ]}
              onPress={onClose}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </Pressable>

            <Pressable
              style={({ hovered }: any) => [
                styles.confirmBtn,
                hovered && styles.confirmBtnHover,
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmBtnText}>Si, cerrar sesión</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '90%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: NAVY,
    marginBottom: 20,
    textAlign: 'center',
  },
  iconContainer: {
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 100,
    height: 100,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 14,
    paddingHorizontal: 10,
  },
  subtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 26,
    paddingHorizontal: 10,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 14,
    width: '100%',
    justifyContent: 'center',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtnHover: {
    backgroundColor: '#D1D5DB',
  },
  cancelBtnText: {
    color: '#1F2937',
    fontWeight: '600',
    fontSize: 15,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: GOLD,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmBtnHover: {
    backgroundColor: '#b88d2a',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
