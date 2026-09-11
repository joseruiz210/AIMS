<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fichasService, AprendizMatriculado } from '../../services/fichasService';
import { ObservacionItem, observacionesService } from '../../services/observacionesService';

const TYPES: Array<{ label: string; value: ObservacionItem['tipo'] }> = [
  { label: 'Académica', value: 'ACADEMICA' },
  { label: 'Disciplinaria', value: 'DISCIPLINARIA' },
  { label: 'Reconocimiento', value: 'RECONOCIMIENTO' },
  { label: 'Otra', value: 'OTRO' },
];

export default function ObservacionesScreenPremium() {
=======
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { fichasService } from '../../services/fichasService';
import { observacionesService, ObservacionItem } from '../../services/observacionesService';

const GOLD = '#D4AF37';
const NAVY = '#0F1026';
const BG_PAGE = '#F8FAFC';

type Filter = 'TODAS' | 'ACADEMICA' | 'DISCIPLINARIA' | 'RECONOCIMIENTO';
type ObservationType = 'ACADEMICA' | 'DISCIPLINARIA' | 'RECONOCIMIENTO';
type Apprentice = { id: string; firstName: string; lastName?: string };

export default function ObservacionesScreen() {
>>>>>>> 73ee7842ad18e133f6032a127c51fc3148683cdd
  const [observations, setObservations] = useState<ObservacionItem[]>([]);
  const [apprentices, setApprentices] = useState<Apprentice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
<<<<<<< HEAD
  const [selectedAprendizId, setSelectedAprendizId] = useState('');
  const [tipo, setTipo] = useState<ObservacionItem['tipo']>('ACADEMICA');
  const [materia, setMateria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { void loadData(); }, []);
=======
  const [toast, setToast] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('TODAS');
  const [selectedApprentice, setSelectedApprentice] = useState('');
  const [type, setType] = useState<ObservationType>('ACADEMICA');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };
>>>>>>> 73ee7842ad18e133f6032a127c51fc3148683cdd

  const loadData = async () => {
    setLoading(true);
    try {
<<<<<<< HEAD
      const [items, fichas] = await Promise.all([observacionesService.getMisObservaciones(), fichasService.getFichas()]);
      setObservations(items);
      const ficha = fichas[0];
      if (ficha) setApprentices(ficha.aprendices || []);
    } catch (error) {
      console.error('Error cargando observaciones:', error);
      setToast('No se pudieron cargar las observaciones');
=======
      const [items, fichas] = await Promise.all([
        observacionesService.getMisObservaciones(),
        fichasService.getFichas(),
      ]);
      setObservations(items);
      if (fichas.length > 0) {
        const detail = await fichasService.getFichaById(fichas[0].id);
        const list = (detail?.matriculas || []).map((item: any) => ({
          id: item.aprendiz.id,
          firstName: item.aprendiz.firstName,
          lastName: item.aprendiz.lastName,
        }));
        setApprentices(list);
        if (!selectedApprentice && list.length > 0) setSelectedApprentice(list[0].id);
      }
    } catch (error) {
      console.error('Error cargando observaciones:', error);
      showToast('No se pudieron cargar las observaciones');
>>>>>>> 73ee7842ad18e133f6032a127c51fc3148683cdd
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const createObservation = async () => {
    if (!selectedAprendizId || !descripcion.trim()) {
      setToast('Selecciona un aprendiz y escribe una descripción');
=======
  useEffect(() => {
    loadData();
  }, []);

  const addObservation = async () => {
    if (!selectedApprentice || description.trim().length < 5) {
      showToast('Selecciona un aprendiz y escribe al menos 5 caracteres');
>>>>>>> 73ee7842ad18e133f6032a127c51fc3148683cdd
      return;
    }
    setSaving(true);
    try {
<<<<<<< HEAD
      const created = await observacionesService.crearObservacion({ aprendizId: selectedAprendizId, tipo, materia: materia.trim() || undefined, descripcion: descripcion.trim() });
      setObservations(previous => [created, ...previous]);
      setModalVisible(false);
      setSelectedAprendizId('');
      setMateria('');
      setDescripcion('');
      setToast('Observación guardada');
    } catch (error: any) {
      setToast(error?.message || 'No se pudo guardar la observación');
=======
      await observacionesService.crearObservacion({
        aprendizId: selectedApprentice,
        tipo: type,
        materia: subject.trim() || undefined,
        descripcion: description.trim(),
      });
      setModalVisible(false);
      setSubject('');
      setDescription('');
      await loadData();
      showToast('Observacion guardada');
    } catch (error: any) {
      showToast(error.message || 'Error al guardar');
>>>>>>> 73ee7842ad18e133f6032a127c51fc3148683cdd
    } finally {
      setSaving(false);
    }
  };

<<<<<<< HEAD
  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color="#D4AF37" /><Text>Cargando observaciones...</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}><View><Text style={styles.title}>Observaciones</Text><Text style={styles.subtitle}>Seguimiento académico y formativo</Text></View><Pressable style={styles.addButton} onPress={() => setModalVisible(true)}><Ionicons name="add" size={18} color="#FFFFFF" /><Text style={styles.addText}>Nueva</Text></Pressable></View>
      {toast && <Text style={styles.toast}>{toast}</Text>}
      {observations.length === 0 ? <View style={styles.empty}><Ionicons name="document-text-outline" size={44} color="#94A3B8" /><Text style={styles.emptyTitle}>Sin observaciones</Text></View> : observations.map(item => (
        <View key={item.id} style={styles.card}><View style={styles.cardTop}><Text style={styles.student}>{item.aprendizNombre || 'Aprendiz'}</Text><Text style={styles.date}>{item.fecha}</Text></View><Text style={styles.type}>{item.tipo}</Text>{item.materia && <Text style={styles.subject}>{item.materia}</Text>}<Text style={styles.description}>{item.descripcion}</Text></View>
      ))}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}><View style={styles.backdrop}><View style={styles.modal}><View style={styles.modalHeader}><Text style={styles.modalTitle}>Nueva observación</Text><Pressable onPress={() => setModalVisible(false)}><Ionicons name="close" size={22} color="#64748B" /></Pressable></View><Text style={styles.label}>Aprendiz</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selector}>{apprentices.map(apprentice => <Pressable key={apprentice.id} style={[styles.chip, selectedAprendizId === apprentice.id && styles.chipActive]} onPress={() => setSelectedAprendizId(apprentice.id)}><Text>{apprentice.nombre || apprentice.firstName || 'Aprendiz'}</Text></Pressable>)}</ScrollView><Text style={styles.label}>Tipo</Text><View style={styles.selector}>{TYPES.map(option => <Pressable key={option.value} style={[styles.chip, tipo === option.value && styles.chipActive]} onPress={() => setTipo(option.value)}><Text>{option.label}</Text></Pressable>)}</View><TextInput style={styles.input} placeholder="Materia (opcional)" value={materia} onChangeText={setMateria} /><TextInput style={[styles.input, styles.multiline]} placeholder="Descripción" value={descripcion} onChangeText={setDescripcion} multiline /><View style={styles.actions}><Pressable style={styles.cancel} onPress={() => setModalVisible(false)} disabled={saving}><Text>Cancelar</Text></Pressable><Pressable style={styles.save} onPress={createObservation} disabled={saving}>{saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.saveText}>Guardar</Text>}</Pressable></View></View></View></Modal>
=======
  const deleteObservation = async (id: string) => {
    try {
      await observacionesService.eliminarObservacion(id);
      setObservations((items) => items.filter((item) => item.id !== id));
      showToast('Observacion eliminada');
    } catch (error: any) {
      showToast(error.message || 'Error al eliminar');
    }
  };

  const filtered = observations.filter((item) => filter === 'TODAS' || item.tipo === filter);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GOLD} />
        <Text style={styles.mutedText}>Cargando observaciones...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Registro de observaciones</Text>
          <Text style={styles.subtitle}>Anotaciones formativas y disciplinarias</Text>
        </View>
        <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addText}>Nueva</Text>
        </Pressable>
      </View>

      {toast && <Text style={styles.toast}>{toast}</Text>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        {(['TODAS', 'ACADEMICA', 'DISCIPLINARIA', 'RECONOCIMIENTO'] as Filter[]).map((item) => (
          <Pressable key={item} style={[styles.filterButton, filter === item && styles.filterActive]} onPress={() => setFilter(item)}>
            <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {filtered.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="chatbubble-ellipses-outline" size={44} color="#94A3B8" />
          <Text style={styles.cardTitle}>No hay observaciones</Text>
          <Text style={styles.mutedText}>Las observaciones creadas apareceran aqui.</Text>
        </View>
      ) : filtered.map((item) => (
        <View key={item.id} style={styles.observationCard}>
          <View style={styles.cardHeader}>
            <View style={styles.flexOne}>
              <Text style={styles.cardTitle}>{item.aprendizNombre || 'Aprendiz'}</Text>
              <Text style={styles.mutedText}>{item.fecha} - {item.tipo}</Text>
            </View>
            <Pressable onPress={() => deleteObservation(item.id)}>
              <Ionicons name="trash-outline" size={20} color="#B91C1C" />
            </Pressable>
          </View>
          {item.materia && <Text style={styles.subject}>{item.materia}</Text>}
          <Text style={styles.description}>{item.descripcion}</Text>
        </View>
      ))}

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Nueva observacion</Text>
              <Pressable onPress={() => setModalVisible(false)}><Ionicons name="close" size={22} color="#64748B" /></Pressable>
            </View>
            <Text style={styles.label}>Aprendiz</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {apprentices.map((item) => (
                <Pressable key={item.id} style={[styles.apprenticeChip, selectedApprentice === item.id && styles.apprenticeChipActive]} onPress={() => setSelectedApprentice(item.id)}>
                  <Text style={selectedApprentice === item.id ? styles.chipTextActive : styles.chipText}>{item.firstName} {item.lastName || ''}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={styles.label}>Tipo</Text>
            <View style={styles.typeRow}>
              {(['ACADEMICA', 'DISCIPLINARIA', 'RECONOCIMIENTO'] as ObservationType[]).map((item) => (
                <Pressable key={item} style={[styles.typeButton, type === item && styles.typeActive]} onPress={() => setType(item)}>
                  <Text style={type === item ? styles.chipTextActive : styles.chipText}>{item}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput style={styles.input} placeholder="Materia (opcional)" value={subject} onChangeText={setSubject} />
            <TextInput style={[styles.input, styles.textArea]} placeholder="Detalle de la observacion" multiline value={description} onChangeText={setDescription} />
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setModalVisible(false)}><Text>Cancelar</Text></Pressable>
              <Pressable style={styles.saveButton} onPress={addObservation} disabled={saving}>
                {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveText}>Guardar</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
>>>>>>> 73ee7842ad18e133f6032a127c51fc3148683cdd
    </ScrollView>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: { flex: 1, backgroundColor: '#F8FAFC' }, content: { padding: 28, gap: 16, paddingBottom: 40 }, loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, title: { fontSize: 24, fontWeight: '700', color: '#0F172A' }, subtitle: { color: '#64748B', marginTop: 4 }, addButton: { flexDirection: 'row', gap: 5, alignItems: 'center', backgroundColor: '#0F2027', padding: 10, borderRadius: 8 }, addText: { color: '#FFFFFF', fontWeight: '700' }, toast: { color: '#92400E', backgroundColor: '#FEF3C7', padding: 10, borderRadius: 8 }, empty: { alignItems: 'center', padding: 32, backgroundColor: '#FFFFFF', borderRadius: 16, gap: 8 }, emptyTitle: { color: '#0F172A', fontWeight: '700' }, card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', gap: 6 }, cardTop: { flexDirection: 'row', justifyContent: 'space-between' }, student: { color: '#0F172A', fontWeight: '700' }, date: { color: '#94A3B8', fontSize: 12 }, type: { color: '#B45309', fontSize: 12, fontWeight: '700' }, subject: { color: '#64748B', fontSize: 12 }, description: { color: '#334155' }, backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 }, modal: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, maxHeight: '90%' }, modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }, modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' }, label: { color: '#334155', fontWeight: '600', marginTop: 8, marginBottom: 6 }, selector: { flexDirection: 'row', flexWrap: 'wrap' }, chip: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 8, marginRight: 6, marginBottom: 6 }, chipActive: { backgroundColor: '#FEF3C7' }, input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 10, marginTop: 10, color: '#0F172A' }, multiline: { minHeight: 90, textAlignVertical: 'top' }, actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 }, cancel: { padding: 10, backgroundColor: '#F1F5F9', borderRadius: 8 }, save: { padding: 10, minWidth: 90, alignItems: 'center', backgroundColor: '#0F2027', borderRadius: 8 }, saveText: { color: '#FFFFFF', fontWeight: '700' },
=======
  container: { flex: 1, backgroundColor: BG_PAGE },
  content: { padding: 28, paddingBottom: 48 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: BG_PAGE },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 },
  title: { color: NAVY, fontSize: 25, fontWeight: '700' },
  subtitle: { color: '#64748B', marginTop: 5 },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 5, padding: 11, borderRadius: 8, backgroundColor: NAVY },
  addText: { color: '#FFFFFF', fontWeight: '700' },
  toast: { color: '#FFFFFF', backgroundColor: NAVY, padding: 12, borderRadius: 8, marginBottom: 12 },
  filters: { marginBottom: 16 },
  filterButton: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 20, backgroundColor: '#E2E8F0', marginRight: 8 },
  filterActive: { backgroundColor: NAVY },
  filterText: { color: '#475569', fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: '#FFFFFF' },
  observationCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 18, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 8 },
  cardTitle: { color: NAVY, fontSize: 16, fontWeight: '700' },
  flexOne: { flex: 1 },
  mutedText: { color: '#64748B', fontSize: 14 },
  subject: { color: GOLD, fontWeight: '600', marginBottom: 6 },
  description: { color: '#334155', lineHeight: 21 },
  emptyCard: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 32, gap: 10 },
  modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'rgba(0,0,0,0.45)' },
  modalCard: { width: '100%', maxWidth: 520, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 22, gap: 12 },
  label: { color: NAVY, fontWeight: '600' },
  apprenticeChip: { paddingHorizontal: 12, paddingVertical: 9, backgroundColor: '#E2E8F0', borderRadius: 18, marginRight: 8 },
  apprenticeChipActive: { backgroundColor: NAVY },
  chipText: { color: '#475569', fontSize: 12 },
  chipTextActive: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeButton: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: '#E2E8F0' },
  typeActive: { backgroundColor: GOLD },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 12, color: NAVY },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  cancelButton: { padding: 12 },
  saveButton: { backgroundColor: NAVY, borderRadius: 8, paddingHorizontal: 18, paddingVertical: 12, minWidth: 90, alignItems: 'center' },
  saveText: { color: '#FFFFFF', fontWeight: '700' },
>>>>>>> 73ee7842ad18e133f6032a127c51fc3148683cdd
});
