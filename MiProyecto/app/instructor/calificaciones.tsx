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
import {
  calificacionesService,
  CompetenciaGroup,
  StudentGrade,
} from '../../services/calificacionesService';

const GOLD = '#D4AF37';
const BG_PAGE = '#F8FAFC';
const NAVY = '#0F1026';
const GREEN = '#2ECC71';
const RED = '#E74C3C';

export default function CalificacionesScreen() {
  const [loading, setLoading] = useState(true);
  const [fichaNumero, setFichaNumero] = useState('');
  const [programaNombre, setProgramaNombre] = useState('');
  const [groups, setGroups] = useState<CompetenciaGroup[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentGrade | null>(null);
  const [selectedCompId, setSelectedCompId] = useState('');
  const [inputNota, setInputNota] = useState('');
  const [savingGrade, setSavingGrade] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const fichas = await fichasService.getFichas();
      if (fichas.length === 0) {
        setGroups([]);
        return;
      }
      const ficha = fichas[0];
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

  useEffect(() => {
    loadData();
  }, []);

  const openGradeModal = (group: CompetenciaGroup, student: StudentGrade) => {
    setSelectedCompId(group.id);
    setSelectedStudent(student);
    setInputNota(student.nota ? String(student.nota) : '');
    setModalVisible(true);
  };

  const saveGrade = async () => {
    if (!selectedStudent || !selectedCompId) return;
    const nota = Number.parseFloat(inputNota.replace(',', '.'));
    if (Number.isNaN(nota) || nota < 0 || nota > 5) {
      showToast('La nota debe estar entre 0.0 y 5.0');
      return;
    }
    setSavingGrade(true);
    try {
      await calificacionesService.registrarCalificacion({
        aprendizId: selectedStudent.id,
        competenciaId: selectedCompId,
        nota: Number(nota.toFixed(1)),
        periodo: '2026-1',
      });
      setGroups((current) => current.map((group) => {
        if (group.id !== selectedCompId) return group;
        const students = group.students.map((student) => (
          student.id === selectedStudent.id
            ? { ...student, nota: Number(nota.toFixed(1)), hasRecord: true }
            : student
        ));
        return { ...group, students };
      }));
      setModalVisible(false);
      showToast('Calificacion guardada');
    } catch (error: any) {
      showToast(error.message || 'Error al guardar la calificacion');
    } finally {
      setSavingGrade(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GOLD} />
        <Text style={styles.mutedText}>Cargando calificaciones...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Libro de calificaciones</Text>
          <Text style={styles.subtitle}>Ficha {fichaNumero || 'sin asignar'} - {programaNombre || 'ADSO'}</Text>
        </View>
        <Pressable style={styles.refreshButton} onPress={loadData}>
          <Ionicons name="reload-outline" size={18} color={NAVY} />
          <Text style={styles.refreshText}>Actualizar</Text>
        </Pressable>
      </View>

      {toastMessage && <Text style={styles.toast}>{toastMessage}</Text>}

      {groups.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="school-outline" size={44} color="#94A3B8" />
          <Text style={styles.cardTitle}>Sin calificaciones</Text>
          <Text style={styles.mutedText}>No hay competencias o aprendices registrados.</Text>
        </View>
      ) : groups.map((group) => (
        <View key={group.id} style={styles.gradeCard}>
          <View style={styles.cardHeader}>
            <View style={styles.flexOne}>
              <Text style={styles.cardTitle}>{group.title}</Text>
              {group.codigo && <Text style={styles.mutedText}>Codigo: {group.codigo}</Text>}
            </View>
            <Text style={styles.average}>Promedio {group.overallNota.toFixed(1)}</Text>
          </View>
          {group.students.map((student, index) => {
            const progress = Math.min(100, Math.max(0, (student.nota / student.maxNota) * 100));
            const approved = student.nota >= 3.5;
            return (
              <View key={student.id || index} style={styles.studentRow}>
                <View style={styles.flexOne}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <View style={styles.progressBackground}>
                    <View style={[styles.progress, { width: `${progress}%`, backgroundColor: approved ? GREEN : RED }]} />
                  </View>
                </View>
                <Text style={[styles.grade, { color: approved ? GREEN : RED }]}>{student.nota.toFixed(1)}</Text>
                <Pressable style={styles.editButton} onPress={() => openGradeModal(group, student)}>
                  <Ionicons name="create-outline" size={18} color={NAVY} />
                </Pressable>
              </View>
            );
          })}
        </View>
      ))}

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Asignar calificacion</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>
            <Text style={styles.mutedText}>{selectedStudent?.name}</Text>
            <TextInput
              style={styles.input}
              value={inputNota}
              onChangeText={setInputNota}
              keyboardType="numeric"
              placeholder="Ej. 4.5"
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={saveGrade} disabled={savingGrade}>
                {savingGrade ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveText}>Guardar</Text>}
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
  refreshButton: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, backgroundColor: '#FFFFFF', borderRadius: 8 },
  refreshText: { color: NAVY, fontWeight: '600' },
  toast: { color: '#FFFFFF', backgroundColor: NAVY, padding: 12, borderRadius: 8, marginBottom: 16 },
  gradeCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 18, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 },
  cardTitle: { color: NAVY, fontSize: 17, fontWeight: '700' },
  average: { color: GOLD, fontWeight: '700' },
  flexOne: { flex: 1 },
  mutedText: { color: '#64748B', fontSize: 14 },
  studentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#EEF2F6' },
  studentName: { color: NAVY, fontWeight: '600', marginBottom: 7 },
  progressBackground: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
  progress: { height: '100%', borderRadius: 3 },
  grade: { width: 36, fontSize: 17, fontWeight: '700', textAlign: 'right' },
  editButton: { padding: 8, borderRadius: 6, backgroundColor: '#F1F5F9' },
  emptyCard: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 32, gap: 10 },
  modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'rgba(0,0,0,0.45)' },
  modalCard: { width: '100%', maxWidth: 440, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 22, gap: 14 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 12, color: NAVY },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  cancelButton: { padding: 12 },
  saveButton: { backgroundColor: NAVY, borderRadius: 8, paddingHorizontal: 18, paddingVertical: 12, minWidth: 90, alignItems: 'center' },
  saveText: { color: '#FFFFFF', fontWeight: '700' },
});
