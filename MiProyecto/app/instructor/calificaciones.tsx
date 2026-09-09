import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

interface StudentGrade {
  name: string;
  nota: number;
  maxNota: number;
}
export default function CalificacionesScreenPremium() {
  const [loading, setLoading] = useState(true);
  const [fichaId, setFichaId] = useState<string>('');
  const [fichaNumero, setFichaNumero] = useState<string>('2670142');
  const [programaNombre, setProgramaNombre] = useState<string>('ADSO');
  const [groups, setGroups] = useState<CompetenciaGroup[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

interface CompetenciaGroup {
  id: string;
  title: string;
  overallNota: number;
  students: StudentGrade[];
}
  // Modal para editar/asignar calificación
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentGrade | null>(null);
  const [selectedCompId, setSelectedCompId] = useState<string>('');
  const [inputNota, setInputNota] = useState('');
  const [savingGrade, setSavingGrade] = useState(false);

const GRADES_DATA: CompetenciaGroup[] = [
  {
    id: '1',
    title: 'Analisis de Datos',
    overallNota: 4.2,
    students: [
      { name: 'Valentina Torres', nota: 4.5, maxNota: 5.0 },
      { name: 'Carlos Mendoza', nota: 3.8, maxNota: 5.0 },
      { name: 'Laura Jiménez', nota: 4.2, maxNota: 5.0 },
      { name: 'Andrés Reyes', nota: 4.9, maxNota: 5.0 },
    ],
  },
  {
    id: '2',
    title: 'Programación BD',
    overallNota: 4.2,
    students: [
      { name: 'Valentina Torres', nota: 4.5, maxNota: 5.0 },
      { name: 'Carlos Mendoza', nota: 3.8, maxNota: 5.0 },
      { name: 'Laura Jiménez', nota: 4.2, maxNota: 5.0 },
      { name: 'Andrés Reyes', nota: 4.9, maxNota: 5.0 },
    ],
  },
];
  useEffect(() => {
    loadData();
  }, []);

export default function CalificacionesScreenPremium() {
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const fichas = await fichasService.getFichas();
      if (fichas.length > 0) {
        const target = fichas[0];
        setFichaId(target.id);
        setFichaNumero(target.numero);
        setProgramaNombre(target.programaNombre || 'ADSO');

        const data = await calificacionesService.getCalificacionesByFicha(target.id);
        setGroups(data);
      }
    } catch (err) {
      console.error('Error cargando calificaciones:', err);
      showToast('Error al conectar con la base de datos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGradeModal = (comp: CompetenciaGroup, student: StudentGrade) => {
    setSelectedCompId(comp.id);
    setSelectedStudent(student);
    setInputNota(student.nota ? student.nota.toString() : '4.0');
    setModalVisible(true);
  };

  const handleSaveGrade = async () => {
    if (!selectedStudent || !selectedCompId) return;
    const notaNum = parseFloat(inputNota.replace(',', '.'));
    if (isNaN(notaNum) || notaNum < 0.0 || notaNum > 5.0) {
      showToast('⚠️ La nota debe estar entre 0.0 y 5.0');
      return;
    }

    setSavingGrade(true);
    try {
      await calificacionesService.registrarCalificacion({
        aprendizId: selectedStudent.id,
        competenciaId: selectedCompId,
        nota: Number(notaNum.toFixed(1)),
        periodo: '2026-1',
      });

      // Actualizar estado local inmediatamente
      setGroups(prev =>
        prev.map(g => {
          if (g.id !== selectedCompId) return g;
          const updatedStudents = g.students.map(s =>
            s.id === selectedStudent.id ? { ...s, nota: Number(notaNum.toFixed(1)), hasRecord: true } : s
          );
          const graded = updatedStudents.filter(s => s.hasRecord);
          const sum = graded.reduce((acc, curr) => acc + curr.nota, 0);
          const overallNota = graded.length > 0 ? Number((sum / graded.length).toFixed(1)) : g.overallNota;
          return { ...g, students: updatedStudents, overallNota };
        })
      );

      setModalVisible(false);
      showToast(`✅ Calificación guardada: ${notaNum.toFixed(1)}`);
    } catch (err: any) {
      console.error('Error al guardar calificación:', err);
      showToast('⚠️ ' + (err.message || 'Error al guardar'));
    } finally {
      setSavingGrade(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GOLD} />
        <Text style={styles.loadingText}>Cargando calificaciones desde PostgreSQL...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Title */}
      <Text style={styles.pageTitle}>Calificaciones</Text>
      {/* Toast Notification */}
      {toastMessage && (
        <View style={styles.toastBanner}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Cards List */}
      <View style={styles.cardsList}>
        {GRADES_DATA.map((group) => (
          <View key={group.id} style={styles.gradeCard}>
            {/* Header row inside card */}
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>{group.title}</Text>
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreBadgeLabel}>Promedio:</Text>
                <Text style={styles.overallScore}>{group.overallNota.toFixed(1)}</Text>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>Libro de Calificaciones</Text>
          <Text style={styles.pageSubtitle}>
            Ficha {fichaNumero} • {programaNombre}
          </Text>
        </View>

        <Pressable style={styles.refreshBtn} onPress={loadData}>
          <Ionicons name="reload-outline" size={16} color="#475569" />
          <Text style={styles.refreshBtnText}>Actualizar</Text>
        </Pressable>
      </View>

      {groups.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="school-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyTitle}>Sin registros de competencias</Text>
          <Text style={styles.emptySub}>
            No se encontraron competencias o aprendices matriculados en la ficha {fichaNumero}.
          </Text>
        </View>
      ) : (
        /* Cards List */
        <View style={styles.cardsList}>
          {groups.map(group => (
            <View key={group.id} style={styles.gradeCard}>
              {/* Header row inside card */}
              <View style={styles.cardHeaderRow}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={styles.cardTitle}>{group.title}</Text>
                  {group.codigo && <Text style={styles.compCode}>Código: {group.codigo}</Text>}
                </View>
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreBadgeLabel}>Promedio:</Text>
                  <Text style={[styles.overallScore, group.overallNota >= 3.5 ? { color: GREEN } : { color: RED }]}>
                    {group.overallNota.toFixed(1)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Table Column Headers */}
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.headerCell, styles.nameHeader]}>Aprendiz</Text>
              <Text style={[styles.headerCell, styles.notaHeader]}>Nota</Text>
              <Text style={[styles.headerCell, styles.progressHeader]}>Progreso</Text>
            </View>
              {/* Table Column Headers */}
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.headerCell, styles.nameHeader]}>Aprendiz</Text>
                <Text style={[styles.headerCell, styles.notaHeader]}>Nota</Text>
                <Text style={[styles.headerCell, styles.progressHeader]}>Cumplimiento</Text>
                <Text style={[styles.headerCell, styles.actionHeader]}>Acción</Text>
              </View>

            {/* Student Rows */}
            {group.students.map((student, idx) => {
              const progressPct = (student.nota / student.maxNota) * 100;
              return (
                <View key={idx} style={styles.studentRow}>
                  <View style={styles.nameGroup}>
                    <View style={styles.miniAvatar}>
                      <Text style={styles.miniAvatarText}>
                        {student.name.split(' ').map(n => n[0]).join('')}
              {/* Student Rows */}
              {group.students.map((student, idx) => {
                const isApproved = student.nota >= 3.5;
                const progressPct = Math.min(100, Math.max(0, (student.nota / student.maxNota) * 100));

                return (
                  <View key={student.id || idx} style={styles.studentRow}>
                    <View style={styles.nameGroup}>
                      <View style={styles.miniAvatar}>
                        <Text style={styles.miniAvatarText}>
                          {student.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.studentName} numberOfLines={1}>
                        {student.name}
                      </Text>
                    </View>
                    <Text style={styles.studentName}>{student.name}</Text>
                  </View>

                  <Text style={styles.studentNota}>{student.nota.toFixed(1)}</Text>
                  
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
                    <Text
                      style={[
                        styles.studentNota,
                        student.hasRecord
                          ? isApproved
                            ? { color: GREEN }
                            : { color: RED }
                          : { color: '#64748B' },
                      ]}
                    >
                      {student.nota.toFixed(1)}
                    </Text>

                    <View style={styles.progressContainer}>
                      <View style={styles.progressBarBg}>
                        <View
                          style={[
                            styles.progressBarFill,
                            { width: `${progressPct}%` },
                            isApproved ? { backgroundColor: GREEN } : { backgroundColor: RED },
                          ]}
                        />
                      </View>
                    </View>

                    <View style={styles.actionCell}>
                      <Pressable
                        style={styles.btnEditGrade}
                        onPress={() => handleOpenGradeModal(group, student)}
                      >
                        <Ionicons name="create-outline" size={15} color={NAVY} />
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      )}

      {/* Grade Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Asignar Calificación</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>

            {selectedStudent && (
              <View style={styles.modalBody}>
                <Text style={styles.modalStudentName}>{selectedStudent.name}</Text>
                <Text style={styles.modalScaleNote}>Escala formativa SENA: 0.0 a 5.0 (Aprobación ≥ 3.5)</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nota definitiva:</Text>
                  <TextInput
                    style={styles.gradeInput}
                    value={inputNota}
                    onChangeText={setInputNota}
                    keyboardType="numeric"
                    placeholder="Ej. 4.5"
                    maxLength={4}
                  />
                </View>
              );
            })}

                <View style={styles.modalActions}>
                  <Pressable
                    style={styles.btnModalCancel}
                    onPress={() => setModalVisible(false)}
                    disabled={savingGrade}
                  >
                    <Text style={styles.btnModalCancelText}>Cancelar</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.btnModalSave, savingGrade && { opacity: 0.7 }]}
                    onPress={handleSaveGrade}
                    disabled={savingGrade}
                  >
                    {savingGrade ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.btnModalSaveText}>Guardar en BD</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        ))}
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
    flexWrap: 'wrap',
    gap: 12,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 24,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
  },
  refreshBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
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
    gap: 24,
  },
  gradeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  compCode: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  scoreBadgeLabel: {
    fontSize: 12,
    color: '#78350F',
    color: '#475569',
    fontWeight: '500',
  },
  overallScore: {
    fontSize: 18,
    fontWeight: '800',
    color: GOLD,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerCell: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  nameHeader: {
    flex: 2,
    flex: 3,
  },
  notaHeader: {
    flex: 1,
    textAlign: 'center',
  },
  progressHeader: {
    flex: 2,
    textAlign: 'center',
  },
  actionHeader: {
    flex: 0.8,
    textAlign: 'center',
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  nameGroup: {
    flex: 2,
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: NAVY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniAvatarText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  studentName: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
    flexShrink: 1,
  },
  studentNota: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
  },
  progressContainer: {
    flex: 2,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: GOLD,
    borderRadius: 4,
  },
  actionCell: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnEditGrade: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    width: '100%',
    maxWidth: 420,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
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
    color: '#0F172A',
  },
  modalBody: {
    gap: 12,
  },
  modalStudentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  modalScaleNote: {
    fontSize: 12,
    color: '#64748B',
  },
  inputGroup: {
    marginTop: 8,
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  gradeInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
  },
  btnModalCancel: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  btnModalCancelText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 13,
  },
  btnModalSave: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#0F2027',
    minWidth: 110,
    alignItems: 'center',
  },
  btnModalSaveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
