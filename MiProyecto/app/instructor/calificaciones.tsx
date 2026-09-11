<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
=======
>>>>>>> 73ee7842ad18e133f6032a127c51fc3148683cdd
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
import { calificacionesService, CompetenciaGroup, StudentGrade } from '../../services/calificacionesService';

const GOLD = '#D4AF37';
const NAVY = '#0F1026';
const GREEN = '#2ECC71';
const RED = '#E74C3C';

<<<<<<< HEAD
export default function CalificacionesScreenPremium() {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<CompetenciaGroup[]>([]);
  const [fichaNumero, setFichaNumero] = useState('');
  const [programaNombre, setProgramaNombre] = useState('');
  const [toast, setToast] = useState<string | null>(null);
=======
export default function CalificacionesScreen() {
  const [loading, setLoading] = useState(true);
  const [fichaNumero, setFichaNumero] = useState('');
  const [programaNombre, setProgramaNombre] = useState('');
  const [groups, setGroups] = useState<CompetenciaGroup[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
>>>>>>> 73ee7842ad18e133f6032a127c51fc3148683cdd
  const [selectedStudent, setSelectedStudent] = useState<StudentGrade | null>(null);
  const [selectedCompId, setSelectedCompId] = useState('');
  const [inputNota, setInputNota] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

<<<<<<< HEAD
  useEffect(() => { void loadData(); }, []);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
=======
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2500);
>>>>>>> 73ee7842ad18e133f6032a127c51fc3148683cdd
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const fichas = await fichasService.getFichas();
<<<<<<< HEAD
      const ficha = fichas[0];
      if (!ficha) {
        setGroups([]);
        return;
      }
=======
      if (fichas.length === 0) {
        setGroups([]);
        return;
      }
      const ficha = fichas[0];
>>>>>>> 73ee7842ad18e133f6032a127c51fc3148683cdd
      setFichaNumero(ficha.numero);
      setProgramaNombre(ficha.programaNombre || 'ADSO');
      setGroups(await calificacionesService.getCalificacionesByFicha(ficha.id));
    } catch (error) {
      console.error('Error cargando calificaciones:', error);
<<<<<<< HEAD
      showToast('Error al conectar con la base de datos');
=======
      showToast('No se pudieron cargar las calificaciones');
>>>>>>> 73ee7842ad18e133f6032a127c51fc3148683cdd
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const openGradeModal = (group: CompetenciaGroup, student: StudentGrade) => {
    setSelectedCompId(group.id);
    setSelectedStudent(student);
    setInputNota(String(student.nota || 4));
=======
  useEffect(() => {
    loadData();
  }, []);

  const openGradeModal = (group: CompetenciaGroup, student: StudentGrade) => {
    setSelectedCompId(group.id);
    setSelectedStudent(student);
    setInputNota(student.nota ? String(student.nota) : '');
>>>>>>> 73ee7842ad18e133f6032a127c51fc3148683cdd
    setModalVisible(true);
  };

  const saveGrade = async () => {
    if (!selectedStudent || !selectedCompId) return;
    const nota = Number.parseFloat(inputNota.replace(',', '.'));
<<<<<<< HEAD
    if (!Number.isFinite(nota) || nota < 0 || nota > 5) {
      showToast('La nota debe estar entre 0.0 y 5.0');
      return;
    }
    setSaving(true);
    const rounded = Number(nota.toFixed(1));
=======
    if (Number.isNaN(nota) || nota < 0 || nota > 5) {
      showToast('La nota debe estar entre 0.0 y 5.0');
      return;
    }
    setSavingGrade(true);
>>>>>>> 73ee7842ad18e133f6032a127c51fc3148683cdd
    try {
      await calificacionesService.registrarCalificacion({
        aprendizId: selectedStudent.id,
        competenciaId: selectedCompId,
<<<<<<< HEAD
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
=======
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
>>>>>>> 73ee7842ad18e133f6032a127c51fc3148683cdd
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
<<<<<<< HEAD
    return <View style={styles.loading}><ActivityIndicator size="large" color={GOLD} /><Text>Cargando calificaciones...</Text></View>;
=======
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GOLD} />
        <Text style={styles.mutedText}>Cargando calificaciones...</Text>
      </View>
    );
>>>>>>> 73ee7842ad18e133f6032a127c51fc3148683cdd
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
<<<<<<< HEAD
      <View style={styles.header}>
        <View><Text style={styles.title}>Libro de Calificaciones</Text><Text style={styles.subtitle}>Ficha {fichaNumero || 'sin ficha'} • {programaNombre || 'ADSO'}</Text></View>
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
=======
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
>>>>>>> 73ee7842ad18e133f6032a127c51fc3148683cdd
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
<<<<<<< HEAD
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
=======
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
>>>>>>> 73ee7842ad18e133f6032a127c51fc3148683cdd
  saveText: { color: '#FFFFFF', fontWeight: '700' },
});
