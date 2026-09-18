import React, { useState, useEffect, useCallback } from 'react';
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
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { evidenciasService, EvidenciaItem } from '../../services/evidenciasService';
import { fichasService, Ficha } from '../../services/fichasService';

const NAVY = '#0F1026';
const GOLD = '#D4AF37';
const BG_PAGE = '#F8FAFC';

export default function ActividadesInstructorScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [evidencias, setEvidencias] = useState<EvidenciaItem[]>([]);
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [selectedFichaId, setSelectedFichaId] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modal para Crear Nueva Actividad
  const [modalCreateVisible, setModalCreateVisible] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fichaId, setFichaId] = useState('');
  const [fechaLimite, setFechaLimite] = useState('2026-09-30T23:59:00.000Z');
  const [ponderacion, setPonderacion] = useState('25% del Trimestre');
  const [formatoEntrega, setFormatoEntrega] = useState('Repositorio GitHub / Archivo PDF');
  const [creating, setCreating] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [temaIa, setTemaIa] = useState('');

  // Modal para Ver Entregas de una Actividad
  const [modalEntregasVisible, setModalEntregasVisible] = useState(false);
  const [activeEvidencia, setActiveEvidencia] = useState<EvidenciaItem | null>(null);
  const [entregas, setEntregas] = useState<any[]>([]);
  const [loadingEntregas, setLoadingEntregas] = useState(false);

  // Modal para ver feedback de una entrega específica
  const [selectedEntregaFeedback, setSelectedEntregaFeedback] = useState<any | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [evidenciasData, fichasData] = await Promise.all([
        evidenciasService.getEvidenciasInstructor(),
        fichasService.getFichas(),
      ]);
      setEvidencias(evidenciasData);
      setFichas(fichasData);
      if (fichasData.length > 0 && !fichaId) {
        setFichaId(fichasData[0].id);
      }
    } catch (e) {
      console.error('Error cargando actividades:', e);
    }
  }, [fichaId]);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleOpenCreateModal = () => {
    setTitulo('');
    setDescripcion('');
    setTemaIa('');
    if (fichas.length > 0 && !fichaId) {
      setFichaId(fichas[0].id);
    }
    setModalCreateVisible(true);
  };

  const handleGenerarConIa = async () => {
    const tema = temaIa.trim() || titulo.trim();
    if (!tema) {
      Alert.alert('Tema requerido', 'Ingresa un tema o título para generar las indicaciones.');
      return;
    }

    setAiGenerating(true);
    const propuesta = await evidenciasService.generarPropuestaIa(tema);
    if (propuesta) {
      if (!titulo) setTitulo(propuesta.titulo);
      setDescripcion(
        `${propuesta.descripcion}\n\n### Rúbrica y Criterios de Evaluación:\n${propuesta.criterios}`
      );
      if (propuesta.formatoSugerido) {
        setFormatoEntrega(propuesta.formatoSugerido);
      }
    }
    setAiGenerating(false);
  };

  const handleCreateEvidencia = async () => {
    if (!titulo.trim()) {
      Alert.alert('Error', 'Por favor ingresa el título de la actividad.');
      return;
    }
    if (!descripcion.trim()) {
      Alert.alert('Error', 'Por favor ingresa las indicaciones de la actividad.');
      return;
    }

    const fichaSeleccionada = fichaId || (fichas[0]?.id || '');
    if (!fichaSeleccionada) {
      Alert.alert('Ficha requerida', 'No se encontró una ficha académica para asignar la actividad.');
      return;
    }

    setCreating(true);
    try {
      await evidenciasService.crearEvidencia({
        titulo,
        descripcion,
        fechaLimite,
        fichaId: fichaSeleccionada,
        ponderacion,
        formatoEntrega,
      });

      // Recargar lista real de actividades desde la base de datos
      await loadData();
      setCreating(false);
      setModalCreateVisible(false);
    } catch (err: any) {
      setCreating(false);
      Alert.alert('Error', err.message || 'No se pudo crear la actividad en la base de datos');
    }
  };

  const handleDeleteEvidencia = async (id: string) => {
    try {
      await evidenciasService.eliminarEvidencia(id);
      await loadData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo eliminar la evidencia');
    }
  };

  const handleOpenEntregas = async (item: EvidenciaItem) => {
    setActiveEvidencia(item);
    setLoadingEntregas(true);
    setModalEntregasVisible(true);
    const data = await evidenciasService.getEntregas(item.id);
    setEntregas(data || []);
    setLoadingEntregas(false);
  };

  const totalActividades = evidencias.length;
  const totalFichas = fichas.length || 2;

  const pad = isDesktop ? 24 : 14;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { padding: pad, paddingTop: isDesktop ? 32 : 20 }]}
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
      {/* Header Principal */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>Gestión de Actividades y Evidencias</Text>
          <Text style={styles.pageSubtitle}>
            Crea tareas, asigna fichas y consulta las entregas calificadas con retroalimentación formativa.
          </Text>
        </View>

        <Pressable
          style={({ hovered }: any) => [styles.createBtn, hovered && styles.createBtnHover]}
          onPress={handleOpenCreateModal}
        >
          <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.createBtnText}>Nueva Actividad</Text>
        </Pressable>
      </View>

      {/* Tarjetas de Métricas */}
      <View style={[styles.summaryContainer, !isDesktop && styles.summaryContainerMobile]}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryIconWrap}>
            <Ionicons name="folder-open-outline" size={20} color={GOLD} />
          </View>
          <View>
            <Text style={styles.summaryLabel}>ACTIVIDADES PUBLICADAS</Text>
            <Text style={styles.summaryValue}>{totalActividades}</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIconWrap}>
            <Ionicons name="people-outline" size={20} color="#2563EB" />
          </View>
          <View>
            <Text style={styles.summaryLabel}>FICHAS CON ACTIVIDADES</Text>
            <Text style={[styles.summaryValue, { color: '#2563EB' }]}>{totalFichas}</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIconWrap}>
            <Ionicons name="ribbon-outline" size={20} color="#059669" />
          </View>
          <View>
            <Text style={styles.summaryLabel}>RÚBRICA SOBRE 5.0</Text>
            <Text style={[styles.summaryValue, { color: '#059669' }]}>Oficial</Text>
          </View>
        </View>
      </View>

      {/* Lista de Actividades Publicadas */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Actividades Vigentes ({evidencias.length})</Text>
      </View>

      {loading ? (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={GOLD} />
          <Text style={{ marginTop: 12, color: '#64748B' }}>Cargando actividades...</Text>
        </View>
      ) : evidencias.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="document-text-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No tienes actividades creadas aún</Text>
          <Text style={styles.emptySubtext}>Haz clic en "Nueva Actividad" para publicar la primera evidencia para tus aprendices.</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {evidencias.map((item) => (
            <View key={item.id} style={styles.activityCard}>
              <View style={styles.cardTopRow}>
                <View style={styles.badgeFicha}>
                  <Ionicons name="school-outline" size={13} color={NAVY} style={{ marginRight: 6 }} />
                  <Text style={styles.badgeFichaText}>{item.materia || 'ADSO'}</Text>
                </View>

                <View style={styles.statusPill}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusPillText}>Activa</Text>
                </View>
              </View>

              <Text style={styles.activityTitle}>{item.titulo}</Text>

              {/* Indicación del Instructor */}
              <View style={styles.descriptionBox}>
                <Text style={styles.descriptionLabel}>Indicación / Enunciado:</Text>
                <Text style={styles.descriptionText} numberOfLines={3}>
                  {item.descripcion}
                </Text>
              </View>

              {/* Meta items */}
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
                  <Text style={styles.metaText}>Límite: {item.fechaLimite}</Text>
                </View>

                <View style={styles.metaItem}>
                  <Ionicons name="ribbon-outline" size={14} color={GOLD} style={{ marginRight: 6 }} />
                  <Text style={styles.metaText}>Ponderación: {item.ponderacion || '25%'}</Text>
                </View>

                <View style={styles.metaItem}>
                  <Ionicons name="document-attach-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
                  <Text style={styles.metaText}>Formato: {item.formatoEntrega || 'Enlace / Archivo'}</Text>
                </View>
              </View>

              {/* Card Footer Actions */}
              <View style={styles.cardFooter}>
                <Pressable
                  style={({ hovered }: any) => [styles.viewEntregasBtn, hovered && styles.viewEntregasBtnHover]}
                  onPress={() => handleOpenEntregas(item)}
                >
                  <Ionicons name="people" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.viewEntregasBtnText}>Ver Entregas de Aprendices</Text>
                </Pressable>

                <Pressable
                  style={({ hovered }: any) => [styles.deleteBtn, hovered && styles.deleteBtnHover]}
                  onPress={() => handleDeleteEvidencia(item.id)}
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* MODAL 1: CREAR NUEVA ACTIVIDAD */}
      <Modal visible={modalCreateVisible} transparent animationType="fade" onRequestClose={() => setModalCreateVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, !isDesktop && styles.modalBoxMobile]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={styles.modalIconWrap}>
                  <Ionicons name="add-circle" size={18} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Crear Nueva Actividad / Evidencia</Text>
                  <Text style={styles.modalSubtitle}>Las entregas de los aprendices serán valoradas con base en tus indicaciones y rúbrica.</Text>
                </View>
              </View>
              <Pressable onPress={() => setModalCreateVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 500 }} showsVerticalScrollIndicator={false}>
              <View style={styles.modalBody}>
                {/* Generador de Rúbricas e Indicaciones */}
                <View style={styles.aiHelperBox}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Ionicons name="create-outline" size={16} color={GOLD} />
                    <Text style={styles.aiHelperTitle}>Generador de Indicaciones y Rúbricas</Text>
                  </View>
                  <Text style={styles.aiHelperSubtext}>
                    Escribe el tema de la evidencia para estructurar las indicaciones técnicas y los criterios de evaluación sobre 5.0:
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                    <TextInput
                      style={[styles.modalInput, { flex: 1, marginBottom: 0 }]}
                      placeholder="Ej: Triggers y Procedimientos en PostgreSQL"
                      value={temaIa}
                      onChangeText={setTemaIa}
                    />
                    <Pressable
                      style={[styles.aiBtn, aiGenerating && { opacity: 0.6 }]}
                      onPress={handleGenerarConIa}
                      disabled={aiGenerating}
                    >
                      {aiGenerating ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons name="clipboard-outline" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                          <Text style={styles.aiBtnText}>Generar Rúbrica</Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                </View>

                {/* Título */}
                <Text style={styles.fieldLabel}>TÍTULO DE LA ACTIVIDAD *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ej: Taller 3: Procedimientos Almacenados y Triggers"
                  value={titulo}
                  onChangeText={setTitulo}
                />

                {/* Selección de Ficha */}
                <Text style={styles.fieldLabel}>FICHA ASIGNADA *</Text>
                <View style={styles.fichasChipsRow}>
                  {fichas.length > 0 ? (
                    fichas.map((f) => (
                      <Pressable
                        key={f.id}
                        style={[styles.fichaChip, fichaId === f.id && styles.fichaChipActive]}
                        onPress={() => setFichaId(f.id)}
                      >
                        <Text style={[styles.fichaChipText, fichaId === f.id && styles.fichaChipTextActive]}>
                          Ficha {f.numero || f.codigo} - {f.programaNombre || 'ADSO'}
                        </Text>
                      </Pressable>
                    ))
                  ) : (
                    <Text style={{ color: '#64748B', fontSize: 13 }}>ADSO - Ficha 2845670 (Por defecto)</Text>
                  )}
                </View>

                {/* Indicaciones del Instructor */}
                <Text style={styles.fieldLabel}>INDICACIONES Y CRITERIOS PARA EL APRENDIZ *</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  placeholder="Detalla qué debe realizar el aprendiz, qué formato entregar y qué criterios se evaluarán..."
                  value={descripcion}
                  onChangeText={setDescripcion}
                  multiline
                  numberOfLines={5}
                />

                {/* Formato y Ponderación en Fila */}
                <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>FORMATO DE ENTREGA</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={formatoEntrega}
                      onChangeText={setFormatoEntrega}
                      placeholder="Ej: Repositorio GitHub / PDF"
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>PONDERACIÓN</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={ponderacion}
                      onChangeText={setPonderacion}
                      placeholder="Ej: 25% del Trimestre"
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable style={styles.cancelBtn} onPress={() => setModalCreateVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </Pressable>

              <Pressable style={styles.submitBtn} onPress={handleCreateEvidencia} disabled={creating}>
                {creating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.submitBtnText}>Publicar Actividad</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: VER ENTREGAS DE APRENDICES */}
      <Modal visible={modalEntregasVisible} transparent animationType="fade" onRequestClose={() => setModalEntregasVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, !isDesktop && styles.modalBoxMobile, { maxWidth: 720 }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[styles.modalIconWrap, { backgroundColor: '#2563EB' }]}>
                  <Ionicons name="people" size={18} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Entregas de Aprendices</Text>
                  <Text style={styles.modalSubtitle} numberOfLines={1}>{activeEvidencia?.titulo}</Text>
                </View>
              </View>
              <Pressable onPress={() => setModalEntregasVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 460 }} showsVerticalScrollIndicator={false}>
              <View style={styles.modalBody}>
                {loadingEntregas ? (
                  <ActivityIndicator size="large" color={GOLD} style={{ padding: 40 }} />
                ) : entregas.length === 0 ? (
                  <View style={{ padding: 30, alignItems: 'center' }}>
                    <Ionicons name="mail-unread-outline" size={40} color="#94A3B8" />
                    <Text style={{ marginTop: 10, color: '#64748B', fontWeight: '600' }}>Aún no hay entregas de aprendices para esta actividad.</Text>
                  </View>
                ) : (
                  entregas.map((e, idx) => (
                    <View key={e.id || idx} style={styles.entregaRowCard}>
                      <View style={styles.entregaHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Ionicons name="person-circle" size={28} color={NAVY} />
                          <View>
                            <Text style={styles.aprendizName}>
                              {e.aprendiz?.firstName} {e.aprendiz?.lastName || ''}
                            </Text>
                            <Text style={styles.aprendizEmail}>{e.aprendiz?.email}</Text>
                          </View>
                        </View>

                        {/* Calificación obtenida */}
                        <View style={styles.scorePill}>
                          <Ionicons name="star" size={14} color="#047857" style={{ marginRight: 4 }} />
                          <Text style={styles.scorePillText}>
                            {e.nota ? Number(e.nota).toFixed(1) : 'Pendiente'} / 5.0
                          </Text>
                        </View>
                      </View>

                      {e.comentario ? (
                        <Text style={styles.comentarioText}>
                          <Text style={{ fontWeight: '700', color: NAVY }}>Comentario del estudiante: </Text>
                          {e.comentario}
                        </Text>
                      ) : null}

                      {e.archivoUrl ? (
                        <View style={styles.linkWrap}>
                          <Ionicons name="link-outline" size={14} color="#2563EB" style={{ marginRight: 4 }} />
                          <Text style={styles.linkText} numberOfLines={1}>{e.archivoUrl}</Text>
                        </View>
                      ) : null}

                      {/* Botón para ver retroalimentación de la entrega */}
                      {e.feedback ? (
                        <Pressable
                          style={styles.viewFeedbackBtn}
                          onPress={() => setSelectedEntregaFeedback(e)}
                        >
                          <Ionicons name="document-text-outline" size={14} color={GOLD} style={{ marginRight: 6 }} />
                          <Text style={styles.viewFeedbackBtnText}>Ver Informe de Evaluación</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  ))
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable style={styles.cancelBtn} onPress={() => setModalEntregasVisible(false)}>
                <Text style={styles.cancelBtnText}>Cerrar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: VER REPORTE DE EVALUACIÓN DE UNA ENTREGA */}
      {selectedEntregaFeedback && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setSelectedEntregaFeedback(null)}>
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalBox, !isDesktop && styles.modalBoxMobile]}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[styles.modalIconWrap, { backgroundColor: '#047857' }]}>
                    <Ionicons name="document-text" size={18} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalTitle}>Informe de Evaluación - {selectedEntregaFeedback.aprendiz?.firstName}</Text>
                    <Text style={styles.modalSubtitle}>Calificación: {Number(selectedEntregaFeedback.nota).toFixed(1)} / 5.0</Text>
                  </View>
                </View>
                <Pressable onPress={() => setSelectedEntregaFeedback(null)} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={20} color="#64748B" />
                </Pressable>
              </View>

              <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                <View style={styles.modalBody}>
                  <View style={styles.feedbackDetailBox}>
                    <Text style={styles.feedbackDetailText}>{selectedEntregaFeedback.feedback}</Text>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <Pressable style={styles.submitBtn} onPress={() => setSelectedEntregaFeedback(null)}>
                  <Text style={styles.submitBtnText}>Entendido</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_PAGE,
  },
  content: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 16,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: NAVY,
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#64748B',
    maxWidth: 700,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NAVY,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  createBtnHover: {
    backgroundColor: '#1E1B4B',
  },
  createBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 28,
  },
  summaryContainerMobile: {
    flexDirection: 'column',
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '800',
    color: NAVY,
    marginTop: 2,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: NAVY,
  },
  listContainer: {
    gap: 16,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeFicha: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeFichaText: {
    fontSize: 12,
    fontWeight: '700',
    color: NAVY,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#047857',
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: NAVY,
    marginBottom: 10,
  },
  descriptionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: GOLD,
  },
  descriptionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  descriptionText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  viewEntregasBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NAVY,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewEntregasBtnHover: {
    backgroundColor: '#1E1B4B',
  },
  viewEntregasBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
  },
  deleteBtnHover: {
    backgroundColor: '#FECACA',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    textAlign: 'center',
    marginTop: 4,
  },

  // Modales
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 16, 38, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 620,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
  },
  modalBoxMobile: {
    maxWidth: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: NAVY,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    maxWidth: 480,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  aiHelperBox: {
    backgroundColor: '#FEFCE8',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FEF08A',
    marginBottom: 16,
  },
  aiHelperTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#854D0E',
  },
  aiHelperSubtext: {
    fontSize: 12,
    color: '#713F12',
    lineHeight: 18,
  },
  aiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CA8A04',
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: 'center',
  },
  aiBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: NAVY,
    marginBottom: 14,
  },
  modalTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  fichasChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  fichaChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fichaChipActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  fichaChipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  fichaChipTextActive: {
    color: '#FFFFFF',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NAVY,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Lista de entregas en modal
  entregaRowCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  entregaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aprendizName: {
    fontSize: 14,
    fontWeight: '700',
    color: NAVY,
  },
  aprendizEmail: {
    fontSize: 11,
    color: '#64748B',
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scorePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
  },
  comentarioText: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 6,
    lineHeight: 18,
  },
  linkWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  linkText: {
    fontSize: 12,
    color: '#2563EB',
    textDecorationLine: 'underline',
  },
  viewFeedbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: GOLD,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  viewFeedbackBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: NAVY,
  },
  feedbackDetailBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
  },
  feedbackDetailText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 22,
  },
});

