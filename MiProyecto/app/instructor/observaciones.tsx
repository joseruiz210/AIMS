import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { fichasService } from '../../services/fichasService';
import { ObservacionItem, observacionesService } from '../../services/observacionesService';

const NAVY = '#0F1026';
type Filter = 'TODAS' | 'ACADEMICA' | 'DISCIPLINARIA' | 'RECONOCIMIENTO';
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
  const [type, setType] = useState<ObservacionItem['tipo']>('ACADEMICA');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const showToast = (message: string) => { setToast(message); setTimeout(() => setToast(null), 2500); };

  const loadData = async () => {
    setLoading(true);
    try {
      const [items, fichas] = await Promise.all([observacionesService.getMisObservaciones(), fichasService.getFichas()]);
      setObservations(items);
      if (fichas[0]) {
        const detail = await fichasService.getFichaById(fichas[0].id);
        const list = (detail?.matriculas || []).map((item: any) => ({ id: item.aprendiz.id, firstName: item.aprendiz.firstName, lastName: item.aprendiz.lastName }));
        setApprentices(list);
        if (!selectedApprentice && list[0]) setSelectedApprentice(list[0].id);
      }
    } catch (error) {
      console.error('Error cargando observaciones:', error);
      showToast('No se pudieron cargar las observaciones');
    } finally { setLoading(false); }
  };

  useEffect(() => { void loadData(); }, []);

  const addObservation = async () => {
    if (!selectedApprentice || description.trim().length < 5) { showToast('Selecciona un aprendiz y escribe al menos 5 caracteres'); return; }
    setSaving(true);
    try {
      await observacionesService.crearObservacion({ aprendizId: selectedApprentice, tipo: type, materia: subject.trim() || undefined, descripcion: description.trim() });
      setModalVisible(false); setSubject(''); setDescription(''); await loadData(); showToast('Observación guardada');
    } catch (error: any) { showToast(error?.message || 'Error al guardar'); } finally { setSaving(false); }
  };

  const deleteObservation = async (id: string) => {
    try { await observacionesService.eliminarObservacion(id); setObservations((items) => items.filter((item) => item.id !== id)); showToast('Observación eliminada'); }
    catch (error: any) { showToast(error?.message || 'Error al eliminar'); }
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color="#D4AF37" /><Text>Cargando observaciones...</Text></View>;
  const filtered = observations.filter((item) => filter === 'TODAS' || item.tipo === filter);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}><View><Text style={styles.title}>Registro de observaciones</Text><Text style={styles.subtitle}>Anotaciones formativas y disciplinarias</Text></View><Pressable style={styles.add} onPress={() => setModalVisible(true)}><Ionicons name="add" size={18} color="#FFFFFF" /><Text style={styles.addText}>Nueva</Text></Pressable></View>
      {toast && <Text style={styles.toast}>{toast}</Text>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>{(['TODAS', 'ACADEMICA', 'DISCIPLINARIA', 'RECONOCIMIENTO'] as Filter[]).map((item) => <Pressable key={item} style={[styles.filter, filter === item && styles.filterActive]} onPress={() => setFilter(item)}><Text style={filter === item ? styles.filterTextActive : styles.filterText}>{item}</Text></Pressable>)}</ScrollView>
      {filtered.length === 0 ? <View style={styles.empty}><Ionicons name="chatbubble-ellipses-outline" size={44} color="#94A3B8" /><Text style={styles.cardTitle}>No hay observaciones</Text></View> : filtered.map((item) => <View key={item.id} style={styles.card}><View style={styles.cardHeader}><View style={styles.flex}><Text style={styles.cardTitle}>{item.aprendizNombre || 'Aprendiz'}</Text><Text style={styles.muted}>{item.fecha} - {item.tipo}</Text></View><Pressable onPress={() => void deleteObservation(item.id)}><Ionicons name="trash-outline" size={20} color="#B91C1C" /></Pressable></View>{item.materia && <Text style={styles.subject}>{item.materia}</Text>}<Text style={styles.description}>{item.descripcion}</Text></View>)}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}><View style={styles.backdrop}><View style={styles.modal}><View style={styles.cardHeader}><Text style={styles.cardTitle}>Nueva observación</Text><Pressable onPress={() => setModalVisible(false)}><Ionicons name="close" size={22} color="#64748B" /></Pressable></View><Text style={styles.label}>Aprendiz</Text><ScrollView horizontal>{apprentices.map((item) => <Pressable key={item.id} style={[styles.chip, selectedApprentice === item.id && styles.chipActive]} onPress={() => setSelectedApprentice(item.id)}><Text>{item.firstName} {item.lastName || ''}</Text></Pressable>)}</ScrollView><Text style={styles.label}>Tipo</Text><View style={styles.types}>{(['ACADEMICA', 'DISCIPLINARIA', 'RECONOCIMIENTO'] as const).map((item) => <Pressable key={item} style={[styles.chip, type === item && styles.chipActive]} onPress={() => setType(item)}><Text>{item}</Text></Pressable>)}</View><TextInput style={styles.input} placeholder="Materia (opcional)" value={subject} onChangeText={setSubject} /><TextInput style={[styles.input, styles.textArea]} placeholder="Detalle de la observación" multiline value={description} onChangeText={setDescription} /><View style={styles.actions}><Pressable onPress={() => setModalVisible(false)} disabled={saving}><Text>Cancelar</Text></Pressable><Pressable style={styles.save} onPress={() => void addObservation()} disabled={saving}>{saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveText}>Guardar</Text>}</Pressable></View></View></View></Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' }, content: { padding: 28, paddingBottom: 48, gap: 12 }, loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 }, title: { color: NAVY, fontSize: 25, fontWeight: '700' }, subtitle: { color: '#64748B', marginTop: 5 }, add: { flexDirection: 'row', alignItems: 'center', gap: 5, padding: 11, borderRadius: 8, backgroundColor: NAVY }, addText: { color: '#FFFFFF', fontWeight: '700' }, toast: { color: '#FFFFFF', backgroundColor: NAVY, padding: 12, borderRadius: 8 }, filters: { marginBottom: 4 }, filter: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 20, backgroundColor: '#E2E8F0', marginRight: 8 }, filterActive: { backgroundColor: NAVY }, filterText: { color: '#475569', fontSize: 12 }, filterTextActive: { color: '#FFFFFF', fontSize: 12 }, card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 18, gap: 7 }, cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }, cardTitle: { color: NAVY, fontSize: 16, fontWeight: '700' }, flex: { flex: 1 }, muted: { color: '#64748B', fontSize: 13 }, subject: { color: '#D4AF37', fontWeight: '600' }, description: { color: '#334155', lineHeight: 21 }, empty: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 32, gap: 10 }, backdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'rgba(0,0,0,0.45)' }, modal: { width: '100%', maxWidth: 520, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 22, gap: 12 }, label: { color: NAVY, fontWeight: '600' }, types: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { paddingHorizontal: 12, paddingVertical: 9, backgroundColor: '#E2E8F0', borderRadius: 18, marginRight: 8 }, chipActive: { backgroundColor: '#D4AF37' }, input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 12, color: NAVY }, textArea: { minHeight: 90, textAlignVertical: 'top' }, actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, alignItems: 'center' }, save: { backgroundColor: NAVY, borderRadius: 8, paddingHorizontal: 18, paddingVertical: 12 }, saveText: { color: '#FFFFFF', fontWeight: '700' },
});
