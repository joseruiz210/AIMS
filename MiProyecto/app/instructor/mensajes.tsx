import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { comunicadosService, ComunicadoItem } from '../../services/comunicadosService';
import { fichasService, Ficha } from '../../services/fichasService';
import { authService } from '../../services/authService';

const NAVY = '#0F1026';
const GOLD = '#D4AF37';
const GOLD_LIGHT = 'rgba(212, 175, 55, 0.14)';
const BG_PAGE = '#F8FAFC';

export default function MensajesInstructorScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 850;

  // Pestañas:
  // En Desktop: 'publicar' (muestra Formulario a la izquierda e Historial a la derecha) | 'recibidos'
  // En Móvil: 'publicar' (Formulario) | 'emitidos' (Historial) | 'recibidos' (Bandeja)
  const [activeTab, setActiveTab] = useState<'publicar' | 'emitidos' | 'recibidos'>('publicar');

  // Estados de datos
  const [recibidos, setRecibidos] = useState<ComunicadoItem[]>([]);
  const [emitidos, setEmitidos] = useState<ComunicadoItem[]>([]);
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [userName, setUserName] = useState('Instructor');

  // Formulario de emisión
  const [selectedFicha, setSelectedFicha] = useState<string>('TODAS');
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formFeedback, setFormFeedback] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Cargas y refresco
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setErrorMsg(null);
    try {
      // 1. Obtener usuario de la sesión para la firma del comunicado
      try {
        const { user } = await authService.checkSession();
        if (user) {
          const raw = user as any;
          const full = raw.firstName
            ? `${raw.firstName} ${raw.lastName || ''}`.trim()
            : user.nombre || 'Instructor SENA';
          setUserName(full);
        }
      } catch {}

      // 2. Cargar comunicados generales y fichas del instructor en paralelo
      const [todosComunicados, listaFichas] = await Promise.all([
        comunicadosService.getComunicados(),
        fichasService.getFichas(),
      ]);

      setFichas(listaFichas);

      // Separar emitidos por el instructor vs recibidos de coordinación
      const misEmitidos = todosComunicados.filter(
        (c) => c.tipo === 'FICHA' || (c.autor && c.autor.toLowerCase().includes('instructor'))
      );
      const misRecibidos = todosComunicados.filter(
        (c) => c.tipo !== 'FICHA' && (!c.autor || !c.autor.toLowerCase().includes('instructor'))
      );

      setEmitidos(misEmitidos);
      setRecibidos(misRecibidos.length > 0 ? misRecibidos : todosComunicados);
    } catch (error: any) {
      console.error('Error cargando datos de mensajería:', error);
      setErrorMsg('No se pudieron sincronizar los comunicados. Verifica tu conexión.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
  }, [loadData]);

  const handlePublicar = async () => {
    setFormError(null);
    setFormFeedback(null);

    if (!asunto.trim()) {
      setFormError('Por favor ingresa el asunto del comunicado.');
      return;
    }
    if (!mensaje.trim()) {
      setFormError('Por favor escribe el mensaje para los aprendices.');
      return;
    }

    setIsSubmitting(true);
    try {
      let destinatarioTexto = 'Todas mis fichas';
      let fichaIdTarget: string | undefined = undefined;

      if (selectedFicha !== 'TODAS') {
        const targetFicha = fichas.find((f) => f.id === selectedFicha || f.numero === selectedFicha);
        destinatarioTexto = targetFicha
          ? `Ficha ${targetFicha.numero} (${targetFicha.programaNombre || 'Formación'})`
          : `Ficha ${selectedFicha}`;
        fichaIdTarget = selectedFicha;
      }

      const nuevo = await comunicadosService.crearComunicado({
        titulo: asunto.trim(),
        mensaje: mensaje.trim(),
        destinatario: destinatarioTexto,
        fichaId: fichaIdTarget,
        autor: `Instructor ${userName}`,
        tipo: 'FICHA',
      });

      // Actualizar lista de emitidos inmediatamente
      setEmitidos((prev) => [nuevo, ...prev]);
      setAsunto('');
      setMensaje('');
      setFormFeedback(`¡Comunicado publicado con éxito para ${destinatarioTexto}!`);

      // Ocultar banner de éxito después de 5 segundos
      setTimeout(() => {
        setFormFeedback(null);
      }, 5000);
    } catch (error: any) {
      setFormError('Ocurrió un error al publicar el comunicado. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarcarLeido = async (id: string) => {
    try {
      await comunicadosService.marcarLeido(id);
      setRecibidos((prev) =>
        prev.map((m) => (m.id === id ? { ...m, leidos: (m.leidos || 0) + 1 } : m))
      );
    } catch (error) {
      console.error('Error marcando comunicado como leído:', error);
    }
  };

  const pad = isDesktop ? 24 : 14;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GOLD} />
        <Text style={styles.loadingText}>Cargando centro de comunicados...</Text>
      </View>
    );
  }

  // Visibilidad de secciones según dispositivo y pestaña activa
  const showForm = activeTab === 'publicar';
  const showEmitidos = activeTab === 'emitidos' || (isDesktop && activeTab === 'publicar');
  const showRecibidos = activeTab === 'recibidos';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { padding: pad }]}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={GOLD}
          colors={[GOLD, NAVY]}
        />
      }
    >
      {/* Encabezado Superior */}
      <View style={styles.topHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>Mensajería y Comunicados</Text>
          <Text style={styles.pageSubtitle}>
            Emite avisos formativos a tus aprendices y consulta comunicados institucionales.
          </Text>
        </View>

        <Pressable style={styles.refreshBtn} onPress={onRefresh}>
          <Ionicons name="reload-outline" size={16} color={NAVY} />
          <Text style={styles.refreshBtnText}>Actualizar</Text>
        </Pressable>
      </View>

      {/* Error de Conexión si existe */}
      {errorMsg && (
        <View style={styles.errorBanner}>
          <Ionicons name="cloud-offline-outline" size={20} color="#DC2626" />
          <Text style={styles.errorBannerText}>{errorMsg}</Text>
          <Pressable style={styles.retryBtn} onPress={loadData}>
            <Text style={styles.retryBtnText}>Reintentar</Text>
          </Pressable>
        </View>
      )}

      {/* Barra de Pestañas */}
      {isDesktop ? (
        // Barra Desktop (2 Pestañas amplias)
        <View style={styles.tabsWrapper}>
          <Pressable
            style={[styles.tabButton, activeTab !== 'recibidos' && styles.tabButtonActive]}
            onPress={() => setActiveTab('publicar')}
          >
            <Ionicons
              name={activeTab !== 'recibidos' ? 'megaphone' : 'megaphone-outline'}
              size={18}
              color={activeTab !== 'recibidos' ? '#FFFFFF' : '#475569'}
            />
            <Text
              style={[styles.tabButtonText, activeTab !== 'recibidos' && styles.tabButtonTextActive]}
            >
              Publicar y Emitidos
            </Text>
            {emitidos.length > 0 && (
              <View
                style={[
                  styles.tabCountBadge,
                  activeTab !== 'recibidos' ? styles.tabCountBadgeActive : styles.tabCountBadgeInactive,
                ]}
              >
                <Text
                  style={[
                    styles.tabCountText,
                    activeTab !== 'recibidos' ? styles.tabCountTextActive : styles.tabCountTextInactive,
                  ]}
                >
                  {emitidos.length}
                </Text>
              </View>
            )}
          </Pressable>

          <Pressable
            style={[styles.tabButton, activeTab === 'recibidos' && styles.tabButtonActive]}
            onPress={() => setActiveTab('recibidos')}
          >
            <Ionicons
              name={activeTab === 'recibidos' ? 'mail' : 'mail-outline'}
              size={18}
              color={activeTab === 'recibidos' ? '#FFFFFF' : '#475569'}
            />
            <Text
              style={[styles.tabButtonText, activeTab === 'recibidos' && styles.tabButtonTextActive]}
            >
              Bandeja de Entrada
            </Text>
            {recibidos.length > 0 && (
              <View
                style={[
                  styles.tabCountBadge,
                  activeTab === 'recibidos' ? styles.tabCountBadgeActive : styles.tabCountBadgeInactive,
                ]}
              >
                <Text
                  style={[
                    styles.tabCountText,
                    activeTab === 'recibidos' ? styles.tabCountTextActive : styles.tabCountTextInactive,
                  ]}
                >
                  {recibidos.length}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      ) : (
        // Barra Móvil (3 Pestañas dedicadas para máxima ergonomía táctil sin superposición)
        <View style={styles.tabsWrapper}>
          <Pressable
            style={[styles.tabButton, activeTab === 'publicar' && styles.tabButtonActive]}
            onPress={() => setActiveTab('publicar')}
          >
            <Ionicons
              name={activeTab === 'publicar' ? 'create' : 'create-outline'}
              size={16}
              color={activeTab === 'publicar' ? '#FFFFFF' : '#475569'}
            />
            <Text
              style={[styles.tabButtonText, activeTab === 'publicar' && styles.tabButtonTextActive]}
            >
              Redactar
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabButton, activeTab === 'emitidos' && styles.tabButtonActive]}
            onPress={() => setActiveTab('emitidos')}
          >
            <Ionicons
              name={activeTab === 'emitidos' ? 'paper-plane' : 'paper-plane-outline'}
              size={16}
              color={activeTab === 'emitidos' ? '#FFFFFF' : '#475569'}
            />
            <Text
              style={[styles.tabButtonText, activeTab === 'emitidos' && styles.tabButtonTextActive]}
            >
              Enviados ({emitidos.length})
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabButton, activeTab === 'recibidos' && styles.tabButtonActive]}
            onPress={() => setActiveTab('recibidos')}
          >
            <Ionicons
              name={activeTab === 'recibidos' ? 'mail' : 'mail-outline'}
              size={16}
              color={activeTab === 'recibidos' ? '#FFFFFF' : '#475569'}
            />
            <Text
              style={[styles.tabButtonText, activeTab === 'recibidos' && styles.tabButtonTextActive]}
            >
              Recibidos ({recibidos.length})
            </Text>
          </Pressable>
        </View>
      )}

      {/* CONTENEDOR PRINCIPAL: FORMULARIO E HISTORIAL */}
      {(showForm || showEmitidos) && (
        <View style={[styles.mainLayout, !isDesktop && styles.mainLayoutMobile]}>
          {/* SECCIÓN 1: FORMULARIO DE EMISIÓN */}
          {showForm && (
            <View style={[styles.formCard, isDesktop ? { flex: 1.2 } : { width: '100%' }]}>
              <View style={styles.formHeaderRow}>
                <View style={styles.formIconWrap}>
                  <Ionicons name="create-outline" size={20} color={NAVY} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.formCardTitle}>NUEVO COMUNICADO A FICHAS</Text>
                  <Text style={styles.formCardSubtitle}>Emite avisos oficiales a tus aprendices asignados</Text>
                </View>
              </View>

              {/* Banner de Éxito */}
              {formFeedback && (
                <View style={styles.successBanner}>
                  <Ionicons name="checkmark-circle" size={18} color="#059669" style={{ marginRight: 8 }} />
                  <Text style={styles.successText}>{formFeedback}</Text>
                  {!isDesktop && (
                    <Pressable
                      style={styles.viewSentBtn}
                      onPress={() => setActiveTab('emitidos')}
                    >
                      <Text style={styles.viewSentBtnText}>Ver enviados →</Text>
                    </Pressable>
                  )}
                </View>
              )}

              {/* Banner de Validación / Error */}
              {formError && (
                <View style={styles.errorInlineBanner}>
                  <Ionicons name="alert-circle-outline" size={18} color="#DC2626" style={{ marginRight: 8 }} />
                  <Text style={styles.errorInlineText}>{formError}</Text>
                </View>
              )}

              {/* Selector de Destinatario (Fichas Asignadas) */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>DESTINATARIO (SELECCIONA LA FICHA)</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.fichasScrollView}
                  contentContainerStyle={styles.fichasChipsRow}
                >
                  <Pressable
                    style={[
                      styles.fichaChip,
                      selectedFicha === 'TODAS' && styles.fichaChipActive,
                    ]}
                    onPress={() => setSelectedFicha('TODAS')}
                  >
                    <Ionicons
                      name={selectedFicha === 'TODAS' ? 'people' : 'people-outline'}
                      size={15}
                      color={selectedFicha === 'TODAS' ? '#FFFFFF' : '#475569'}
                    />
                    <Text
                      style={[
                        styles.fichaChipText,
                        selectedFicha === 'TODAS' && styles.fichaChipTextActive,
                      ]}
                    >
                      Todas mis fichas
                    </Text>
                  </Pressable>

                  {fichas.map((f) => {
                    const isSelected = selectedFicha === f.id || selectedFicha === f.numero;
                    return (
                      <Pressable
                        key={f.id}
                        style={[styles.fichaChip, isSelected && styles.fichaChipActive]}
                        onPress={() => setSelectedFicha(f.numero || f.id)}
                      >
                        <Ionicons
                          name={isSelected ? 'school' : 'school-outline'}
                          size={15}
                          color={isSelected ? '#FFFFFF' : '#475569'}
                        />
                        <Text
                          style={[
                            styles.fichaChipText,
                            isSelected && styles.fichaChipTextActive,
                          ]}
                        >
                          Ficha {f.numero}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
                <Text style={styles.fieldHelper}>
                  {selectedFicha === 'TODAS'
                    ? 'Este comunicado llegará a todos los aprendices de tus fichas asignadas.'
                    : `Destinado exclusivamente a los aprendices matriculados en la Ficha ${selectedFicha}.`}
                </Text>
              </View>

              {/* Campo Asunto */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>ASUNTO / TÍTULO</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: Recordatorio de entrega fase 3, Cambio de ambiente..."
                    placeholderTextColor="#94A3B8"
                    value={asunto}
                    onChangeText={(val) => {
                      setAsunto(val);
                      if (formError) setFormError(null);
                    }}
                    maxLength={120}
                  />
                </View>
              </View>

              {/* Campo Mensaje */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>MENSAJE DEL COMUNICADO</Text>
                <View style={[styles.inputWrapper, { minHeight: 110, paddingVertical: 8, alignItems: 'flex-start' }]}>
                  <TextInput
                    style={[styles.textInput, { width: '100%', minHeight: 94, textAlignVertical: 'top' }]}
                    placeholder="Escribe aquí las instrucciones claras, fechas límites o novedades formativas..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    value={mensaje}
                    onChangeText={(val) => {
                      setMensaje(val);
                      if (formError) setFormError(null);
                    }}
                  />
                </View>
              </View>

              {/* Botón de Publicación */}
              <Pressable
                style={({ hovered }: any) => [
                  styles.publishBtn,
                  isSubmitting && styles.publishBtnDisabled,
                  hovered && !isSubmitting && styles.publishBtnHover,
                ]}
                onPress={handlePublicar}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.publishBtnText}>Publicando anuncio...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.publishBtnText}>Publicar comunicado a aprendices</Text>
                  </>
                )}
              </Pressable>
            </View>
          )}

          {/* SECCIÓN 2: HISTORIAL DE COMUNICADOS EMITIDOS */}
          {showEmitidos && (
            <View style={[styles.historyCard, isDesktop ? { flex: 1 } : { width: '100%' }]}>
              <View style={styles.historyHeader}>
                <View>
                  <Text style={styles.historyCardTitle}>Comunicados emitidos</Text>
                  <Text style={styles.historyCardSubtitle}>Tus publicaciones para aprendices</Text>
                </View>
                <View style={styles.historyBadge}>
                  <Text style={styles.historyBadgeText}>{emitidos.length} emitidos</Text>
                </View>
              </View>

              {emitidos.length === 0 ? (
                <View style={styles.emptyHistoryBox}>
                  <Ionicons name="chatbox-ellipses-outline" size={42} color="#CBD5E1" />
                  <Text style={styles.emptyHistoryTitle}>Aún no has emitido comunicados</Text>
                  <Text style={styles.emptyHistoryText}>
                    Usa la pestaña Redactar para publicar novedades o recordatorios a tus fichas.
                  </Text>
                  {!isDesktop && (
                    <Pressable
                      style={styles.createNowBtn}
                      onPress={() => setActiveTab('publicar')}
                    >
                      <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.createNowBtnText}>Crear mi primer comunicado</Text>
                    </Pressable>
                  )}
                </View>
              ) : (
                <View style={styles.historyList}>
                  {emitidos.map((item) => (
                    <View key={item.id} style={styles.historyItem}>
                      <View style={styles.itemTopRow}>
                        <Text style={styles.itemTitle}>{item.titulo}</Text>
                        <View style={styles.datePill}>
                          <Text style={styles.datePillText}>{item.fecha}</Text>
                        </View>
                      </View>

                      <View style={styles.itemTargetRow}>
                        <Ionicons name="people-outline" size={14} color="#B45309" />
                        <Text style={styles.itemTargetText}>Para: {item.destinatario}</Text>
                      </View>

                      <Text style={styles.itemPreview} numberOfLines={3}>
                        {item.mensaje}
                      </Text>

                      <View style={styles.itemBottomRow}>
                        <View style={styles.readCountBadge}>
                          <Ionicons name="eye-outline" size={13} color="#64748B" />
                          <Text style={styles.readCountText}>
                            {item.leidos !== undefined ? item.leidos : 0} lecturas
                          </Text>
                        </View>
                        <View style={styles.statusSuccessDot}>
                          <View style={styles.dot} />
                          <Text style={styles.dotLabel}>Transmitido</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* SECCIÓN 3: BANDEJA DE ENTRADA (RECIBIDOS INSTITUCIONALES) */}
      {showRecibidos && (
        <View style={styles.inboxContainer}>
          <View style={styles.inboxHeader}>
            <View>
              <Text style={styles.inboxTitle}>Bandeja de avisos institucionales</Text>
              <Text style={styles.inboxSubtitle}>
                Notificaciones enviadas por Coordinación Académica, Administración y Bienestar
              </Text>
            </View>
          </View>

          {recibidos.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="mail-open-outline" size={44} color={GOLD} />
              </View>
              <Text style={styles.emptyCardTitle}>Bandeja al día</Text>
              <Text style={styles.emptyCardSubtext}>
                No tienes mensajes institucionales pendientes en este momento.
              </Text>
              <Pressable style={styles.retryBtn} onPress={loadData}>
                <Text style={styles.retryBtnText}>Verificar nuevamente</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.messagesList}>
              {recibidos.map((message) => (
                <Pressable
                  key={message.id}
                  style={styles.messageCard}
                  onPress={() => void handleMarcarLeido(message.id)}
                >
                  <View style={styles.avatar}>
                    <Ionicons name="megaphone-outline" size={20} color="#FFFFFF" />
                  </View>
                  <View style={styles.flexOne}>
                    <View style={styles.messageHeaderRow}>
                      <Text style={styles.messageCardTitle}>{message.titulo}</Text>
                      <Text style={styles.messageDateText}>{message.fecha}</Text>
                    </View>

                    <View style={styles.messageMetaRow}>
                      <View style={styles.destinationBadge}>
                        <Text style={styles.destinationText}>Destinatario: {message.destinatario}</Text>
                      </View>
                      {message.autor && (
                        <View style={styles.authorBadge}>
                          <Text style={styles.authorText}>De: {message.autor}</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.messageContentText}>{message.mensaje}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_PAGE,
  },
  contentContainer: {
    paddingBottom: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG_PAGE,
    gap: 12,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: NAVY,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexShrink: 0,
  },
  refreshBtnText: {
    color: NAVY,
    fontWeight: '600',
    fontSize: 12,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 16,
  },
  errorBannerText: {
    color: '#DC2626',
    flex: 1,
    fontSize: 13,
  },
  retryBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  tabsWrapper: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 9,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: NAVY,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tabCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  tabCountBadgeActive: {
    backgroundColor: GOLD,
  },
  tabCountBadgeInactive: {
    backgroundColor: '#CBD5E1',
  },
  tabCountText: {
    fontSize: 10,
    fontWeight: '700',
  },
  tabCountTextActive: {
    color: NAVY,
  },
  tabCountTextInactive: {
    color: '#475569',
  },
  mainLayout: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'flex-start',
  },
  mainLayoutMobile: {
    flexDirection: 'column',
    gap: 16,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  formIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: GOLD_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: NAVY,
    letterSpacing: 0.4,
  },
  formCardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  successBanner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    backgroundColor: '#DEF7EC',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#BCF0DA',
    gap: 6,
  },
  successText: {
    fontSize: 13,
    color: '#03543F',
    fontWeight: '600',
    flex: 1,
  },
  viewSentBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  viewSentBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  errorInlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorInlineText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  fichasScrollView: {
    flexGrow: 0,
    maxHeight: 48,
    marginVertical: 2,
  },
  fichasChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  fichaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    paddingHorizontal: 14,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  fichaChipActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  fichaChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  fichaChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  fieldHelper: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 5,
    fontStyle: 'italic',
  },
  inputWrapper: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 13,
    color: NAVY,
    paddingVertical: 9,
  },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NAVY,
    paddingVertical: 13,
    borderRadius: 10,
    marginTop: 8,
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  publishBtnHover: {
    backgroundColor: '#1C1A4A',
  },
  publishBtnDisabled: {
    opacity: 0.6,
  },
  publishBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: NAVY,
  },
  historyCardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  historyBadge: {
    backgroundColor: GOLD_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  historyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  emptyHistoryBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 16,
    gap: 8,
  },
  emptyHistoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginTop: 6,
  },
  emptyHistoryText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  createNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: NAVY,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  createNowBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: NAVY,
    flex: 1,
  },
  datePill: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  datePillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  itemTargetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  itemTargetText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B45309',
  },
  itemPreview: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    marginTop: 2,
  },
  readCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readCountText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  statusSuccessDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  dotLabel: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  inboxContainer: {
    gap: 14,
  },
  inboxHeader: {
    marginBottom: 4,
  },
  inboxTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: NAVY,
  },
  inboxSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  messagesList: {
    gap: 12,
  },
  messageCard: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  flexOne: {
    flex: 1,
  },
  messageHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 2,
  },
  messageCardTitle: {
    flex: 1,
    color: NAVY,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  messageDateText: {
    color: '#64748B',
    fontSize: 12,
    flexShrink: 0,
    marginTop: 2,
  },
  messageMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
    marginBottom: 6,
  },
  destinationBadge: {
    alignSelf: 'flex-start',
    backgroundColor: GOLD_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  destinationText: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '600',
  },
  authorBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  authorText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
  messageContentText: {
    color: '#334155',
    lineHeight: 20,
    fontSize: 13,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 36,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: NAVY,
  },
  emptyCardSubtext: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 320,
  },
});
