import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  ActivityIndicator,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fichasService, Ficha } from '../../services/fichasService';
import { horariosService, HorarioItem } from '../../services/horariosService';

const NAVY = '#0F1026';
const GOLD = '#D4AF37';
const GREEN = '#10B981';
const RED = '#EF4444';
const BORDER = '#E2E8F0';

const DIAS = [
  { id: 1, label: 'Lunes', short: 'Lun' },
  { id: 2, label: 'Martes', short: 'Mar' },
  { id: 3, label: 'Miércoles', short: 'Mié' },
  { id: 4, label: 'Jueves', short: 'Jue' },
  { id: 5, label: 'Viernes', short: 'Vie' },
  { id: 6, label: 'Sábado', short: 'Sáb' },
];

export default function AdminHorariosScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [selectedFicha, setSelectedFicha] = useState<Ficha | null>(null);
  const [horarios, setHorarios] = useState<HorarioItem[]>([]);
  const [loadingFichas, setLoadingFichas] = useState(true);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [searchFicha, setSearchFicha] = useState('');
  const [selectedDia, setSelectedDia] = useState<number>(1);

  // Modal State (Create / Edit)
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHorario, setEditingHorario] = useState<HorarioItem | null>(null);
  const [formDia, setFormDia] = useState<number>(1);
  const [formHoraInicio, setFormHoraInicio] = useState('07:00');
  const [formHoraFin, setFormHoraFin] = useState('12:00');
  const [formTema, setFormTema] = useState('');
  const [formAmbiente, setFormAmbiente] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Delete Confirmation Modal
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadFichas();
  }, []);

  useEffect(() => {
    if (selectedFicha) {
      loadHorarios(selectedFicha.id);
    } else {
      setHorarios([]);
    }
  }, [selectedFicha]);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const loadFichas = async () => {
    setLoadingFichas(true);
    try {
      const list = await fichasService.getFichas();
      setFichas(list);
      if (list.length > 0 && !selectedFicha) {
        setSelectedFicha(list[0]);
      }
    } catch {
      setFichas([]);
    } finally {
      setLoadingFichas(false);
    }
  };

  const loadHorarios = async (fichaId: string) => {
    setLoadingHorarios(true);
    try {
      const data = await horariosService.getHorariosByFicha(fichaId);
      setHorarios(data);
    } catch {
      setHorarios([]);
    } finally {
      setLoadingHorarios(false);
    }
  };

  const filteredFichas = fichas.filter(f =>
    f.numero.toLowerCase().includes(searchFicha.toLowerCase()) ||
    (f.programaNombre && f.programaNombre.toLowerCase().includes(searchFicha.toLowerCase()))
  );

  const horariosForSelectedDia = horarios.filter(h => {
    const d = String(h.diaSemana);
    return d === String(selectedDia) || d.toLowerCase().startsWith(DIAS.find(x => x.id === selectedDia)?.label.toLowerCase().slice(0, 3) || 'xxx');
  });

  const openCreateModal = () => {
    setEditingHorario(null);
    setFormDia(selectedDia);
    setFormHoraInicio('07:00');
    setFormHoraFin('12:00');
    setFormTema('');
    setFormAmbiente('');
    setErrorMessage(null);
    setModalVisible(true);
  };

  const openEditModal = (h: HorarioItem) => {
    setEditingHorario(h);
    const parsedDia = Number(h.diaSemana) || DIAS.find(d => h.diaSemana.toLowerCase().includes(d.label.toLowerCase()))?.id || 1;
    setFormDia(parsedDia);
    setFormHoraInicio(h.horaInicio);
    setFormHoraFin(h.horaFin);
    const parts = (h.aula || '').split('•');
    setFormTema(parts[0]?.trim() || '');
    setFormAmbiente(parts[1]?.trim() || (parts.length === 1 ? parts[0]?.trim() : ''));
    setErrorMessage(null);
    setModalVisible(true);
  };

  const handleSaveHorario = async () => {
    if (!selectedFicha) {
      setErrorMessage('Seleccione una ficha primero');
      return;
    }
    if (!formHoraInicio.trim() || !formHoraFin.trim()) {
      setErrorMessage('La hora de inicio y fin son obligatorias');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      const aulaFinal = formTema.trim() && formAmbiente.trim()
        ? `${formTema.trim()} • ${formAmbiente.trim()}`
        : formAmbiente.trim() || formTema.trim() || undefined;

      if (editingHorario) {
        await horariosService.updateHorario(editingHorario.id, {
          diaSemana: formDia,
          horaInicio: formHoraInicio.trim(),
          horaFin: formHoraFin.trim(),
          aula: aulaFinal,
        });
        showToast('Franja horaria actualizada correctamente');
      } else {
        await horariosService.createHorario({
          fichaId: selectedFicha.id,
          diaSemana: formDia,
          horaInicio: formHoraInicio.trim(),
          horaFin: formHoraFin.trim(),
          ambiente: formAmbiente.trim(),
          tema: formTema.trim(),
          aula: aulaFinal,
        });
        showToast('Franja horaria creada exitosamente');
      }

      setModalVisible(false);
      await loadHorarios(selectedFicha.id);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar la franja horaria');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (!deletingId || !selectedFicha) return;
    setDeleting(true);
    try {
      await horariosService.deleteHorario(deletingId);
      showToast('Franja horaria eliminada');
      setDeleteModalVisible(false);
      await loadHorarios(selectedFicha.id);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo eliminar el horario');
    } finally {
      setDeleting(false);
      setDeletingId(null);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Toast */}
      {successToast && (
        <View style={styles.toastBanner}>
          <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.toastText}>{successToast}</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Gestión de Horarios</Text>
          <Text style={styles.subtitle}>
            Administración estructurada de bloques horarios por cada ficha de formación
          </Text>
        </View>
        <Pressable
          style={[styles.btnAdd, !selectedFicha && { opacity: 0.6 }]}
          disabled={!selectedFicha}
          onPress={openCreateModal}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.btnAddText}>Nueva Franja</Text>
        </Pressable>
      </View>

      {/* Ficha Selection Section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="folder-open-outline" size={18} color={GOLD} style={{ marginRight: 8 }} />
          <Text style={styles.cardTitle}>Seleccionar Ficha de Formación</Text>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar ficha por número o programa..."
            placeholderTextColor="#94A3B8"
            value={searchFicha}
            onChangeText={setSearchFicha}
          />
        </View>

        {loadingFichas ? (
          <ActivityIndicator size="small" color={GOLD} style={{ marginVertical: 12 }} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fichaScroll}>
            {filteredFichas.map(f => {
              const isSelected = selectedFicha?.id === f.id;
              return (
                <Pressable
                  key={f.id}
                  style={[styles.fichaChip, isSelected && styles.fichaChipSelected]}
                  onPress={() => setSelectedFicha(f)}
                >
                  <Text style={[styles.fichaChipNum, isSelected && styles.fichaChipNumSelected]}>
                    Ficha {f.numero}
                  </Text>
                  <Text
                    style={[styles.fichaChipSub, isSelected && styles.fichaChipSubSelected]}
                    numberOfLines={1}
                  >
                    {f.programaNombre || 'Sin programa'}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {selectedFicha && (
          <View style={styles.fichaInfoBanner}>
            <View style={styles.fichaInfoCol}>
              <Text style={styles.infoLabel}>Ficha Seleccionada</Text>
              <Text style={styles.infoValue}>{selectedFicha.numero}</Text>
            </View>
            <View style={styles.fichaInfoCol}>
              <Text style={styles.infoLabel}>Programa</Text>
              <Text style={styles.infoValue} numberOfLines={1}>{selectedFicha.programaNombre || 'N/A'}</Text>
            </View>
            <View style={styles.fichaInfoCol}>
              <Text style={styles.infoLabel}>Jornada</Text>
              <Text style={styles.infoValue}>{selectedFicha.jornada || 'Mañana'}</Text>
            </View>
            <View style={styles.fichaInfoCol}>
              <Text style={styles.infoLabel}>Bloques Registrados</Text>
              <Text style={[styles.infoValue, { color: GOLD }]}>{horarios.length}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Days Tabs */}
      <View style={styles.daysTabContainer}>
        {DIAS.map(d => {
          const isActive = selectedDia === d.id;
          const count = horarios.filter(h => String(h.diaSemana) === String(d.id)).length;
          return (
            <Pressable
              key={d.id}
              style={[styles.dayTab, isActive && styles.dayTabActive]}
              onPress={() => setSelectedDia(d.id)}
            >
              <Text style={[styles.dayTabText, isActive && styles.dayTabTextActive]}>
                {isMobile ? d.short : d.label}
              </Text>
              {count > 0 && (
                <View style={[styles.dayBadge, isActive && styles.dayBadgeActive]}>
                  <Text style={[styles.dayBadgeText, isActive && styles.dayBadgeTextActive]}>
                    {count}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Schedule Grid / List */}
      <View style={styles.scheduleSection}>
        {loadingHorarios ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={GOLD} />
            <Text style={styles.loadingText}>Cargando horarios de la ficha...</Text>
          </View>
        ) : !selectedFicha ? (
          <View style={styles.emptyBox}>
            <Ionicons name="folder-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Seleccione una Ficha</Text>
            <Text style={styles.emptySub}>
              Elija una ficha de formación arriba para ver o configurar su horario.
            </Text>
          </View>
        ) : horariosForSelectedDia.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="calendar-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Sin sesiones para el {DIAS.find(d => d.id === selectedDia)?.label}</Text>
            <Text style={styles.emptySub}>
              No hay franjas horarias configuradas para este día en la ficha {selectedFicha.numero}.
            </Text>
            <Pressable style={styles.btnCreateEmpty} onPress={openCreateModal}>
              <Ionicons name="add" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.btnCreateEmptyText}>Agregar Franja Horaria</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.cardsGrid}>
            {horariosForSelectedDia.map(h => {
              const parts = (h.aula || '').split('•');
              const temaText = parts[0]?.trim() || 'Sesión Formativa';
              const ambienteText = parts[1]?.trim() || (parts.length === 1 ? parts[0]?.trim() : 'Ambiente por definir');

              return (
                <View key={h.id} style={styles.scheduleCard}>
                  <View style={styles.timeBadgeRow}>
                    <View style={styles.timeBadge}>
                      <Ionicons name="time-outline" size={15} color={NAVY} style={{ marginRight: 6 }} />
                      <Text style={styles.timeBadgeText}>
                        {h.horaInicio} - {h.horaFin}
                      </Text>
                    </View>
                    <View style={styles.cardActions}>
                      <Pressable
                        style={styles.actionBtnEdit}
                        onPress={() => openEditModal(h)}
                      >
                        <Ionicons name="pencil-outline" size={16} color={NAVY} />
                      </Pressable>
                      <Pressable
                        style={styles.actionBtnDelete}
                        onPress={() => confirmDelete(h.id)}
                      >
                        <Ionicons name="trash-outline" size={16} color={RED} />
                      </Pressable>
                    </View>
                  </View>

                  <Text style={styles.slotTema} numberOfLines={2}>
                    {temaText}
                  </Text>

                  <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={14} color="#64748B" style={{ marginRight: 4 }} />
                    <Text style={styles.metaText} numberOfLines={1}>
                      {ambienteText}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Modal: Crear / Editar Horario */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingHorario ? 'Modificar Franja Horaria' : 'Crear Nueva Franja Horaria'}
              </Text>
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </Pressable>
            </View>

            {errorMessage && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color={RED} style={{ marginRight: 6 }} />
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            )}

            <View style={styles.modalBody}>
              {/* Día de la semana */}
              <Text style={styles.inputLabel}>Día de la Semana</Text>
              <View style={styles.diaSelectorRow}>
                {DIAS.map(d => (
                  <Pressable
                    key={d.id}
                    style={[styles.diaSelectorChip, formDia === d.id && styles.diaSelectorChipActive]}
                    onPress={() => setFormDia(d.id)}
                  >
                    <Text style={[styles.diaSelectorChipText, formDia === d.id && styles.diaSelectorChipTextActive]}>
                      {d.short}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Hora Inicio y Fin */}
              <View style={styles.rowInputs}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Hora Inicio (HH:mm)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="07:00"
                    placeholderTextColor="#94A3B8"
                    value={formHoraInicio}
                    onChangeText={setFormHoraInicio}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Hora Fin (HH:mm)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="12:00"
                    placeholderTextColor="#94A3B8"
                    value={formHoraFin}
                    onChangeText={setFormHoraFin}
                  />
                </View>
              </View>

              {/* Tema / Competencia */}
              <Text style={styles.inputLabel}>Asignatura / Competencia</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej. Programación con JavaScript"
                placeholderTextColor="#94A3B8"
                value={formTema}
                onChangeText={setFormTema}
              />

              {/* Ambiente / Aula */}
              <Text style={styles.inputLabel}>Ambiente / Aula</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej. Ambiente 302 - Bloque A"
                placeholderTextColor="#94A3B8"
                value={formAmbiente}
                onChangeText={setFormAmbiente}
              />
            </View>

            <View style={styles.modalFooter}>
              <Pressable
                style={styles.btnCancel}
                onPress={() => setModalVisible(false)}
                disabled={submitting}
              >
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.btnSave, submitting && { opacity: 0.7 }]}
                onPress={handleSaveHorario}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.btnSaveText}>
                    {editingHorario ? 'Guardar Cambios' : 'Crear Franja'}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Confirmar Eliminación */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxWidth: 400 }]}>
            <View style={styles.deleteIconWrap}>
              <Ionicons name="trash-outline" size={32} color={RED} />
            </View>
            <Text style={styles.deleteTitle}>¿Eliminar franja horaria?</Text>
            <Text style={styles.deleteText}>
              Esta acción eliminará el bloque horario seleccionado de la base de datos de manera definitiva.
            </Text>

            <View style={styles.modalFooter}>
              <Pressable
                style={styles.btnCancel}
                onPress={() => setDeleteModalVisible(false)}
                disabled={deleting}
              >
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.btnDeleteConfirm, deleting && { opacity: 0.7 }]}
                onPress={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.btnDeleteConfirmText}>Eliminar</Text>
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
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 24,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  toastText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: NAVY,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  btnAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NAVY,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  btnAddText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: NAVY,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: NAVY,
  },
  fichaScroll: {
    flexGrow: 0,
    marginBottom: 14,
  },
  fichaChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginRight: 10,
    minWidth: 120,
  },
  fichaChipSelected: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  fichaChipNum: {
    fontSize: 14,
    fontWeight: '700',
    color: NAVY,
  },
  fichaChipNumSelected: {
    color: '#FFFFFF',
  },
  fichaChipSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  fichaChipSubSelected: {
    color: '#CBD5E1',
  },
  fichaInfoBanner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  fichaInfoCol: {
    minWidth: 120,
  },
  infoLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: NAVY,
    marginTop: 2,
  },
  daysTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 20,
    overflow: 'hidden',
  },
  dayTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  dayTabActive: {
    backgroundColor: NAVY,
  },
  dayTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  dayTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dayBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  dayBadgeActive: {
    backgroundColor: GOLD,
  },
  dayBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: NAVY,
  },
  dayBadgeTextActive: {
    color: '#FFFFFF',
  },
  scheduleSection: {
    minHeight: 200,
  },
  centerBox: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 12,
  },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: NAVY,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 380,
  },
  btnCreateEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NAVY,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  btnCreateEmptyText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    flex: 1,
    minWidth: 260,
    maxWidth: 360,
  },
  timeBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  timeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: NAVY,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnEdit: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  actionBtnDelete: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
  },
  slotTema: {
    fontSize: 15,
    fontWeight: '700',
    color: NAVY,
    marginBottom: 8,
    minHeight: 38,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 480,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: NAVY,
  },
  closeBtn: {
    padding: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  errorBannerText: {
    color: RED,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  modalBody: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: NAVY,
    marginBottom: 4,
  },
  diaSelectorRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  diaSelectorChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  diaSelectorChipActive: {
    backgroundColor: NAVY,
  },
  diaSelectorChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  diaSelectorChipTextActive: {
    color: '#FFFFFF',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: NAVY,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  btnCancel: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  btnCancelText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 14,
  },
  btnSave: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: NAVY,
  },
  btnSaveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  deleteIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
  deleteTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: NAVY,
    textAlign: 'center',
    marginBottom: 8,
  },
  deleteText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  btnDeleteConfirm: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: RED,
  },
  btnDeleteConfirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
