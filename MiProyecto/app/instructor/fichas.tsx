import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fichasService, Ficha } from '../../services/fichasService';

const NAVY = '#0F1026';
const GOLD = '#D4AF37';
const BG_PAGE = '#F8FAFC';

export default function FichasScreenPremium() {
  const router = useRouter();
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadFicha, setUploadFicha] = useState<Ficha | null>(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'validated' | 'saved'>('idle');

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

  useEffect(() => {
    const loadTimer = setTimeout(() => {
      void loadFichas();
    }, 0);

    return () => clearTimeout(loadTimer);
  }, []);

  const totalAprendices = fichas.reduce((acc, f) => acc + (f.aprendicesCount || 0), 0);

  const handleOpenUpload = (ficha: Ficha) => {
    setUploadFicha(ficha);
    setUploadFileName('');
    setUploadStatus('idle');
  };

  const handleSelectFile = (format: 'CSV' | 'Excel') => {
    setUploadFileName(`lista_aprendices_${uploadFicha?.numero || 'ficha'}.${format === 'CSV' ? 'csv' : 'xlsx'}`);
    setUploadStatus('idle');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Title */}
      <Text style={styles.pageTitle}>Mis Fichas de Formación</Text>

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

        <View style={styles.statCard}>
          <View style={styles.statIconWrap}>
            <Ionicons name="analytics-outline" size={18} color={GOLD} />
          </View>
          <View style={styles.statTextGroup}>
            <Text style={styles.statLabel}>Promedio Global</Text>
            <Text style={styles.statNumber}>4.5</Text>
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
          <Ionicons name="folder-open-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No hay fichas asignadas</Text>
          <Text style={styles.emptySubtitle}>No tienes fichas de formación vinculadas en este momento.</Text>
        </View>
      ) : (
        fichas.map((ficha) => (
          <View key={ficha.id} style={styles.fichaCard}>
            {/* Header row inside card */}
            <View style={styles.fichaHeaderRow}>
              <View style={styles.fichaLeftHeader}>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeBadgeText}>{ficha.numero}</Text>
                </View>
                <View style={styles.fichaTitleGroup}>
                  <Text style={styles.fichaTitle}>{ficha.programaNombre || 'Programa de Formación'}</Text>
                  <Text style={styles.fichaSubtitle}>
                    Ficha {ficha.numero} • Jornada {ficha.jornada || 'Mañana'}
                  </Text>
                </View>
              </View>

              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusBadgeText}>{ficha.estado ? ficha.estado.toUpperCase() : 'ACTIVO'}</Text>
              </View>
            </View>

            {/* 3 Pills Row */}
            <View style={styles.pillsRow}>
              <View style={styles.goldPill}>
                <Ionicons name="people" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.goldPillText}>{ficha.aprendicesCount || 0} Aprendices</Text>
              </View>

              <View style={styles.whitePill}>
                <Ionicons name="checkbox-outline" size={14} color="#10B981" style={{ marginRight: 6 }} />
                <Text style={styles.whitePillText}>90% Asistencia</Text>
              </View>

              <View style={styles.whitePill}>
                <Ionicons name="star-outline" size={14} color={GOLD} style={{ marginRight: 6 }} />
                <Text style={styles.whitePillText}>4.5 Promedio</Text>
              </View>
            </View>

            {/* Progress bar section */}
            <View style={styles.progressSection}>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabel}>Asistencia general del grupo</Text>
                <Text style={styles.progressPercentage}>90%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '90%' }]} />
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
                style={styles.btnWhite}
                onPress={() => router.push('/instructor/calificaciones' as any)}
              >
                <Ionicons name="bar-chart-outline" size={16} color="#1E293B" style={{ marginRight: 6 }} />
                <Text style={styles.btnWhiteText}>Ver Notas</Text>
              </Pressable>

              <Pressable
                style={styles.btnNavy}
                onPress={() => handleOpenUpload(ficha)}
              >
                <Ionicons name="cloud-upload-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.btnNavyText}>Cargar aprendices</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}

      <Modal
        visible={!!uploadFicha}
        transparent
        animationType="slide"
        onRequestClose={() => setUploadFicha(null)}
      >
        <View style={styles.uploadOverlay}>
          <View style={styles.uploadModal}>
            <View style={styles.uploadHeader}>
              <View style={styles.uploadTitleRow}>
                <View style={styles.uploadIconBadge}>
                  <Ionicons name="cloud-upload-outline" size={21} color={GOLD} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.uploadTitle}>Cargar aprendices</Text>
                  <Text style={styles.uploadSubtitle}>
                    Ficha {uploadFicha?.numero || ''} · {uploadFicha?.programaNombre || 'Programa de formación'}
                  </Text>
                </View>
              </View>
              <Pressable onPress={() => setUploadFicha(null)} style={styles.closeUploadBtn}>
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.uploadBody}>
              <Text style={styles.uploadSectionTitle}>Archivo de aprendices</Text>
              <Text style={styles.uploadDescription}>
                Selecciona el formato de la plantilla que vas a cargar para esta ficha.
              </Text>

              <View style={styles.fileButtonsRow}>
                <Pressable style={styles.fileFormatBtn} onPress={() => handleSelectFile('CSV')}>
                  <Ionicons name="document-text-outline" size={20} color={GOLD} />
                  <Text style={styles.fileFormatText}>Seleccionar CSV</Text>
                </Pressable>
                <Pressable style={styles.fileFormatBtn} onPress={() => handleSelectFile('Excel')}>
                  <Ionicons name="grid-outline" size={20} color={GOLD} />
                  <Text style={styles.fileFormatText}>Seleccionar Excel</Text>
                </Pressable>
              </View>

              <View style={styles.selectedFileBox}>
                <Ionicons name={uploadFileName ? 'document-attach-outline' : 'folder-open-outline'} size={21} color="#64748B" />
                <Text style={styles.selectedFileText} numberOfLines={1}>
                  {uploadFileName || 'Ningún archivo seleccionado'}
                </Text>
              </View>

              <View style={styles.columnsBox}>
                <Text style={styles.columnsTitle}>Columnas requeridas</Text>
                <Text style={styles.columnsText}>Tipo de documento · Documento · Nombres · Apellidos · Correo</Text>
                <Text style={styles.columnsHint}>La validación también revisará filas vacías y documentos repetidos.</Text>
              </View>

              {uploadStatus !== 'idle' && (
                <View style={styles.uploadFeedback}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#047857" />
                  <Text style={styles.uploadFeedbackText}>
                    {uploadStatus === 'saved' ? 'Carga confirmada en la vista previa.' : 'Archivo listo para revisar y confirmar.'}
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.uploadFooter}>
              <Pressable style={styles.cancelUploadBtn} onPress={() => setUploadFicha(null)}>
                <Text style={styles.cancelUploadText}>Cerrar</Text>
              </Pressable>
              <Pressable
                style={[styles.validateUploadBtn, !uploadFileName && styles.disabledUploadBtn]}
                disabled={!uploadFileName}
                onPress={() => setUploadStatus('validated')}
              >
                <Ionicons name="shield-checkmark-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.validateUploadText}>Validar archivo</Text>
              </Pressable>
              <Pressable
                style={[styles.saveUploadBtn, uploadStatus !== 'validated' && styles.disabledUploadBtn]}
                disabled={uploadStatus !== 'validated'}
                onPress={() => setUploadStatus('saved')}
              >
                <Ionicons name="save-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.saveUploadText}>Confirmar carga</Text>
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
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
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
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  fichaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  fichaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    flexWrap: 'wrap',
    gap: 10,
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
    color: '#0F172A',
  },
  fichaSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
    flexWrap: 'wrap',
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
  whitePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  whitePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  progressSection: {
    marginBottom: 18,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
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
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexWrap: 'wrap',
  },
  btnGold: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GOLD,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnGoldText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  btnWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnWhiteText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  btnNavy: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NAVY,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnNavyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  uploadOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 16, 38, 0.58)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  uploadModal: {
    width: '94%',
    maxWidth: 620,
    maxHeight: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  uploadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  uploadTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  uploadIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: NAVY,
  },
  uploadSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeUploadBtn: {
    padding: 6,
  },
  uploadBody: {
    padding: 20,
    gap: 14,
  },
  uploadSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: NAVY,
  },
  uploadDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
  },
  fileButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  fileFormatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 9,
    paddingVertical: 11,
    paddingHorizontal: 14,
    backgroundColor: '#FFFCF2',
  },
  fileFormatText: {
    color: NAVY,
    fontSize: 13,
    fontWeight: '700',
  },
  selectedFileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 9,
    backgroundColor: '#F8FAFC',
    padding: 13,
  },
  selectedFileText: {
    flex: 1,
    color: '#475569',
    fontSize: 13,
  },
  columnsBox: {
    borderLeftWidth: 3,
    borderLeftColor: GOLD,
    backgroundColor: '#FFFCF2',
    padding: 13,
    gap: 5,
  },
  columnsTitle: {
    color: NAVY,
    fontSize: 13,
    fontWeight: '700',
  },
  columnsText: {
    color: '#334155',
    fontSize: 12,
    lineHeight: 18,
  },
  columnsHint: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 16,
  },
  uploadFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderRadius: 9,
    padding: 12,
  },
  uploadFeedbackText: {
    flex: 1,
    color: '#047857',
    fontSize: 12,
    fontWeight: '600',
  },
  uploadFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 9,
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  cancelUploadBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  cancelUploadText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 13,
  },
  validateUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#0F766E',
  },
  saveUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: GOLD,
  },
  disabledUploadBtn: {
    opacity: 0.45,
  },
  validateUploadText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  saveUploadText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
