import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { fichasService } from '../../services/fichasService';
import { ObservacionItem, observacionesService } from '../../services/observacionesService';

const TYPES: Array<{ label: string; value: ObservacionItem['tipo'] }> = [
  { label: 'Académica', value: 'ACADEMICA' },
  { label: 'Disciplinaria', value: 'DISCIPLINARIA' },
  { label: 'Reconocimiento', value: 'RECONOCIMIENTO' },
  { label: 'Otra', value: 'OTRO' },
];

type Apprentice = { id: string; firstName: string; lastName?: string };

export default function ObservacionesScreen() {
  const [observations, setObservations] = useState<ObservacionItem[]>([]);
  const [apprentices, setApprentices] = useState<Apprentice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAprendizId, setSelectedAprendizId] = useState('');
  const [tipo, setTipo] = useState<ObservacionItem['tipo']>('ACADEMICA');
  const [materia, setMateria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { void loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [items, fichas] = await Promise.all([
        observacionesService.getMisObservaciones(),
        fichasService.getFichas(),
      ]);
      setObservations(items);
      if (fichas[0]) {
        const detail = await fichasService.getFichaById(fichas[0].id);
        const list = (detail?.matriculas || []).map((item: any) => ({
          id: item.aprendiz.id,
          firstName: item.aprendiz.firstName,
          lastName: item.aprendiz.lastName,
        }));
        setApprentices(list);
      }
    } catch (error) {
      console.error('Error cargando observaciones:', error);
      setToast('No se pudieron cargar las observaciones');
    } finally {
      setLoading(false);
    }
  };

  const createObservation = async () => {
    if (!selectedAprendizId || !descripcion.trim()) {
      setToast('Selecciona un aprendiz y escribe una descripción');
      return;
    }
    setSaving(true);
    try {
      const created = await observacionesService.crearObservacion({
        aprendizId: selectedAprendizId,
        tipo,
        materia: materia.trim() || undefined,
        descripcion: descripcion.trim(),
      });
      setObservations(previous => [created, ...previous]);
      setModalVisible(false);
      setSelectedAprendizId('');
      setMateria('');
      setDescripcion('');
      setToast('Observación guardada');
    } catch (error: any) {
      setToast(error?.message || 'No se pudo guardar la observación');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color="#D4AF37" /><Text>Cargando observaciones...</Text></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View><Text style={styles.title}>Observaciones</Text><Text style={styles.subtitle}>Seguimiento académico y formativo</Text></View>
        <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}><Ionicons name="add" size={18} color="#FFFFFF" /><Text style={styles.addText}>Nueva</Text></Pressable>
      </View>
      {toast && <Text style={styles.toast}>{toast}</Text>}
      {observations.length === 0 ? <View style={styles.empty}><Ionicons name="document-text-outline" size={44} color="#94A3B8" /><Text style={styles.emptyTitle}>Sin observaciones</Text></View> : observations.map(item => (
        <View key={item.id} style={styles.card}><View style={styles.cardTop}><Text style={styles.student}>{item.aprendizNombre || 'Aprendiz'}</Text><Text style={styles.date}>{item.fecha}</Text></View><Text style={styles.type}>{item.tipo}</Text>{item.materia && <Text style={styles.subject}>{item.materia}</Text>}<Text style={styles.description}>{item.descripcion}</Text></View>
      ))}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.backdrop}><View style={styles.modal}>
          <View style={styles.modalHeader}><Text style={styles.modalTitle}>Nueva observación</Text><Pressable onPress={() => setModalVisible(false)}><Ionicons name="close" size={22} color="#64748B" /></Pressable></View>
          <Text style={styles.label}>Aprendiz</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selector}>{apprentices.map(apprentice => <Pressable key={apprentice.id} style={[styles.chip, selectedAprendizId === apprentice.id && styles.chipActive]} onPress={() => setSelectedAprendizId(apprentice.id)}><Text>{apprentice.firstName} {apprentice.lastName || ''}</Text></Pressable>)}</ScrollView>
          <Text style={styles.label}>Tipo</Text>
          <View style={styles.selector}>{TYPES.map(option => <Pressable key={option.value} style={[styles.chip, tipo === option.value && styles.chipActive]} onPress={() => setTipo(option.value)}><Text>{option.label}</Text></Pressable>)}</View>
          <TextInput style={styles.input} placeholder="Materia (opcional)" value={materia} onChangeText={setMateria} />
          <TextInput style={[styles.input, styles.multiline]} placeholder="Descripción" value={descripcion} onChangeText={setDescripcion} multiline />
          <View style={styles.actions}><Pressable style={styles.cancel} onPress={() => setModalVisible(false)} disabled={saving}><Text>Cancelar</Text></Pressable><Pressable style={styles.save} onPress={createObservation} disabled={saving}>{saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.saveText}>Guardar</Text>}</Pressable></View>
        </View></View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 28, gap: 16, paddingBottom: 40 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#0F172A' },
  subtitle: { color: '#64748B', marginTop: 4 },
  addButton: { flexDirection: 'row', gap: 5, alignItems: 'center', backgroundColor: '#0F2027', padding: 10, borderRadius: 8 },
  addText: { color: '#FFFFFF', fontWeight: '700' },
  toast: { color: '#92400E', backgroundColor: '#FEF3C7', padding: 10, borderRadius: 8 },
  empty: { alignItems: 'center', padding: 32, backgroundColor: '#FFFFFF', borderRadius: 16, gap: 8 },
  emptyTitle: { color: '#0F172A', fontWeight: '700' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', gap: 6 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  student: { color: '#0F172A', fontWeight: '700' },
  date: { color: '#94A3B8', fontSize: 12 },
  type: { color: '#B45309', fontSize: 12, fontWeight: '700' },
  subject: { color: '#64748B', fontSize: 12 },
  description: { color: '#334155' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 },
  modal: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  label: { color: '#334155', fontWeight: '600', marginTop: 8, marginBottom: 6 },
  selector: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 8, marginRight: 6, marginBottom: 6 },
  chipActive: { backgroundColor: '#FEF3C7' },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 10, marginTop: 10, color: '#0F172A' },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 18 },
  cancel: { padding: 10, backgroundColor: '#F1F5F9', borderRadius: 8 },
  save: { minWidth: 110, alignItems: 'center', padding: 10, backgroundColor: '#0F1026', borderRadius: 8 },
  saveText: { color: '#FFFFFF', fontWeight: '700' },
});
