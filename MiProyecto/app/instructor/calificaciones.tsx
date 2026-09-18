import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  RefreshControl,
} from 'react-native';
import { fichasService } from '../../services/fichasService';
import { calificacionesService, CompetenciaGroup, StudentGrade } from '../../services/calificacionesService';

const GOLD = '#D4AF37';
const NAVY = '#0F1026';
const GREEN = '#2ECC71';
const RED = '#E74C3C';

export default function CalificacionesScreenPremium() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [groups, setGroups] = useState<CompetenciaGroup[]>([]);
  const [fichaNumero, setFichaNumero] = useState('');
  const [programaNombre, setProgramaNombre] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentGrade | null>(null);
  const [selectedCompId, setSelectedCompId] = useState('');
  const [inputNota, setInputNota] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { void loadData(); }, []);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const fichas = await fichasService.getFichas();
      const ficha = fichas[0];
      if (!ficha) {
        setGroups([]);
        return;
      }
      setFichaNumero(ficha.numero);
      setProgramaNombre(ficha.programaNombre || '');
      setGroups(await calificacionesService.getCalificacionesByFicha(ficha.id));
    } catch (error) {
      console.error('Error cargando calificaciones:', error);
      showToast('Error al conectar con la base de datos');
    } finally {
      setLoading(false);
    }
  };

  const openGradeModal = (group: CompetenciaGroup, student: StudentGrade) => {
    setSelectedCompId(group.id);
    setSelectedStudent(student);
    setInputNota(String(student.nota || 4));
    setModalVisible(true);
  };

  const saveGrade = async () => {
    if (!selectedStudent || !selectedCompId) return;
    const nota = Number.parseFloat(inputNota.replace(',', '.'));
    if (!Number.isFinite(nota) || nota < 0 || nota > 5) {
      showToast('La nota debe estar entre 0.0 y 5.0');
      return;
    }
    setSaving(true);
    const rounded = Number(nota.toFixed(1));
    try {
      await calificacionesService.registrarCalificacion({
        aprendizId: selectedStudent.id,
        competenciaId: selectedCompId,
        nota: rounded,
        periodo: '2026-1',
      });
      setGroups(previous => previous.map(group => {
        if (group.id !== selectedCompId) return group;
        const students = group.students.map(student => student.id === selectedStudent.id
          ? { ...student, nota: rounded, hasRecord: true }
          : student);
        const graded = students.filter(student => student.hasRecord);
        const average = graded.length
          ? Number((graded.reduce((sum, student) => sum + student.nota, 0) / graded.length).toFixed(1))
          : group.overallNota;
        return { ...group, students, overallNota: average };
      }));
      setModalVisible(false);
      showToast(`Calificación guardada: ${rounded.toFixed(1)}`);
    } catch (error: any) {
      console.error('Error al guardar calificación:', error);
      showToast(error?.message || 'Error al guardar la calificación');
    } finally {
      setSaving(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color={GOLD} /><Text>Cargando calificaciones...</Text></View>;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={GOLD}
          colors={[GOLD, NAVY]}
        />
      }
    >
      <View style={styles.header}>
        <View><Text style={styles.title}>Libro de Calificaciones</Text><Text style={styles.subtitle}>{fichaNumero ? `Ficha ${fichaNumero}${programaNombre ? ` • ${programaNombre}` : ''}` : 'Sin ficha asignada'}</Text></View>
        <Pressable style={styles.refresh} onPress={loadData}><Ionicons name="reload-outline" size={16} color="#475569" /><Text>Actualizar</Text></Pressable>
      </View>
      {toast && <View style={styles.toast}><Text style={styles.toastText}>{toast}</Text></View>}
      {groups.length === 0 ? <View style={styles.empty}><Ionicons name="school-outline" size={44} color="#94A3B8" /><Text style={styles.emptyTitle}>Sin registros de competencias</Text></View> : groups.map(group => (
        <View key={group.id} style={styles.card}>
          <View style={styles.cardHeader}><Text style={styles.cardTitle}>{group.title}</Text><Text style={styles.score}>{group.overallNota.toFixed(1)}</Text></View>
          <View style={styles.tableHeader}><Text style={styles.nameColumn}>Aprendiz</Text><Text style={styles.gradeColumn}>Nota</Text><Text style={styles.progressColumn}>Cumplimiento</Text><Text style={styles.actionColumn}>Acción</Text></View>
          {group.students.map(student => {
            const progress = Math.min(100, Math.max(0, student.nota / student.maxNota * 100));
            const approved = student.nota >= 3.5;
            return <View key={student.id} style={styles.row}>
              <View style={styles.nameColumn}><View style={styles.avatar}><Text style={styles.avatarText}>{student.name.slice(0, 2).toUpperCase()}</Text></View><Text numberOfLines={1} style={styles.studentName}>{student.name}</Text></View>
              <Text style={[styles.gradeColumn, { color: approved ? GREEN : RED }]}>{student.nota.toFixed(1)}</Text>
              <View style={styles.progressColumn}><View style={styles.progressBg}><View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: approved ? GREEN : RED }]} /></View></View>
              <Pressable style={styles.edit} onPress={() => openGradeModal(group, student)}><Ionicons name="create-outline" size={16} color={NAVY} /></Pressable>
            </View>;
          })}
        </View>
      ))}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.backdrop}><View style={styles.modal}><View style={styles.modalHeader}><Text style={styles.modalTitle}>Asignar Calificación</Text><Pressable onPress={() => setModalVisible(false)}><Ionicons name="close" size={22} color="#64748B" /></Pressable></View>
          {selectedStudent && <><Text>{selectedStudent.name}</Text><Text style={styles.note}>Escala SENA: 0.0 a 5.0</Text><TextInput style={styles.input} value={inputNota} onChangeText={setInputNota} keyboardType="numeric" maxLength={4} /></>}
          <View style={styles.actions}><Pressable style={styles.cancel} onPress={() => setModalVisible(false)} disabled={saving}><Text>Cancelar</Text></Pressable><Pressable style={styles.save} onPress={saveGrade} disabled={saving}>{saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.saveText}>Guardar en BD</Text>}</Pressable></View>
        </View></View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 28, gap: 20, paddingBottom: 40 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  title: { fontSize: 26, fontWeight: '700', color: '#0F172A' },
  subtitle: { color: '#64748B', marginTop: 4 },
  refresh: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 9, backgroundColor: '#E2E8F0', borderRadius: 8 },
  toast: { alignSelf: 'center', backgroundColor: NAVY, padding: 10, borderRadius: 8 },
  toastText: { color: '#FFFFFF', fontWeight: '600' },
  empty: { alignItems: 'center', padding: 32, backgroundColor: '#FFFFFF', borderRadius: 16, gap: 8 },
  emptyTitle: { color: '#0F172A', fontWeight: '700' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 22, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  cardTitle: { flex: 1, color: '#0F172A', fontSize: 18, fontWeight: '700' },
  score: { color: GOLD, fontSize: 18, fontWeight: '800' },
  tableHeader: { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  nameColumn: { flex: 3, flexDirection: 'row', alignItems: 'center', gap: 8 },
  gradeColumn: { flex: 1, textAlign: 'center' },
  progressColumn: { flex: 2, paddingHorizontal: 8 },
  actionColumn: { width: 42, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: NAVY, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  studentName: { flexShrink: 1, color: '#1E293B', fontSize: 13 },
  progressBg: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  edit: { width: 42, alignItems: 'center', padding: 6, backgroundColor: '#F1F5F9', borderRadius: 6 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modal: { width: '100%', maxWidth: 420, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 22 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  modalTitle: { color: '#0F172A', fontSize: 18, fontWeight: '700' },
  note: { color: '#64748B', fontSize: 12, marginVertical: 10 },
  input: { color: '#0F172A', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 10, fontSize: 16 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 18 },
  cancel: { padding: 10, backgroundColor: '#F1F5F9', borderRadius: 8 },
  save: { minWidth: 110, alignItems: 'center', padding: 10, backgroundColor: NAVY, borderRadius: 8 },
  saveText: { color: '#FFFFFF', fontWeight: '700' },
});
