import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  Platform,
  useWindowDimensions,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fichasService, Ficha } from '../../services/fichasService';

const NAVY = '#0F1026';
const GOLD = '#D4AF37';
const BG_PAGE = '#F8FAFC';

export default function FichasScreenInstructor() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State para modal de carga CSV
  const [uploadFicha, setUploadFicha] = useState<Ficha | null>(null);
  const [isGeneralUpload, setIsGeneralUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  async function loadFichas() {
    try {
      const data = await fichasService.getFichas();
      setFichas(data);
    } catch (error) {
      console.error('Error al cargar fichas:', error);
    }
  }

  useEffect(() => {
    setLoading(true);
    loadFichas().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFichas();
    setRefreshing(false);
  }, []);

  const totalAprendices = fichas.reduce((acc, f) => acc + (f.aprendicesCount || 0), 0);

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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, isMobile && { paddingHorizontal: 14, paddingVertical: 14 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={GOLD}
          colors={[GOLD, NAVY]}
        />
      }
    >
      {/* Title */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.pageTitle}>Mis Fichas de Formación</Text>
          <Text style={styles.pageSubtitle}>Carga y gestión de aprendices asignados</Text>
        </View>
        <Pressable style={styles.uploadMainBtn} onPress={handleOpenGeneralUpload}>
          <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.uploadMainBtnText}>Cargar CSV / Excel General</Text>
        </Pressable>
      </View>

      {/* Top Stat Cards Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={styles.statIconWrap}>
            <Ionicons name="bookmark-outline" size={18} color={GOLD} />
          </View>
          <View style={styles.statTextGroup}>
            <Text style={styles.statLabel}>Fichas asignadas</Text>
            <Text style={styles.statNumber}>{loading ? '-' : fichas.length}</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconWrap}>
            <Ionicons name="people-outline" size={18} color={GOLD} />
          </View>
          <View style={styles.statTextGroup}>
            <Text style={styles.statLabel}>Aprendices Totales</Text>
            <Text style={styles.statNumber}>{loading ? '-' : totalAprendices}</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={GOLD} />
          <Text style={{ marginTop: 12, color: '#64748B', fontWeight: '600' }}>Cargando fichas desde la base de datos...</Text>
        </View>
      ) : fichas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={54} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No hay fichas asignadas</Text>
          <Text style={styles.emptySubtitle}>
            No tienes fichas vinculadas en este momento. Puedes cargar un archivo CSV/Excel para asociar tus fichas y aprendices.
          </Text>
          <Pressable style={styles.emptyActionBtn} onPress={handleOpenGeneralUpload}>
            <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.emptyActionText}>Cargar CSV de Fichas</Text>
          </Pressable>
        </View>
      ) : (
        fichas.map((ficha) => (
          <View key={ficha.id} style={styles.fichaCard}>
            {/* Header row inside card */}
            <View style={styles.fichaHeaderRow}>
              <View style={styles.fichaLeftHeader}>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeBadgeText}>{ficha.numero.slice(-3) || '000'}</Text>
                </View>
                <View style={styles.fichaTitleGroup}>
                  <Text style={styles.fichaTitle}>{ficha.programaNombre || 'Programa de Formación'}</Text>
                  <Text style={styles.fichaSubtitle}>
                    Ficha {ficha.numero} • Jornada {ficha.jornada || 'Mañana'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Pills Row */}
            <View style={styles.pillsRow}>
              <View style={styles.goldPill}>
                <Ionicons name="people" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.goldPillText}>{ficha.aprendicesCount || 0} Aprendices</Text>
              </View>
            </View>

            {/* Action Buttons Row */}
            <View style={styles.actionsRow}>
              <Pressable
                style={styles.btnGold}
                onPress={() => router.push('/instructor/asistencia' as any)}
              >
                <Ionicons name="checkbox-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.btnGoldText}>Ver Asistencia</Text>
              </Pressable>

              <Pressable
                style={styles.btnWhite}
                onPress={() => router.push('/instructor/aprendices' as any)}
              >
                <Ionicons name="people-outline" size={16} color="#1E293B" style={{ marginRight: 6 }} />
                <Text style={styles.btnWhiteText}>Ver Aprendices</Text>
              </Pressable>

              <Pressable
                style={styles.btnNavy}
                onPress={() => handleOpenFichaUpload(ficha)}
              >
                <Ionicons name="cloud-upload-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.btnNavyText}>Cargar aprendices</Text>
              </Pressable>
            </View>
          </View>
        ))
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
                  ? 'Sube un archivo CSV/Excel con columnas (tipoDocumento, numeroDocumento, nombres, apellidos, correo, ficha, programa).'
                  : `Sube un archivo CSV/Excel para cargar los aprendices de la Ficha ${uploadFicha?.numero}.`}
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
    backgroundColor: BG_PAGE,
  },
  contentContainer: {
    paddingHorizontal: 28,
    paddingVertical: 24,
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
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  statTextGroup: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: NAVY,
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
  fichaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  fichaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  fichaLeftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  codeBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 14,
  },
  codeBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: GOLD,
  },
  fichaTitleGroup: {
    flex: 1,
  },
  fichaTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: NAVY,
  },
  fichaSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  goldPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GOLD,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  goldPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexWrap: 'wrap',
  },
  btnGold: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GOLD,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
    flexGrow: 1,
  },
  btnGoldText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F1026',
  },
  btnWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
    flexGrow: 1,
  },
  btnWhiteText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  btnNavy: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NAVY,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
    flexGrow: 1,
  },
  btnNavyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
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
