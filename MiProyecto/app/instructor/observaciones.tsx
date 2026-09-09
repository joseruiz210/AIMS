import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  observacionesService,
  ObservacionItem,
} from '../../services/observacionesService';
import { fichasService, AprendizMatriculado } from '../../services/fichasService';

const GOLD = '#D4AF37';
const NAVY = '#0F1026';
const BG_PAGE = '#F8FAFC';
const RED = '#E74C3C';
const GREEN = '#2ECC71';

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
  const [observations, setObservations] = useState<ObservacionItem[]>([]);
  const [apprentices, setApprentices] = useState<AprendizMatriculado[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<string>('TODAS');

  // Form state
  const [studentName, setStudentName] = useState('');
  const [category, setCategory] = useState<'Académica' | 'Disciplinaria'>('Académica');
  const [selectedAprendizId, setSelectedAprendizId] = useState('');
  const [category, setCategory] = useState<'Academica' | 'Disciplinaria' | 'Felicitacion'>('Academica');
  const [materia, setMateria] = useState('');
  const [description, setDescription] = useState('');

  const handleAddObservation = () => {
    if (!studentName.trim() || !description.trim()) return;
  useEffect(() => {
    loadData();
  }, []);

    const newObs: Observation = {
      id: Date.now().toString(),
      studentName: studentName.trim(),
      category,
      date: 'Hoy',
      description: description.trim(),
    };
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

    setObservations([newObs, ...observations]);
    setStudentName('');
    setDescription('');
    setCategory('Académica');
    setModalVisible(false);
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Cargar observaciones de la BD
      const obsList = await observacionesService.getMisObservaciones();
      setObservations(obsList);

      // 2. Cargar aprendices de la ficha activa
      const fichas = await fichasService.getFichas();
      if (fichas.length > 0) {
        const detail = await fichasService.getFichaById(fichas[0].id);
        if (detail && detail.matriculas) {
          const list: AprendizMatriculado[] = detail.matriculas.map((m: any) => ({
            id: m.aprendiz.id,
            firstName: m.aprendiz.firstName,
            lastName: m.aprendiz.lastName,
            email: m.aprendiz.email,
            phone: m.aprendiz.phone,
            estadoAcademico: m.aprendiz.estadoAcademico,
          }));
          setApprentices(list);
          if (list.length > 0 && !selectedAprendizId) {
            setSelectedAprendizId(list[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Error cargando observaciones:', err);
      showToast('Error al conectar con la base de datos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddObservation = async () => {
    if (!selectedAprendizId) {
      showToast('⚠️ Seleccione un aprendiz');
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      showToast('⚠️ Ingrese una descripción de al menos 5 caracteres');
      return;
    }

    setSaving(true);
    try {
      await observacionesService.crearObservacion({
        aprendizId: selectedAprendizId,
        tipo: category,
        materia: materia.trim() || undefined,
        descripcion: description.trim(),
      });

      // Recargar lista actualizada desde PostgreSQL
      const updated = await observacionesService.getMisObservaciones();
      setObservations(updated);

      setDescription('');
      setMateria('');
      setCategory('Academica');
      setModalVisible(false);
      showToast('✅ Observación guardada en PostgreSQL');
    } catch (err: any) {
      console.error('Error creando observación:', err);
      showToast('⚠️ ' + (err.message || 'Error al guardar'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteObservation = async (id: string) => {
    try {
      await observacionesService.eliminarObservacion(id);
      setObservations(prev => prev.filter(o => o.id !== id));
      showToast('🗑️ Observación eliminada');
    } catch (err: any) {
      console.error('Error eliminando observación:', err);
      showToast('⚠️ Error al eliminar');
    }
  };

  const filteredObservations = observations.filter(obs => {
    if (filterCat === 'TODAS') return true;
    const catUpper = (obs.tipo || '').toUpperCase();
    if (filterCat === 'ACADEMICA') return catUpper.includes('ACADEM');
    if (filterCat === 'DISCIPLINARIA') return catUpper.includes('DISCIP');
    if (filterCat === 'FELICITACION') return catUpper.includes('FELIC') || catUpper.includes('RECONOC');
    return true;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GOLD} />
        <Text style={styles.loadingText}>Cargando observaciones desde PostgreSQL...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Toast Notification */}
      {toastMessage && (
        <View style={styles.toastBanner}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Top Header Row with Title and + Nueva button */}
      <View style={styles.headerRow}>
        <Text style={styles.pageTitle}>Observaciones</Text>
        <View>
          <Text style={styles.pageTitle}>Registro de Observaciones</Text>
          <Text style={styles.pageSubtitle}>Anotaciones formativas y disciplinarias</Text>
        </View>

        <Pressable style={styles.btnNueva} onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.btnNuevaText}>+ Nueva</Text>
          <Text style={styles.btnNuevaText}>+ Nueva Observación</Text>
        </Pressable>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {[
          { key: 'TODAS', label: 'Todas' },
          { key: 'ACADEMICA', label: 'Académicas' },
          { key: 'DISCIPLINARIA', label: 'Disciplinarias' },
          { key: 'FELICITACION', label: 'Reconocimientos' },
        ].map(tab => (
          <Pressable
            key={tab.key}
            style={[styles.filterChip, filterCat === tab.key && styles.filterChipActive]}
            onPress={() => setFilterCat(tab.key)}
          >
            <Text style={[styles.filterChipText, filterCat === tab.key && styles.filterChipTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
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
      {filteredObservations.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="chatbubble-ellipses-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No hay observaciones registradas</Text>
          <Text style={styles.emptySub}>
            Las observaciones agregadas para los aprendices quedarán guardadas permanentemente en PostgreSQL.
          </Text>
        </View>
      ) : (
        <View style={styles.cardsList}>
          {filteredObservations.map(obs => {
            const isDisciplinaria = (obs.tipo || '').toUpperCase().includes('DISCIP');
            const isFelicitacion = (obs.tipo || '').toUpperCase().includes('FELIC') || (obs.tipo || '').toUpperCase().includes('RECONOC');

            return (
              <View key={obs.id} style={styles.obsCard}>
                <View style={styles.cardTopRow}>
                  <View style={styles.nameCategoryGroup}>
                    <View style={styles.miniAvatar}>
                      <Text style={styles.miniAvatarText}>
                        {(obs.aprendizNombre || 'A')
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.studentName}>{obs.aprendizNombre}</Text>
                      {obs.materia ? <Text style={styles.materiaText}>{obs.materia}</Text> : null}
                    </View>
                    
                    <View
                      style={[
                        styles.categoryPill,
                        isDisciplinaria
                          ? styles.catRedBg
                          : isFelicitacion
                          ? styles.catGreenBg
                          : styles.catGoldBg,
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          isDisciplinaria
                            ? styles.catRedText
                            : isFelicitacion
                            ? styles.catGreenText
                            : styles.catGoldText,
                        ]}
                      >
                        {isDisciplinaria ? 'Disciplinaria' : isFelicitacion ? 'Felicitación' : 'Académica'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardActionGroup}>
                    <Text style={styles.dateText}>{obs.fecha}</Text>
                    <Pressable
                      style={styles.btnDelete}
                      onPress={() => handleDeleteObservation(obs.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>

                <Text style={styles.descriptionText}>{obs.descripcion}</Text>
              </View>
            );
          })}
        </View>
      )}

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
            {/* Apprentice selector from real enrolled learners */}
            <Text style={styles.label}>Seleccionar Aprendiz (Ficha ADSO)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.learnerScroll}>
              {apprentices.map(app => {
                const isSelected = selectedAprendizId === app.id;
                return (
                  <Pressable
                    key={app.id}
                    style={[styles.learnerChip, isSelected && styles.learnerChipActive]}
                    onPress={() => setSelectedAprendizId(app.id)}
                  >
                    <Text style={[styles.learnerChipText, isSelected && styles.learnerChipTextActive]}>
                      {app.firstName} {app.lastName || ''}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.label}>Categoría</Text>
            <Text style={styles.label}>Tipo de Observación</Text>
            <View style={styles.categorySelector}>
              <Pressable
                style={[styles.catOption, category === 'Académica' && styles.catOptionSelected]}
                onPress={() => setCategory('Académica')}
                style={[styles.catOption, category === 'Academica' && styles.catOptionSelected]}
                onPress={() => setCategory('Academica')}
              >
                <Text style={[styles.catOptionText, category === 'Académica' && styles.catOptionTextSelected]}>
                <Text style={[styles.catOptionText, category === 'Academica' && styles.catOptionTextSelected]}>
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

              <Pressable
                style={[styles.catOption, category === 'Felicitacion' && styles.catOptionSelected]}
                onPress={() => setCategory('Felicitacion')}
              >
                <Text style={[styles.catOptionText, category === 'Felicitacion' && styles.catOptionTextSelected]}>
                  Felicitación
                </Text>
              </Pressable>
            </View>

            <Text style={styles.label}>Observación</Text>
            <Text style={styles.label}>Competencia / Materia (Opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Bases de Datos, Requisitos, etc."
              placeholderTextColor="#94A3B8"
              value={materia}
              onChangeText={setMateria}
            />

            <Text style={styles.label}>Detalle de la Observación</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Escriba los detalles de la novedad..."
              placeholder="Escribe la observación formativa..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.modalActions}>
              <Pressable style={styles.btnCancel} onPress={() => setModalVisible(false)}>
              <Pressable
                style={styles.btnCancel}
                onPress={() => setModalVisible(false)}
                disabled={saving}
              >
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.btnSave} onPress={handleAddObservation}>
                <Text style={styles.btnSaveText}>Guardar Observación</Text>

              <Pressable
                style={[styles.btnSave, saving && { opacity: 0.7 }]}
                onPress={handleAddObservation}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.btnSaveText}>Guardar en BD</Text>
                )}
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
  loadingContainer: {
    flex: 1,
    backgroundColor: BG_PAGE,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  toastBanner: {
    backgroundColor: '#0F2027',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 16,
    alignSelf: 'center',
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  btnNueva: {
    backgroundColor: GOLD,
    backgroundColor: '#0F2027',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  btnNuevaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: GOLD,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
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
    flex: 1,
  },
  miniAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: NAVY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  studentName: {
    fontSize: 16,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  materiaText: {
    fontSize: 12,
    color: '#64748B',
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  catGoldBg: {
    backgroundColor: '#FEF3C7',
  },
  catRedBg: {
    backgroundColor: '#FEE2E2',
  },
  catGreenBg: {
    backgroundColor: '#DCFCE7',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    fontSize: 11,
    fontWeight: '700',
  },
  catRedText: {
    color: '#991B1B',
  },
  catGoldText: {
    color: '#78350F',
  },
  catGreenText: {
    color: '#166534',
  },
  cardActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateText: {
    fontSize: 13,
    fontSize: 12,
    color: '#64748B',
  },
  btnDelete: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
  },
  descriptionText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    lineHeight: 21,
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
    maxWidth: 520,
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
    marginBottom: 16,
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
  learnerScroll: {
    flexGrow: 0,
    marginBottom: 4,
  },
  learnerChip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  learnerChipActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  learnerChipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  learnerChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
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
    gap: 8,
  },
  catOption: {
    flex: 1,
    paddingVertical: 10,
    paddingVertical: 9,
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
    fontSize: 12,
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
    marginTop: 22,
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
    fontWeight: '600',
  },
  btnSave: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: GOLD,
    backgroundColor: '#0F2027',
    minWidth: 120,
    alignItems: 'center',
  },
  btnSaveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
