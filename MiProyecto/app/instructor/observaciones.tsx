import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, RefreshControl, Platform, Alert } from 'react-native';
import { fichasService } from '../../services/fichasService';
import { ObservacionItem, observacionesService } from '../../services/observacionesService';

const GOLD = '#D4AF37';
const NAVY = '#0F1026';

const TYPES: Array<{ label: string; value: ObservacionItem['tipo'] }> = [
  { label: 'Académica', value: 'ACADEMICA' },
  { label: 'Disciplinaria', value: 'DISCIPLINARIA' },
  { label: 'Reconocimiento', value: 'RECONOCIMIENTO' },
  { label: 'Otra', value: 'OTRO' },
];

type Apprentice = { id: string; firstName: string; lastName?: string };

export default function ObservacionesScreen() {
  const [observations, setObservations] = useState<ObservacionItem[]>([]);
  const [apprentices, setApprentices] = useState<Apprentice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAprendizId, setSelectedAprendizId] = useState('');
  const [buscarAprendiz, setBuscarAprendiz] = useState('');
  const [tipo, setTipo] = useState<ObservacionItem['tipo']>('ACADEMICA');
  const [materia, setMateria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    loadData().finally(() => { if (!isMounted) return; });
    return () => { isMounted = false; };
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [items, fichas] = await Promise.all([
        observacionesService.getMisObservaciones(),
        fichasService.getFichas(),
      ]);
      setObservations(items);
      if (fichas[0]) {
        const detail = await fichasService.getFichaById(fichas[0].id);
        const list = (detail?.matriculas || []).map((item: any) => ({
          id: item.aprendiz.id,
          firstName: item.aprendiz.firstName,
          lastName: item.aprendiz.lastName,
        }));
        setApprentices(list);
      }
    } catch (error: any) {
      console.error('Error cargando observaciones:', error);
      setErrorMsg(error?.message || 'No se pudieron cargar las observaciones. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setErrorMsg(null);
    try {
      const [items, fichas] = await Promise.all([
        observacionesService.getMisObservaciones(),
        fichasService.getFichas(),
      ]);
      setObservations(items);
      if (fichas[0]) {
        const detail = await fichasService.getFichaById(fichas[0].id);
        const list = (detail?.matriculas || []).map((item: any) => ({
          id: item.aprendiz.id,
          firstName: item.aprendiz.firstName,
          lastName: item.aprendiz.lastName,
        }));
        setApprentices(list);
      }
    } catch (error: any) {
      setErrorMsg(error?.message || 'No se pudieron cargar las observaciones.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const createObservation = async () => {
    if (!selectedAprendizId || !descripcion.trim()) {
      showToast('Selecciona un aprendiz y escribe una descripción');
      return;
    }
    setSaving(true);
    try {
      const created = await observacionesService.crearObservacion({
        aprendizId: selectedAprendizId,
        tipo,
        materia: materia.trim() || undefined,
        descripcion: descripcion.trim(),
      });
      setObservations(previous => [created, ...previous]);
      setModalVisible(false);
      setSelectedAprendizId('');
      setMateria('');
      setDescripcion('');
      showToast('Observación guardada correctamente');
    } catch (error: any) {
      showToast(error?.message || 'No se pudo guardar la observación');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteObservation = (id: string) => {
    const confirmDelete = () => {
      observacionesService.eliminarObservacion(id)
        .then(() => {
          setObservations(prev => prev.filter(o => o.id !== id));
          showToast('Observación eliminada correctamente');
        })
        .catch(err => {
          showToast(err?.message || 'Error al eliminar la observación');
        });
    };

    if (Platform.OS === 'web') {
      if (window.confirm('¿Deseas eliminar esta observación pedagógica?')) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        'Eliminar Observación',
        '¿Estás seguro de que deseas eliminar esta observación pedagógica?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: confirmDelete },
        ]
      );
    }
  };

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color={GOLD} /><Text style={styles.loadingText}>Cargando observaciones...</Text></View>;
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
        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>Observaciones</Text>
          <Text style={styles.subtitle}>Seguimiento académico y formativo</Text>
        </View>
        <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addText}>Nueva</Text>
        </Pressable>
      </View>

      {toast && <View style={styles.toastWrap}><Ionicons name="checkmark-circle" size={16} color="#92400E" /><Text style={styles.toastText}>{toast}</Text></View>}

      {errorMsg && (
        <View style={styles.errorWrap}>
          <Ionicons name="cloud-offline-outline" size={20} color="#DC2626" />
          <Text style={styles.errorText}>{errorMsg}</Text>
          <Pressable style={styles.retryBtn} onPress={loadData}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      )}

      {observations.length === 0 && !errorMsg ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="document-text-outline" size={48} color={GOLD} />
          </View>
          <Text style={styles.emptyTitle}>Sin observaciones registradas</Text>
          <Text style={styles.emptySubtitle}>Registra la primera observación académica o formativa de tus aprendices.</Text>
          <Pressable style={styles.emptyAction} onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
            <Text style={styles.emptyActionText}>Crear primera observación</Text>
          </Pressable>
        </View>
      ) : observations.map(item => (
        <View key={item.id} style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.student}>{item.aprendizNombre || 'Aprendiz'}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <Text style={styles.date}>{item.fecha}</Text>
              <Pressable
                style={styles.cardDeleteBtn}
                onPress={() => handleDeleteObservation(item.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={16} color="#DC2626" />
              </Pressable>
            </View>
          </View>
          <Text style={styles.type}>{item.tipo}</Text>
          {item.materia && <Text style={styles.subject}>{item.materia}</Text>}
          <Text style={styles.description}>{item.descripcion}</Text>
        </View>
      ))}

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.backdrop}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva observación</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 480 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Buscar y Seleccionar Aprendiz</Text>
              
              {/* Barra de búsqueda de aprendiz */}
              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={16} color="#64748B" style={{ marginRight: 6 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar por nombre o apellido..."
                  placeholderTextColor="#94A3B8"
                  value={buscarAprendiz}
                  onChangeText={setBuscarAprendiz}
                />
                {buscarAprendiz ? (
                  <Pressable onPress={() => setBuscarAprendiz('')}>
                    <Ionicons name="close-circle" size={16} color="#94A3B8" />
                  </Pressable>
                ) : null}
              </View>

              {/* Indicador de aprendiz seleccionado */}
              {(() => {
                const sel = apprentices.find((a) => a.id === selectedAprendizId);
                if (!sel) return null;
                return (
                  <View style={styles.selectedAprendizChip}>
                    <Ionicons name="checkmark-circle" size={16} color="#047857" style={{ marginRight: 6 }} />
                    <Text style={styles.selectedAprendizText}>
                      Seleccionado: {sel.firstName} {sel.lastName || ''}
                    </Text>
                    <Pressable onPress={() => setSelectedAprendizId('')} style={{ marginLeft: 8 }}>
                      <Ionicons name="close-circle-outline" size={16} color="#047857" />
                    </Pressable>
                  </View>
                );
              })()}

              {/* Lista filtrada de aprendices */}
              <View style={styles.apprenticesContainer}>
                {apprentices
                  .filter((a) =>
                    `${a.firstName} ${a.lastName || ''}`
                      .toLowerCase()
                      .includes(buscarAprendiz.toLowerCase().trim())
                  )
                  .map((apprentice) => {
                    const isSelected = selectedAprendizId === apprentice.id;
                    return (
                      <Pressable
                        key={apprentice.id}
                        style={[styles.apprenticeItem, isSelected && styles.apprenticeItemSelected]}
                        onPress={() => setSelectedAprendizId(apprentice.id)}
                      >
                        <View style={[styles.apprenticeAvatar, isSelected && { backgroundColor: GOLD }]}>
                          <Text style={[styles.apprenticeAvatarText, isSelected && { color: NAVY }]}>
                            {apprentice.firstName.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <Text style={[styles.apprenticeName, isSelected && { fontWeight: '700', color: NAVY }]}>
                          {apprentice.firstName} {apprentice.lastName || ''}
                        </Text>
                        {isSelected ? (
                          <Ionicons name="checkmark" size={18} color="#047857" style={{ marginLeft: 'auto' }} />
                        ) : null}
                      </Pressable>
                    );
                  })}
              </View>

              <Text style={[styles.label, { marginTop: 14 }]}>Tipo de Observación</Text>
              <View style={styles.selector}>
                {TYPES.map((option) => (
                  <Pressable
                    key={option.value}
                    style={[styles.chip, tipo === option.value && styles.chipActive]}
                    onPress={() => setTipo(option.value)}
                  >
                    <Text style={tipo === option.value ? styles.chipActiveText : undefined}>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Materia o competencia (opcional)"
                placeholderTextColor="#94A3B8"
                value={materia}
                onChangeText={setMateria}
              />

              <TextInput
                style={[styles.input, styles.multiline]}
                placeholder="Descripción detallada de la observación pedagógica..."
                placeholderTextColor="#94A3B8"
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
              />
            </ScrollView>

            <View style={styles.actions}>
              <Pressable style={styles.cancel} onPress={() => setModalVisible(false)} disabled={saving}>
                <Text>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.save} onPress={createObservation} disabled={saving}>
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveText}>Guardar</Text>
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
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 12, paddingBottom: 40 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: '#F8FAFC' },
  loadingText: { color: '#64748B', marginTop: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  headerTextWrap: { flex: 1 },
  title: { fontSize: 22, fontWeight: '700', color: '#0F172A' },
  subtitle: { color: '#64748B', marginTop: 3, fontSize: 13 },
  addButton: { flexDirection: 'row', gap: 5, alignItems: 'center', backgroundColor: NAVY, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, flexShrink: 0 },
  addText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  toastWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF3C7', padding: 12, borderRadius: 10 },
  toastText: { color: '#92400E', fontWeight: '600', flex: 1 },
  errorWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FEF2F2', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#FECACA' },
  errorText: { color: '#DC2626', flex: 1, fontSize: 13 },
  retryBtn: { backgroundColor: '#DC2626', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  retryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  empty: { alignItems: 'center', padding: 36, backgroundColor: '#FFFFFF', borderRadius: 20, gap: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  emptyIconWrap: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { color: '#0F172A', fontWeight: '700', fontSize: 16 },
  emptySubtitle: { color: '#64748B', textAlign: 'center', lineHeight: 20, paddingHorizontal: 10, fontSize: 13 },
  emptyAction: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: NAVY, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, marginTop: 6 },
  emptyActionText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  student: { flex: 1, color: '#0F172A', fontWeight: '700', fontSize: 15, lineHeight: 20 },
  date: { color: '#94A3B8', fontSize: 12, flexShrink: 0, marginTop: 2 },
  cardDeleteBtn: { padding: 5, borderRadius: 6, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center' },
  type: { color: '#B45309', fontSize: 12, fontWeight: '700' },
  subject: { color: '#64748B', fontSize: 12 },
  description: { color: '#334155', fontSize: 13, lineHeight: 19 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 },
  modal: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, maxHeight: '90%', width: '100%', maxWidth: 540, alignSelf: 'center' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  label: { color: '#334155', fontWeight: '600', marginTop: 8, marginBottom: 6 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
  },
  selectedAprendizChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86EFAC',
    marginBottom: 8,
  },
  selectedAprendizText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
    flex: 1,
  },
  apprenticesContainer: {
    maxHeight: 130,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 4,
  },
  apprenticeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  apprenticeItemSelected: {
    backgroundColor: '#FEF3C7',
  },
  apprenticeAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  apprenticeAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  apprenticeName: {
    fontSize: 13,
    color: '#1E293B',
  },
  selector: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 8, marginRight: 6, marginBottom: 6 },
  chipActive: { backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: GOLD },
  chipActiveText: { color: '#92400E', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 10, marginTop: 10, color: '#0F172A' },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 18 },
  cancel: { padding: 10, backgroundColor: '#F1F5F9', borderRadius: 8 },
  save: { minWidth: 110, alignItems: 'center', padding: 10, backgroundColor: NAVY, borderRadius: 8 },
  saveText: { color: '#FFFFFF', fontWeight: '700' },
});
