import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GOLD = '#D4AF37';
const NAVY = '#0F1026';
const BG_PAGE = '#F8FAFC';

interface Observation {
  id: string;
  studentName: string;
  category: 'Académica' | 'Disciplinaria';
  date: string;
  description: string;
}

const INITIAL_OBSERVATIONS: Observation[] = [
  {
    id: '1',
    studentName: 'Laura Jiménez',
    category: 'Académica',
    date: '28 Jul',
    description: 'Presenta dificultades en algoritmos recursivos. Se recomienda refuerzo.',
  },
  {
    id: '2',
    studentName: 'María Castillo',
    category: 'Disciplinaria',
    date: '25 Jul',
    description: 'Llegó tarde en tres ocasiones sin justificación. Se notificó al coordinador.',
  },
  {
    id: '3',
    studentName: 'Carlos Mendoza',
    category: 'Académica',
    date: '20 Jul',
    description: 'Mejoró notablemente en los ejercicios de SQL. Avance muy positivo.',
  },
];

export default function ObservacionesScreenPremium() {
  const [observations, setObservations] = useState<Observation[]>(INITIAL_OBSERVATIONS);
  const [modalVisible, setModalVisible] = useState(false);

  // Form state
  const [studentName, setStudentName] = useState('');
  const [category, setCategory] = useState<'Académica' | 'Disciplinaria'>('Académica');
  const [description, setDescription] = useState('');

  const handleAddObservation = () => {
    if (!studentName.trim() || !description.trim()) return;

    const newObs: Observation = {
      id: Date.now().toString(),
      studentName: studentName.trim(),
      category,
      date: 'Hoy',
      description: description.trim(),
    };

    setObservations([newObs, ...observations]);
    setStudentName('');
    setDescription('');
    setCategory('Académica');
    setModalVisible(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top Header Row with Title and + Nueva button */}
      <View style={styles.headerRow}>
        <Text style={styles.pageTitle}>Observaciones</Text>

        <Pressable style={styles.btnNueva} onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.btnNuevaText}>+ Nueva</Text>
        </Pressable>
      </View>

      {/* Observation Cards List */}
      <View style={styles.cardsList}>
        {observations.map((obs) => (
          <View key={obs.id} style={styles.obsCard}>
            <View style={styles.cardTopRow}>
              <View style={styles.nameCategoryGroup}>
                <Text style={styles.studentName}>{obs.studentName}</Text>
                
                <View
                  style={[
                    styles.categoryPill,
                    obs.category === 'Disciplinaria' ? styles.catRedBg : styles.catGoldBg,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      obs.category === 'Disciplinaria' ? styles.catRedText : styles.catGoldText,
                    ]}
                  >
                    {obs.category}
                  </Text>
                </View>
              </View>

              <Text style={styles.dateText}>{obs.date}</Text>
            </View>

            <Text style={styles.descriptionText}>{obs.description}</Text>
          </View>
        ))}
      </View>

      {/* Modal for adding new observation */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva Observación</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </Pressable>
            </View>

            <Text style={styles.label}>Aprendiz</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre del aprendiz"
              placeholderTextColor="#94A3B8"
              value={studentName}
              onChangeText={setStudentName}
            />

            <Text style={styles.label}>Categoría</Text>
            <View style={styles.categorySelector}>
              <Pressable
                style={[styles.catOption, category === 'Académica' && styles.catOptionSelected]}
                onPress={() => setCategory('Académica')}
              >
                <Text style={[styles.catOptionText, category === 'Académica' && styles.catOptionTextSelected]}>
                  Académica
                </Text>
              </Pressable>
              <Pressable
                style={[styles.catOption, category === 'Disciplinaria' && styles.catOptionSelected]}
                onPress={() => setCategory('Disciplinaria')}
              >
                <Text style={[styles.catOptionText, category === 'Disciplinaria' && styles.catOptionTextSelected]}>
                  Disciplinaria
                </Text>
              </Pressable>
            </View>

            <Text style={styles.label}>Observación</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Escriba los detalles de la novedad..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.modalActions}>
              <Pressable style={styles.btnCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.btnSave} onPress={handleAddObservation}>
                <Text style={styles.btnSaveText}>Guardar Observación</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
  },
  btnNueva: {
    backgroundColor: GOLD,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnNuevaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cardsList: {
    gap: 16,
  },
  obsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nameCategoryGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  catGoldBg: {
    backgroundColor: '#FEF3C7',
  },
  catRedBg: {
    backgroundColor: '#FEE2E2',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  catRedText: {
    color: '#991B1B',
  },
  catGoldText: {
    color: '#78350F',
  },
  dateText: {
    fontSize: 13,
    color: '#64748B',
  },
  descriptionText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 480,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: NAVY,
  },
  label: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 6,
    marginTop: 12,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
    gap: 10,
  },
  catOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  catOptionSelected: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
  catOptionText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  catOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  btnCancel: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  btnCancelText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '500',
  },
  btnSave: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: GOLD,
  },
  btnSaveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
