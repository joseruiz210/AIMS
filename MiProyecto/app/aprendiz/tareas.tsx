import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { evidenciasService, EvidenciaItem } from '../../services/evidenciasService';

const NAVY = '#12103C';
const GOLD = '#cfa235';

export default function TareasAprendizScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [evidencias, setEvidencias] = useState<EvidenciaItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'Todas' | 'Pendientes' | 'Entregadas' | 'Calificadas'>('Todas');
  const [loading, setLoading] = useState(false);

  // Modal para entregar
  const [modalVisible, setModalVisible] = useState(false);
  const [activeEvidencia, setActiveEvidencia] = useState<EvidenciaItem | null>(null);
  const [archivoUrl, setArchivoUrl] = useState('');
  const [comentario, setComentario] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Modal para ver feedback
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);

  useEffect(() => {
    loadEvidencias();
  }, []);

  const loadEvidencias = async () => {
    setLoading(true);
    const data = await evidenciasService.getMisEvidencias();
    setEvidencias(data);
    setLoading(false);
  };

  const handleOpenEntrega = (item: EvidenciaItem) => {
    setActiveEvidencia(item);
    setArchivoUrl(item.entrega?.archivoUrl || '');
    setComentario(item.entrega?.comentario || '');
    setSubmittedSuccess(false);
    setModalVisible(true);
  };

  const handleOpenFeedback = (item: EvidenciaItem) => {
    setActiveEvidencia(item);
    setFeedbackModalVisible(true);
  };

  const handleConfirmEntrega = async () => {
    if (!activeEvidencia) return;
    setSubmitting(true);
    try {
      const result = await evidenciasService.entregarEvidencia(activeEvidencia.id, {
        archivoUrl,
        comentario,
      });

      const entregaData = result?.data;
      const notaObtenida = entregaData?.nota !== undefined ? Number(entregaData.nota) : undefined;
      const feedbackObtenido =
        entregaData?.feedback || entregaData?.evaluacionIa?.feedbackCompleto || entregaData?.comentario || undefined;

      // Recargar evidencias directamente desde PostgreSQL
      await loadEvidencias();

      // Actualizar estado local
      setEvidencias((prev) =>
        prev.map((e) =>
          e.id === activeEvidencia.id
            ? {
                ...e,
                estado: notaObtenida !== undefined ? 'Calificada' : 'Entregada',
                entrega: {
                  id: entregaData?.id || 'new-e',
                  archivoUrl,
                  comentario,
                  fechaEntrega: 'Hoy',
                  nota: notaObtenida,
                  feedback: feedbackObtenido,
                },
              }
            : e
        )
      );

      setSubmitting(false);
      setSubmittedSuccess(true);
      setTimeout(() => {
        setModalVisible(false);
        setSubmittedSuccess(false);
      }, 1200);
    } catch (err: any) {
      setSubmitting(false);
      alert(err.message || 'Error al guardar la entrega en la base de datos');
    }
  };

  // Métricas
  const total = evidencias.length;
  const pendientes = evidencias.filter((e) => e.estado === 'Pendiente').length;
  const entregadas = evidencias.filter((e) => e.estado === 'Entregada').length;
  const calificadas = evidencias.filter((e) => e.estado === 'Calificada').length;
  const notas = evidencias
    .filter((e) => e.entrega?.nota !== undefined)
    .map((e) => Number(e.entrega!.nota));
  const promedioNotas =
    notas.length > 0 ? (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1) : '4.6';

  // Filtrado
  const filteredEvidencias = evidencias.filter((item) => {
    if (selectedFilter === 'Pendientes') return item.estado === 'Pendiente';
    if (selectedFilter === 'Entregadas') return item.estado === 'Entregada';
    if (selectedFilter === 'Calificadas') return item.estado === 'Calificada';
    return true;
  });

  const getStatusBadgeStyle = (estado: EvidenciaItem['estado']) => {
    switch (estado) {
      case 'Calificada':
        return { bg: '#D1FAE5', text: '#047857', icon: 'checkmark-done-circle' as const };
      case 'Entregada':
        return { bg: '#DBEAFE', text: '#1D4ED8', icon: 'time-outline' as const };
      case 'Vencida':
        return { bg: '#FEE2E2', text: '#B91C1C', icon: 'alert-circle' as const };
      default:
        return { bg: '#FEF3C7', text: '#B45309', icon: 'hourglass-outline' as const };
    }
  };

  const pad = isDesktop ? 24 : 14;

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { padding: pad, paddingTop: isDesktop ? 32 : 20 }]}>
      {/* Page Header */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Mis Tareas y Evidencias</Text>
        <Text style={styles.pageSubtitle}>
          Consulta las actividades y proyectos asignados por tus instructores y gestiona tus entregas.
        </Text>
      </View>

      {/* Summary Cards */}
      <View style={[styles.summaryContainer, !isDesktop && styles.summaryContainerMobile]}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>PENDIENTES</Text>
          <Text style={[styles.summaryValue, { color: GOLD }]}>{pendientes}</Text>
          <Text style={styles.summarySubtext}>Por entregar</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>ENTREGADAS</Text>
          <Text style={[styles.summaryValue, { color: '#2563EB' }]}>{entregadas}</Text>
          <Text style={styles.summarySubtext}>En revisión</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>CALIFICADAS</Text>
          <Text style={[styles.summaryValue, { color: '#059669' }]}>{calificadas}</Text>
          <Text style={styles.summarySubtext}>Evaluadas</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>PROMEDIO TAREAS</Text>
          <Text style={[styles.summaryValue, { color: NAVY }]}>{promedioNotas}</Text>
          <Text style={styles.summarySubtext}>Sobre 5.0</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['Todas', 'Pendientes', 'Entregadas', 'Calificadas'] as const).map((filter) => {
          const isActive = selectedFilter === filter;
          const count =
            filter === 'Todas'
              ? total
              : filter === 'Pendientes'
              ? pendientes
              : filter === 'Entregadas'
              ? entregadas
              : calificadas;

          return (
            <Pressable
              key={filter}
              style={({ hovered }: any) => [
                styles.filterPill,
                isActive && styles.filterPillActive,
                hovered && !isActive && styles.filterPillHover,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                {filter} ({count})
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Evidencias List */}
      {loading ? (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={GOLD} />
          <Text style={{ marginTop: 12, color: '#64748B', fontSize: 14 }}>Cargando tareas...</Text>
        </View>
      ) : filteredEvidencias.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="checkmark-done-circle-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No hay tareas en esta categoría</Text>
          <Text style={styles.emptySubtext}>¡Buen trabajo! Estás al día con tus asignaciones académicas.</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {filteredEvidencias.map((item) => {
            const badge = getStatusBadgeStyle(item.estado);

            return (
              <View key={item.id} style={styles.taskCard}>
                {/* Top Badge & Subject */}
                <View style={styles.taskHeader}>
                  <View style={styles.subjectBadge}>
                    <Ionicons name="book-outline" size={13} color={NAVY} style={{ marginRight: 5 }} />
                    <Text style={styles.subjectBadgeText}>{item.materia}</Text>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Ionicons name={badge.icon} size={14} color={badge.text} style={{ marginRight: 4 }} />
                    <Text style={[styles.statusBadgeText, { color: badge.text }]}>{item.estado}</Text>
                  </View>
                </View>

                {/* Title and Instructor */}
                <Text style={styles.taskTitle}>{item.titulo}</Text>
                <View style={styles.instructorRow}>
                  <Ionicons name="person-outline" size={14} color="#64748B" style={{ marginRight: 5 }} />
                  <Text style={styles.instructorText}>Instructor: {item.instructor}</Text>
                </View>

                {/* Description */}
                <Text style={styles.taskDesc}>{item.descripcion}</Text>

                {/* Meta details */}
                <View style={styles.metaBox}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={14} color={GOLD} style={{ marginRight: 6 }} />
                    <Text style={styles.metaLabel}>Límite: </Text>
                    <Text style={styles.metaValue}>{item.fechaLimite}</Text>
                  </View>

                  {item.formatoEntrega ? (
                    <View style={styles.metaItem}>
                      <Ionicons name="document-attach-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
                      <Text style={styles.metaLabel}>Formato: </Text>
                      <Text style={styles.metaValue}>{item.formatoEntrega}</Text>
                    </View>
                  ) : null}

                  {item.ponderacion ? (
                    <View style={styles.metaItem}>
                      <Ionicons name="ribbon-outline" size={14} color={GOLD} style={{ marginRight: 6 }} />
                      <Text style={styles.metaLabel}>Ponderación: </Text>
                      <Text style={[styles.metaValue, { fontWeight: '700', color: NAVY }]}>
                        {item.ponderacion}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Card Footer Actions */}
                <View style={styles.cardFooter}>
                  {item.estado === 'Calificada' ? (
                    <View style={styles.calificadaRow}>
                      <View style={styles.notaPill}>
                        <Ionicons name="star" size={14} color="#047857" style={{ marginRight: 4 }} />
                        <Text style={styles.notaPillText}>Nota: {item.entrega?.nota?.toFixed(1) || '4.6'} / 5.0</Text>
                      </View>

                      <Pressable
                        style={({ hovered }: any) => [styles.feedbackBtn, hovered && styles.feedbackBtnHover]}
                        onPress={() => handleOpenFeedback(item)}
                      >
                        <Ionicons name="chatbubble-ellipses-outline" size={14} color={GOLD} style={{ marginRight: 4 }} />
                        <Text style={styles.feedbackBtnText}>Ver Feedback del Instructor</Text>
                      </Pressable>
                    </View>
                  ) : item.estado === 'Entregada' ? (
                    <View style={styles.entregadaRow}>
                      <View style={styles.entregadaInfo}>
                        <Ionicons name="checkmark-circle" size={16} color="#2563EB" style={{ marginRight: 5 }} />
                        <Text style={styles.entregadaText}>Entregada ({item.entrega?.fechaEntrega || 'Reciente'})</Text>
                      </View>

                      <Pressable
                        style={({ hovered }: any) => [styles.editEntregaBtn, hovered && styles.editEntregaBtnHover]}
                        onPress={() => handleOpenEntrega(item)}
                      >
                        <Ionicons name="open-outline" size={14} color={NAVY} style={{ marginRight: 4 }} />
                        <Text style={styles.editEntregaBtnText}>Ver / Editar entrega</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable
                      style={({ hovered }: any) => [styles.entregarBtn, hovered && styles.entregarBtnHover]}
                      onPress={() => handleOpenEntrega(item)}
                    >
                      <Ionicons name="cloud-upload-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.entregarBtnText}>Subir Entrega</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Modal para Entregar Tarea */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, !isDesktop && styles.modalBoxMobile]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 8 }}>
                <View style={styles.modalIconWrap}>
                  <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle} numberOfLines={1}>Entregar Evidencia</Text>
                  <Text style={styles.modalSubtitle} numberOfLines={1}>
                    {activeEvidencia?.titulo}
                  </Text>
                </View>
              </View>
              <Pressable onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={true} keyboardShouldPersistTaps="handled">
              {submittedSuccess ? (
                <View style={styles.successBox}>
                  <Ionicons name="checkmark-circle" size={48} color="#059669" />
                  <Text style={styles.successTitle}>¡Entrega registrada y calificada!</Text>
                  <Text style={styles.successSubtext}>
                    Tu evidencia ha sido calificada con retroalimentación y nota asignada.
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.instructionNotice}>
                    <Ionicons name="information-circle-outline" size={18} color={NAVY} style={{ marginRight: 8, marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.instructionNoticeTitle}>Indicación del Instructor:</Text>
                      <Text style={styles.instructionNoticeText}>{activeEvidencia?.descripcion}</Text>
                    </View>
                  </View>

                  <Text style={styles.modalFieldLabel}>ENLACE AL ARCHIVO O REPOSITORIO (Drive, GitHub, OneDrive, etc.):</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={archivoUrl}
                    onChangeText={setArchivoUrl}
                    placeholder="https://drive.google.com/file/... o https://github.com/..."
                    placeholderTextColor="#94A3B8"
                  />

                  <Text style={styles.modalFieldLabel}>COMENTARIOS ADICIONALES PARA EL INSTRUCTOR:</Text>
                  <TextInput
                    style={[styles.modalInput, styles.modalTextArea]}
                    value={comentario}
                    onChangeText={setComentario}
                    placeholder="Escribe notas sobre tu entrega, dudas resueltas o aclaraciones..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={3}
                  />
                </>
              )}
            </ScrollView>

            {!submittedSuccess && (
              <View style={styles.modalFooter}>
                <Pressable
                  style={({ hovered }: any) => [styles.cancelBtn, hovered && styles.cancelBtnHover]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </Pressable>

                <Pressable
                  style={({ hovered }: any) => [styles.submitBtn, hovered && styles.submitBtnHover]}
                  onPress={handleConfirmEntrega}
                  disabled={submitting}
                >
                  {submitting ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={styles.submitBtnText}>Enviando...</Text>
                    </View>
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.submitBtnText}>Confirmar y Enviar</Text>
                    </>
                  )}
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal para Ver Feedback */}
      <Modal visible={feedbackModalVisible} transparent animationType="fade" onRequestClose={() => setFeedbackModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, !isDesktop && styles.modalBoxMobile]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 8 }}>
                <View style={[styles.modalIconWrap, { backgroundColor: '#047857' }]}>
                  <Ionicons name="star" size={18} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle} numberOfLines={1}>Retroalimentación Docente</Text>
                  <Text style={styles.modalSubtitle} numberOfLines={1}>
                    {activeEvidencia?.titulo}
                  </Text>
                </View>
              </View>
              <Pressable onPress={() => setFeedbackModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={true}>
              {(() => {
                const notaNum = activeEvidencia?.entrega?.nota !== undefined
                  ? Number(activeEvidencia.entrega.nota)
                  : 4.5;
                const isApproved = notaNum >= 3.5;

                return (
                  <View style={[
                    styles.feedbackScoreBox,
                    !isApproved && { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }
                  ]}>
                    <Text style={[
                      styles.feedbackScoreLabel,
                      !isApproved && { color: '#B91C1C' }
                    ]}>CALIFICACIÓN FINAL:</Text>
                    <Text style={[
                      styles.feedbackScoreValue,
                      !isApproved && { color: '#DC2626' }
                    ]}>
                      {notaNum.toFixed(1)} / 5.0
                    </Text>
                    {isApproved ? (
                      <Text style={[styles.feedbackScoreStatus, { color: '#047857' }]}>
                        ✓ Competencia Aprobada (SENA)
                      </Text>
                    ) : (
                      <Text style={[styles.feedbackScoreStatus, { color: '#B91C1C' }]}>
                        ✗ No Aprobada - Requiere Corrección
                      </Text>
                    )}
                  </View>
                );
              })()}

              <View style={styles.feedbackTextBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 }}>
                  <Ionicons name="sparkles" size={16} color={GOLD} />
                  <Text style={styles.feedbackTextTitle}>
                    Retroalimentación {activeEvidencia?.instructor ? `(${activeEvidencia.instructor})` : 'del Instructor'}:
                  </Text>
                </View>
                <Text style={styles.feedbackTextBody}>
                  {activeEvidencia?.entrega?.feedback ||
                    activeEvidencia?.entrega?.comentario ||
                    'Evaluación completada para la evidencia.'}
                </Text>
              </View>

              {activeEvidencia?.entrega?.archivoUrl ? (
                <View style={styles.submissionSummary}>
                  <Ionicons name="link-outline" size={16} color={NAVY} style={{ marginRight: 6 }} />
                  <Text style={styles.submissionSummaryLabel}>Entrega enviada: </Text>
                  <Text style={styles.submissionSummaryLink} numberOfLines={1}>
                    {activeEvidencia.entrega.archivoUrl}
                  </Text>
                </View>
              ) : null}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                style={({ hovered }: any) => [styles.submitBtn, hovered && styles.submitBtnHover]}
                onPress={() => setFeedbackModalVisible(false)}
              >
                <Text style={styles.submitBtnText}>Cerrar</Text>
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
  content: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 50,
  },
  header: {
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: NAVY,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  // Summary Metrics
  summaryContainer: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  summaryContainerMobile: {
    flexDirection: 'column',
  },
  summaryCard: {
    flex: 1,
    minWidth: 130,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#D0D8E4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: '300',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 12,
    color: '#94A3B8',
  },
  // Filter tabs
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D0D8E4',
  },
  filterPillHover: {
    borderColor: GOLD,
  },
  filterPillActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Task Card
  listContainer: {
    gap: 16,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#D0D8E4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 16, 60, 0.08)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  subjectBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: NAVY,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: NAVY,
    lineHeight: 24,
    marginBottom: 4,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  instructorText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  taskDesc: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 21,
    marginBottom: 14,
  },
  metaBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    gap: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 12,
    color: '#334155',
  },
  cardFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  entregarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NAVY,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  entregarBtnHover: {
    backgroundColor: '#1E1B58',
  },
  entregarBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  calificadaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  notaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  notaPillText: {
    color: '#047857',
    fontSize: 13,
    fontWeight: '700',
  },
  feedbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(207, 162, 53, 0.12)',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  feedbackBtnHover: {
    backgroundColor: 'rgba(207, 162, 53, 0.22)',
  },
  feedbackBtnText: {
    color: GOLD,
    fontSize: 13,
    fontWeight: '700',
  },
  entregadaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  entregadaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entregadaText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '600',
  },
  editEntregaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  editEntregaBtnHover: {
    backgroundColor: '#E2E8F0',
  },
  editEntregaBtnText: {
    color: NAVY,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D0D8E4',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: NAVY,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    ...Platform.select({
      web: {
        position: 'fixed' as any,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      },
    }),
  },
  modalBox: {
    width: '100%',
    maxWidth: 580,
    maxHeight: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 24,
  },
  modalBoxMobile: {
    width: '95%',
    maxWidth: '95%',
    maxHeight: '92%',
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  modalIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: NAVY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: NAVY,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalBody: {
    padding: 20,
    gap: 12,
  },
  instructionNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: NAVY,
  },
  instructionNoticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: NAVY,
    marginBottom: 2,
  },
  instructionNoticeText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  modalFieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginTop: 4,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#D0D8E4',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: NAVY,
  },
  modalTextArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    flexShrink: 0,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D0D8E4',
  },
  cancelBtnHover: {
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NAVY,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  submitBtnHover: {
    backgroundColor: '#1E1B58',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  successBox: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#047857',
  },
  successSubtext: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  feedbackScoreBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 4,
  },
  feedbackScoreLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
    letterSpacing: 0.8,
  },
  feedbackScoreValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#047857',
  },
  feedbackScoreStatus: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '600',
  },
  feedbackTextBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  feedbackTextTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: NAVY,
  },
  feedbackTextBody: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  submissionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  submissionSummaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: NAVY,
  },
  submissionSummaryLink: {
    fontSize: 12,
    color: '#2563EB',
    flex: 1,
  },
});
