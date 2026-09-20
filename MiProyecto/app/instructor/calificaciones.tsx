import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { calificacionesService, CompetenciaGroup, StudentGrade } from '../../services/calificacionesService';
import { fichasService } from '../../services/fichasService';

const NAVY = '#0F1026';
const GOLD = '#D4AF37';
const GREEN = '#2ECC71';
const RED = '#E74C3C';

export default function CalificacionesScreen() {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<CompetenciaGroup[]>([]);
  const [fichaNumero, setFichaNumero] = useState('');
  const [programaNombre, setProgramaNombre] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ group: CompetenciaGroup; student: StudentGrade } | null>(null);
  const [inputNota, setInputNota] = useState('');
  const [saving, setSaving] = useState(false);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const ficha = (await fichasService.getFichas())[0];
      if (!ficha) {
        setGroups([]);
        return;
      }
      setFichaNumero(ficha.numero);
      setProgramaNombre(ficha.programaNombre || 'ADSO');
      setGroups(await calificacionesService.getCalificacionesByFicha(ficha.id));
    } catch (error) {
      console.error('Error cargando calificaciones:', error);
      showToast('No se pudieron cargar las calificaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadData(); }, []);

  const openGrade = (group: CompetenciaGroup, student: StudentGrade) => {
    setSelected({ group, student });
    setInputNota(student.hasRecord ? String(student.nota) : '');
  };

  const saveGrade = async () => {
    if (!selected) return;
    const nota = Number.parseFloat(inputNota.replace(',', '.'));
    if (!Number.isFinite(nota) || nota < 0 || nota > 5) {
      showToast('La nota debe estar entre 0.0 y 5.0');
      return;
    }
    const rounded = Number(nota.toFixed(1));
    setSaving(true);
    try {
      await calificacionesService.registrarCalificacion({ aprendizId: selected.student.id, competenciaId: selected.group.id, nota: rounded, periodo: '2026-1' });
      setGroups((current) => current.map((group) => {
        if (group.id !== selected.group.id) return group;
        const students = group.students.map((student) => student.id === selected.student.id ? { ...student, nota: rounded, hasRecord: true } : student);
        const graded = students.filter((student) => student.hasRecord);
        const average = graded.length ? Number((graded.reduce((sum, student) => sum + student.nota, 0) / graded.length).toFixed(1)) : group.overallNota;
        return { ...group, students, overallNota: average };
      }));
      setSelected(null);
      showToast(`Calificación guardada: ${rounded.toFixed(1)}`);
    } catch (error: any) {
      showToast(error?.message || 'Error al guardar la calificación');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color={GOLD} /><Text>Cargando calificaciones...</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}><View><Text style={styles.title}>Libro de calificaciones</Text><Text style={styles.subtitle}>Ficha {fichaNumero || 'sin asignar'} - {programaNombre || 'ADSO'}</Text></View><Pressable style={styles.refresh} onPress={() => void loadData}><Ionicons name="reload-outline" size={18} color={NAVY} /><Text>Actualizar</Text></Pressable></View>
      {toast && <Text style={styles.toast}>{toast}</Text>}
      {groups.length === 0 ? <View style={styles.empty}><Ionicons name="school-outline" size={44} color="#94A3B8" /><Text style={styles.cardTitle}>Sin registros de competencias</Text></View> : groups.map((group) => (
        <View key={group.id} style={styles.card}>
          <View style={styles.cardHeader}><Text style={styles.cardTitle}>{group.title}</Text><Text style={styles.average}>{group.overallNota.toFixed(1)}</Text></View>
          {group.students.map((student) => { const approved = student.nota >= 3.5; return <View key={student.id} style={styles.row}><View style={styles.student}><Text style={styles.name}>{student.name}</Text><View style={styles.progressBg}><View style={[styles.progress, { width: `${Math.min(100, Math.max(0, student.nota / student.maxNota * 100))}%`, backgroundColor: approved ? GREEN : RED }]} /></View></View><Text style={[styles.grade, { color: approved ? GREEN : RED }]}>{student.nota.toFixed(1)}</Text><Pressable style={styles.edit} onPress={() => openGrade(group, student)}><Ionicons name="create-outline" size={17} color={NAVY} /></Pressable></View>; })}
        </View>
      ))}
      <Modal visible={selected !== null} transparent animationType="fade" onRequestClose={() => setSelected(null)}><View style={styles.backdrop}><View style={styles.modal}><View style={styles.modalHeader}><Text style={styles.cardTitle}>Asignar calificación</Text><Pressable onPress={() => setSelected(null)}><Ionicons name="close" size={22} color="#64748B" /></Pressable></View><Text>{selected?.student.name}</Text><Text style={styles.muted}>Escala SENA: 0.0 a 5.0</Text><TextInput style={styles.input} value={inputNota} onChangeText={setInputNota} keyboardType="numeric" maxLength={4} /><View style={styles.actions}><Pressable onPress={() => setSelected(null)} disabled={saving}><Text>Cancelar</Text></Pressable><Pressable style={styles.save} onPress={() => void saveGrade()} disabled={saving}>{saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveText}>Guardar</Text>}</Pressable></View></View></View></Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' }, content: { padding: 28, paddingBottom: 48, gap: 16 }, loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 }, title: { color: NAVY, fontSize: 25, fontWeight: '700' }, subtitle: { color: '#64748B', marginTop: 5 },
  refresh: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, backgroundColor: '#FFFFFF', borderRadius: 8 }, toast: { color: '#FFFFFF', backgroundColor: NAVY, padding: 12, borderRadius: 8 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 18, gap: 8 }, cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, cardTitle: { color: NAVY, fontSize: 17, fontWeight: '700' }, average: { color: GOLD, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#EEF2F6' }, student: { flex: 1 }, name: { color: NAVY, fontWeight: '600', marginBottom: 7 }, grade: { width: 38, fontSize: 17, fontWeight: '700', textAlign: 'right' }, progressBg: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }, progress: { height: '100%', borderRadius: 3 }, edit: { padding: 8, borderRadius: 6, backgroundColor: '#F1F5F9' }, empty: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 32, gap: 10 }, muted: { color: '#64748B', fontSize: 13 },
  backdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'rgba(0,0,0,0.45)' }, modal: { width: '100%', maxWidth: 440, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 22, gap: 14 }, modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 12, color: NAVY }, actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, alignItems: 'center' }, save: { backgroundColor: NAVY, borderRadius: 8, paddingHorizontal: 18, paddingVertical: 12, minWidth: 90, alignItems: 'center' }, saveText: { color: '#FFFFFF', fontWeight: '700' },
});
