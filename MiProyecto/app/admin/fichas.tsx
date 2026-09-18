import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fichasService, Ficha } from '../../services/fichasService';

const NAVY = '#12103C';
const GOLD = '#cfa235';

export default function FichasScreenAdmin() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State para modal de carga CSV
  const [uploadFicha, setUploadFicha] = useState<Ficha | null>(null);
  const [isGeneralUpload, setIsGeneralUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // State para modal de Asignar Instructor
  const [assignFicha, setAssignFicha] = useState<Ficha | null>(null);
  const [instructoresList, setInstructoresList] = useState<any[]>([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>('');
  const [isLeader, setIsLeader] = useState<boolean>(true);
  const [isAssigning, setIsAssigning] = useState<boolean>(false);
  const [assignFeedback, setAssignFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  async function loadFichas() {
    setLoading(true);
    try {
      const data = await fichasService.getFichas();
      setFichas(data);
    } catch (error) {
      console.error('Error al cargar fichas:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadInstructores() {
    try {
      const data = await fichasService.getInstructores();
      setInstructoresList(data);
    } catch (error) {
      console.error('Error al cargar instructores:', error);
    }
  }

  useEffect(() => {
    loadFichas();
    loadInstructores();
  }, []);

  const filteredFichas = fichas.filter(
    (f) =>
      (f.programaNombre || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.numero || '').includes(search) ||
      (f.instructorNombre || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenGeneralUpload = () => {
    setIsGeneralUpload(true);
    setUploadFicha(null);
    setSelectedFile(null);
    setUploadFileName('');
    setFeedback(null);
  };

  const handleOpenFichaUpload = (ficha: Ficha) => {
    setIsGeneralUpload(false);
    setUploadFicha(ficha);
    setSelectedFile(null);
    setUploadFileName('');
    setFeedback(null);
  };

  const handleOpenAssignModal = (ficha: Ficha) => {
    setAssignFicha(ficha);
    setSelectedInstructorId(ficha.instructorId || (instructoresList[0]?.id || ''));
    setIsLeader(true);
    setAssignFeedback(null);
  };

  const handleTriggerFilePicker = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.csv, .xls, .xlsx';
      input.onchange = (e: any) => {
        const file = e.target?.files?.[0];
        if (file) {
          setSelectedFile(file);
          setUploadFileName(file.name);
          setFeedback(null);
        }
      };
      input.click();
    } else {
      alert('Por favor usa la versión web para seleccionar archivos localmente.');
    }
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) {
      setFeedback({ text: 'Por favor selecciona un archivo CSV o Excel.', type: 'error' });
      return;
    }

    setIsUploading(true);
    setFeedback(null);

    try {
      if (isGeneralUpload) {
        const res = await fichasService.importAprendicesGeneral(selectedFile);
        setFeedback({
          text: `¡Carga exitosa! Se procesaron ${res.totalRows || 0} filas correctamente.`,
          type: 'success',
        });
      } else if (uploadFicha) {
        const res = await fichasService.importAprendices(uploadFicha.id, selectedFile);
        setFeedback({
          text: `¡Aprendices cargados exitosamente a la Ficha ${uploadFicha.numero}!`,
          type: 'success',
        });
      }
      await loadFichas();
    } catch (err: any) {
      setFeedback({
        text: err.message || 'Error al procesar el archivo CSV/Excel.',
        type: 'error',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmAssign = async () => {
    if (!assignFicha || !selectedInstructorId) {
      setAssignFeedback({ text: 'Por favor selecciona un instructor.', type: 'error' });
      return;
    }

    setIsAssigning(true);
    setAssignFeedback(null);

    try {
      await fichasService.assignInstructor(assignFicha.id, selectedInstructorId, isLeader);
      setAssignFeedback({ text: '¡Instructor asignado exitosamente a la ficha!', type: 'success' });
      await loadFichas();
      setTimeout(() => {
        setAssignFicha(null);
      }, 1200);
    } catch (err: any) {
      setAssignFeedback({ text: err.message || 'Error al asignar instructor.', type: 'error' });
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.pageTitle}>Fichas de Formación</Text>
          <Text style={styles.pageSubtitle}>Gestión de grupos, instructores y carga vía CSV/Excel</Text>
        </View>
        <Pressable
          style={styles.uploadMainBtn}
          onPress={handleOpenGeneralUpload}
        >
          <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.uploadMainBtnText}>Cargar CSV / Excel General</Text>
        </Pressable>
      </View>

      {/* Search Input */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={20} color="#64748B" style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por número de ficha, programa o instructor..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Loading state */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={GOLD} />
          <Text style={styles.loadingText}>Cargando fichas desde la base de datos...</Text>
        </View>
      ) : filteredFichas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={54} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No hay fichas registradas</Text>
          <Text style={styles.emptySubtitle}>
            Usa el botón "Cargar CSV / Excel General" para importar tus archivos de fichas y aprendices.
          </Text>
          <Pressable style={styles.emptyActionBtn} onPress={handleOpenGeneralUpload}>
            <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.emptyActionText}>Subir archivo CSV de Fichas</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {filteredFichas.map((item) => (
            <View key={item.id} style={styles.fichaCard}>
              <View style={styles.badgeBox}>
                <Text style={styles.badgeCodeText}>{item.numero.slice(-3) || '000'}</Text>
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.programTitle}>{item.programaNombre || 'Programa de Formación'}</Text>
                <Text style={styles.subDetail}>
                  Ficha {item.numero} • Instructor: <Text style={{ fontWeight: '700', color: NAVY }}>{item.instructorNombre || 'Sin asignar'}</Text> • {item.jornada || 'Mañana'}
                </Text>
              </View>

              <View style={styles.rightGroup}>
                <View style={styles.aprendicesBox}>
                  <Text style={styles.aprendicesNum}>{item.aprendicesCount || 0}</Text>
                  <Text style={styles.aprendicesText}>Aprendices</Text>
                </View>

                <Pressable
                  style={styles.cardAssignBtn}
                  onPress={() => router.push('/admin/horarios')}
                >
                  <Ionicons name="time-outline" size={16} color={NAVY} style={{ marginRight: 6 }} />
                  <Text style={styles.cardAssignText}>Horario</Text>
                </Pressable>

                <Pressable
                  style={styles.cardAssignBtn}
                  onPress={() => handleOpenAssignModal(item)}
                >
                  <Ionicons name="person-add-outline" size={16} color={NAVY} style={{ marginRight: 6 }} />
                  <Text style={styles.cardAssignText}>Asignar Instructor</Text>
                </Pressable>

                <Pressable
                  style={styles.cardUploadBtn}
                  onPress={() => handleOpenFichaUpload(item)}
                >
                  <Ionicons name="cloud-upload-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.cardUploadText}>Cargar aprendices</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Modal de Asignar Instructor */}
      {assignFicha && (
        <Modal
          visible={!!assignFicha}
          transparent
          animationType="fade"
          onRequestClose={() => setAssignFicha(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Ionicons name="person-add-outline" size={24} color={GOLD} />
                  <Text style={styles.modalTitle}>Asignar Instructor a Ficha {assignFicha.numero}</Text>
                </View>
                <Pressable onPress={() => setAssignFicha(null)}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </Pressable>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.modalDesc}>
                  Selecciona el instructor que estará a cargo o asociado a la Ficha <Text style={{ fontWeight: '700' }}>{assignFicha.numero}</Text> ({assignFicha.programaNombre}).
                </Text>

                <Text style={{ fontSize: 13, fontWeight: '700', color: NAVY }}>Instructor registrado:</Text>
                {instructoresList.length === 0 ? (
                  <View style={{ padding: 14, backgroundColor: '#FEF2F2', borderRadius: 8 }}>
                    <Text style={{ color: '#991B1B', fontSize: 13 }}>
                      No se encontraron instructores registrados en la base de datos.
                    </Text>
                  </View>
                ) : (
                  <ScrollView style={{ maxHeight: 180, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10 }}>
                    {instructoresList.map((ins: any) => {
                      const insName = `${ins.firstName || ''} ${ins.lastName || ''}`.trim() || ins.email;
                      const isSelected = selectedInstructorId === ins.id;
                      return (
                        <Pressable
                          key={ins.id}
                          style={[
                            { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
                            isSelected && { backgroundColor: '#FEF3C7' }
                          ]}
                          onPress={() => setSelectedInstructorId(ins.id)}
                        >
                          <View>
                            <Text style={{ fontSize: 14, fontWeight: '700', color: NAVY }}>{insName}</Text>
                            <Text style={{ fontSize: 12, color: '#64748B' }}>{ins.email}</Text>
                          </View>
                          {isSelected && <Ionicons name="checkmark-circle" size={20} color={GOLD} />}
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                )}

                <Pressable
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}
                  onPress={() => setIsLeader(!isLeader)}
                >
                  <Ionicons name={isLeader ? "checkbox" : "square-outline"} size={20} color={GOLD} />
                  <Text style={{ fontSize: 13, color: NAVY, fontWeight: '600' }}>Asignar como Instructor Líder de Ficha</Text>
                </Pressable>

                {assignFeedback && (
                  <View style={[styles.feedbackBox, assignFeedback.type === 'error' ? styles.feedbackErr : styles.feedbackOk]}>
                    <Ionicons name={assignFeedback.type === 'error' ? 'alert-circle' : 'checkmark-circle'} size={20} color={assignFeedback.type === 'error' ? '#DC2626' : '#16A34A'} />
                    <Text style={[styles.feedbackText, assignFeedback.type === 'error' ? { color: '#DC2626' } : { color: '#16A34A' }]}>
                      {assignFeedback.text}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.modalFooter}>
                <Pressable style={styles.closeBtn} onPress={() => setAssignFicha(null)}>
                  <Text style={styles.closeBtnText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={[styles.submitBtn, (isAssigning || !selectedInstructorId) && styles.submitBtnDisabled]}
                  disabled={isAssigning || !selectedInstructorId}
                  onPress={handleConfirmAssign}
                >
                  {isAssigning ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="save-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.submitBtnText}>Guardar Asignación</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Modal de Carga CSV / Excel */}
      <Modal
        visible={isGeneralUpload || !!uploadFicha}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setIsGeneralUpload(false);
          setUploadFicha(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="cloud-upload-outline" size={24} color={GOLD} />
                <Text style={styles.modalTitle}>
                  {isGeneralUpload ? 'Cargar CSV / Excel General' : `Cargar Aprendices Ficha ${uploadFicha?.numero}`}
                </Text>
              </View>
              <Pressable onPress={() => { setIsGeneralUpload(false); setUploadFicha(null); }}>
                <Ionicons name="close" size={24} color="#64748B" />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalDesc}>
                {isGeneralUpload
                  ? 'Sube un archivo CSV/Excel con columnas (tipoDocumento, numeroDocumento, nombres, apellidos, correo, ficha, programa). Las fichas y aprendices se crearán automáticamente en la base de datos.'
                  : `Sube un archivo CSV/Excel para asociar aprendices a la Ficha ${uploadFicha?.numero}.`}
              </Text>

              <Pressable style={styles.selectFileBtn} onPress={handleTriggerFilePicker}>
                <Ionicons name="document-text-outline" size={22} color={NAVY} />
                <Text style={styles.selectFileBtnText}>
                  {uploadFileName ? uploadFileName : 'Seleccionar archivo CSV o Excel (.csv, .xlsx)'}
                </Text>
              </Pressable>

              <View style={styles.reqColumnsBox}>
                <Text style={styles.reqTitle}>Columnas requeridas en el archivo:</Text>
                <Text style={styles.reqText}>
                  tipoDocumento · numeroDocumento · nombres · apellidos · correo {isGeneralUpload ? '· ficha · programa' : ''}
                </Text>
              </View>

              {feedback && (
                <View style={[styles.feedbackBox, feedback.type === 'error' ? styles.feedbackErr : styles.feedbackOk]}>
                  <Ionicons name={feedback.type === 'error' ? 'alert-circle' : 'checkmark-circle'} size={20} color={feedback.type === 'error' ? '#DC2626' : '#16A34A'} />
                  <Text style={[styles.feedbackText, feedback.type === 'error' ? { color: '#DC2626' } : { color: '#16A34A' }]}>
                    {feedback.text}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.modalFooter}>
              <Pressable style={styles.closeBtn} onPress={() => { setIsGeneralUpload(false); setUploadFicha(null); }}>
                <Text style={styles.closeBtnText}>Cerrar</Text>
              </Pressable>
              <Pressable
                style={[styles.submitBtn, (!selectedFile || isUploading) && styles.submitBtnDisabled]}
                disabled={!selectedFile || isUploading}
                onPress={handleConfirmUpload}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.submitBtnText}>Confirmar e Importar</Text>
                  </>
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
    backgroundColor: '#F4F6F9',
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: NAVY,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  uploadMainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NAVY,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  uploadMainBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: NAVY,
  },
  centerLoading: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: NAVY,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 480,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GOLD,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  listContainer: {
    gap: 16,
  },
  fichaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgeBox: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: 'rgba(207, 162, 53, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCodeText: {
    color: GOLD,
    fontWeight: '800',
    fontSize: 16,
  },
  infoContainer: {
    flex: 1,
    minWidth: 200,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: NAVY,
  },
  subDetail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  aprendicesBox: {
    alignItems: 'center',
  },
  aprendicesNum: {
    fontSize: 16,
    fontWeight: '700',
    color: NAVY,
  },
  aprendicesText: {
    fontSize: 12,
    color: '#64748B',
  },
  cardAssignBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  cardAssignText: {
    color: NAVY,
    fontWeight: '700',
    fontSize: 13,
  },
  cardUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GOLD,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  cardUploadText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: NAVY,
  },
  modalBody: {
    padding: 20,
    gap: 14,
  },
  modalDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  selectFileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: GOLD,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 18,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
  },
  selectFileBtnText: {
    color: NAVY,
    fontWeight: '700',
    fontSize: 14,
  },
  reqColumnsBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: GOLD,
  },
  reqTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: NAVY,
  },
  reqText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  feedbackOk: {
    backgroundColor: '#DCFCE7',
  },
  feedbackErr: {
    backgroundColor: '#FEE2E2',
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  closeBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  closeBtnText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 13,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: GOLD,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
