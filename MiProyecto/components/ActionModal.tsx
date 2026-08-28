import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NAVY = '#12103C';
const GOLD = '#cfa235';

interface ActionModalField {
  label: string;
  placeholder?: string;
  type?: 'text' | 'select' | 'multiline';
}

interface ActionModalProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  iconName?: any;
  fields?: ActionModalField[];
  confirmText?: string;
  onClose: () => void;
  onSubmit?: (values: Record<string, string>) => void;
}

export default function ActionModal({
  visible,
  title,
  subtitle,
  iconName = 'sparkles-outline',
  fields = [
    { label: 'Nombre o Identificación', placeholder: 'Ingrese la información...' },
    { label: 'Detalles / Descripción', placeholder: 'Escriba una descripción opcional...', type: 'multiline' },
  ],
  confirmText = 'Guardar / Procesar',
  onClose,
  onSubmit,
}: ActionModalProps) {
  const [successMsg, setSuccessMsg] = React.useState(false);
  const [formValues, setFormValues] = React.useState<Record<string, string>>({});

  const handleAction = async () => {
    if (onSubmit) {
      onSubmit(formValues);
    }
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      setFormValues({});
      onClose();
    }, 1200);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header Bar */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.iconBadge}>
                <Ionicons name={iconName} size={20} color={GOLD} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{title}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
              </View>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748B" />
            </Pressable>
          </View>

          {/* Form Content */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {successMsg ? (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle-outline" size={48} color="#10B981" />
                <Text style={styles.successTitle}>¡Acción procesada!</Text>
                <Text style={styles.successSub}>
                  El registro se ha procesado correctamente en la vista previa.
                </Text>
              </View>
            ) : (
              <View style={styles.formContainer}>
                {fields.map((field, idx) => (
                  <View key={idx} style={styles.fieldGroup}>
                    <Text style={styles.label}>{field.label}</Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        field.type === 'multiline' && styles.inputWrapperMultiline,
                      ]}
                    >
                      <TextInput
                        style={[
                          styles.input,
                          field.type === 'multiline' && styles.inputMultiline,
                        ]}
                        placeholder={field.placeholder || 'Ingrese valor...'}
                        placeholderTextColor="#94A3B8"
                        multiline={field.type === 'multiline'}
                        value={formValues[field.label] || ''}
                        onChangeText={(val) => setFormValues(prev => ({ ...prev, [field.label]: val }))}
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          {!successMsg && (
            <View style={styles.footer}>
              <Pressable style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Cerrar</Text>
              </Pressable>
              <Pressable style={styles.submitBtn} onPress={handleAction}>
                <Text style={styles.submitText}>{confirmText}</Text>
              </Pressable>
            </View>
          )}
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
    width: '92%',
    maxWidth: 500,
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(207, 162, 53, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: NAVY,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
  },
  body: {
    padding: 20,
  },
  formContainer: {
    gap: 14,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  inputWrapper: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputWrapperMultiline: {
    height: 90,
  },
  input: {
    fontSize: 14,
    color: NAVY,
  },
  inputMultiline: {
    height: '100%',
    textAlignVertical: 'top',
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: NAVY,
    marginTop: 12,
  },
  successSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  cancelText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
  },
  submitBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: GOLD,
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
