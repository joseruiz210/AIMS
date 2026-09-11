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
  const [observations, setObservations] = useState<ObservacionItem[]>([]);
  const [apprentices, setApprentices] = useState<Apprentice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
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

  const loadData = async () => {
    setLoading(true);
    try {
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addObservation = async () => {
    if (!selectedApprentice || description.trim().length < 5) {
      showToast('Selecciona un aprendiz y escribe al menos 5 caracteres');
      return;
    }
    setSaving(true);
    try {
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
    } finally {
      setSaving(false);
    }
  };

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
});
