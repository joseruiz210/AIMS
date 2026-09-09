import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  useWindowDimensions,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fichasService } from '../../services/fichasService';
import { asistenciaService } from '../../services/asistenciaService';

const NAVY = '#12103C';
const GOLD = '#cfa235';
const GREEN = '#2ECC71';
const RED = '#E74C3C';
const YELLOW = '#F1C40F';

type AttendanceState = 'presente' | 'ausente' | 'excusa';

interface ApprenticeAttendance {
  id: string;
  name: string;
  doc: string;
  ficha: string;
  initials: string;
  status: AttendanceState;
  note?: string;
  history: { date: string; status: AttendanceState }[];
}

const INITIAL_APPRENTICES: ApprenticeAttendance[] = [
  {
    id: '1',
    name: 'Valentina Torres',
    doc: '1020345678',
    ficha: '2845671',
    initials: 'VT',
    status: 'presente',
    history: [
      { date: 'Jul 1', status: 'presente' },
      { date: 'Jul 2', status: 'presente' },
      { date: 'Jul 3', status: 'presente' },
      { date: 'Jul 4', status: 'ausente' },
    ],
  },
  {
    id: '2',
    name: 'Carlos Mendoza',
    doc: '1020345679',
    ficha: '2845671',
    initials: 'CM',
    status: 'ausente',
    history: [
      { date: 'Jul 1', status: 'presente' },
      { date: 'Jul 2', status: 'ausente' },
      { date: 'Jul 3', status: 'ausente' },
      { date: 'Jul 4', status: 'presente' },
    ],
  },
  {
    id: '3',
    name: 'Laura Jiménez',
    doc: '1020345680',
    ficha: '2845671',
    initials: 'LJ',
    status: 'presente',
    history: [
      { date: 'Jul 1', status: 'presente' },
      { date: 'Jul 2', status: 'presente' },
      { date: 'Jul 3', status: 'presente' },
      { date: 'Jul 4', status: 'excusa' },
    ],
  },
  {
    id: '4',
    name: 'Andrés Reyes',
    doc: '1020345681',
    ficha: '2845671',
    initials: 'AR',
    status: 'excusa',
    note: 'Cita médica certificada',
    history: [
      { date: 'Jul 1', status: 'presente' },
      { date: 'Jul 2', status: 'ausente' },
      { date: 'Jul 3', status: 'ausente' },
      { date: 'Jul 4', status: 'presente' },
    ],
  },
  {
    id: '5',
    name: 'María Castillo',
    doc: '1020345682',
    ficha: '2845671',
    initials: 'MC',
    status: 'presente',
    history: [
      { date: 'Jul 1', status: 'presente' },
      { date: 'Jul 2', status: 'presente' },
      { date: 'Jul 3', status: 'presente' },
      { date: 'Jul 4', status: 'presente' },
    ],
  },
];

export default function AsistenciaAnimatedScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isSmallPhone = width < 400;

  const [apprentices, setApprentices] = useState<ApprenticeAttendance[]>(INITIAL_APPRENTICES);
  const [selectedDate, setSelectedDate] = useState('Hoy (26 Ago)');
  const [apprentices, setApprentices] = useState<ApprenticeAttendance[]>([]);
  const [fichaId, setFichaId] = useState<string>('');
  const [fichaNumero, setFichaNumero] = useState<string>('2670142');
  const [programaNombre, setProgramaNombre] = useState<string>('ADSO');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const dateOptions = React.useMemo(() => {
    const today = new Date();
    return [0, 1, 2, 3].map(offset => {
      const d = new Date(today);
      d.setDate(today.getDate() - offset);
      const iso = d.toISOString().split('T')[0];
      const dayName = offset === 0 ? 'Hoy' : offset === 1 ? 'Ayer' : d.toLocaleDateString('es-CO', { weekday: 'short' });
      const dayNum = d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
      return {
        iso,
        label: `${dayName} (${dayNum})`,
        shortLabel: dayNum,
      };
    });
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | AttendanceState>('todos');
  const [viewMode, setViewMode] = useState<'uno-por-uno' | 'tarjetas' | 'matriz'>('uno-por-uno');
  
  // Step-by-Step Index state for "Uno por Uno" mode
  const [currentIndex, setCurrentIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Animated values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const total = apprentices.length;

  useEffect(() => {
    loadApprenticesFromDb();
  }, []);

  const fetchAttendanceForDate = async (currentFichaId: string, isoDate: string, currentList?: ApprenticeAttendance[]) => {
    try {
      const prevRecords = await asistenciaService.getAsistenciasByFicha(currentFichaId, isoDate);
      const prevMap = new Map<string, string>();
      prevRecords.forEach(r => prevMap.set(r.aprendizId, r.estado));

      setApprentices(prev => {
        const base = currentList || prev;
        return base.map(a => {
          const prevStatus = prevMap.get(a.id);
          let st: AttendanceState = 'presente';
          if (prevStatus === 'AUSENTE') st = 'ausente';
          else if (prevStatus === 'EXCUSA') st = 'excusa';
          return { ...a, status: st };
        });
      });
    } catch (err) {
      console.error('Error al obtener asistencias por fecha:', err);
    }
  };

  const handleSelectDate = async (isoDate: string) => {
    setSelectedDate(isoDate);
    if (fichaId) {
      await fetchAttendanceForDate(fichaId, isoDate);
      showToast(`Sesión: ${isoDate}`);
    }
  };

  const loadApprenticesFromDb = async () => {
    setLoading(true);
    try {
      const fichas = await fichasService.getFichas();
      if (fichas.length > 0) {
        const targetFicha = fichas[0];
        setFichaId(targetFicha.id);
        setFichaNumero(targetFicha.numero);
        setProgramaNombre(targetFicha.programaNombre || 'ADSO');

        const detail = await fichasService.getFichaById(targetFicha.id);
        if (detail && detail.matriculas && detail.matriculas.length > 0) {
          const todayIso = dateOptions[0].iso;
          setSelectedDate(todayIso);

          const list: ApprenticeAttendance[] = detail.matriculas.map((m: any) => {
            const a = m.aprendiz;
            const fullName = `${a.firstName} ${a.lastName || ''}`.trim();
            const initials = `${a.firstName?.[0] || 'A'}${a.lastName?.[0] || 'P'}`.toUpperCase();

            return {
              id: a.id,
              name: fullName,
              doc: a.phone || a.id.slice(0, 8),
              ficha: targetFicha.numero,
              initials,
              status: 'presente',
              history: [
                { date: dateOptions[3].shortLabel, status: 'presente' },
                { date: dateOptions[2].shortLabel, status: 'presente' },
                { date: dateOptions[1].shortLabel, status: 'presente' },
              ],
            };
          });

          await fetchAttendanceForDate(targetFicha.id, todayIso, list);
        }
      }
    } catch (err) {
      console.error('Error cargando aprendices desde BD:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAttendance = async () => {
    if (!fichaId || apprentices.length === 0) return;
    setSaving(true);
    try {
      const payload = {
        fichaId,
        fecha: selectedDate,
        tema: `Sesión de Formación - ${programaNombre}`,
        asistencias: apprentices.map(a => ({
          aprendizId: a.id,
          estado: a.status === 'presente' ? 'PRESENTE' : a.status === 'ausente' ? 'AUSENTE' : 'EXCUSA',
          observacion: a.note || undefined,
        })),
      };

      await asistenciaService.registrarAsistencia(payload);
      showToast('✅ Asistencia guardada exitosamente en PostgreSQL');
    } catch (err: any) {
      console.error('Error guardando asistencia en BD:', err);
      showToast('⚠️ ' + (err.message || 'Error al registrar asistencia'));
    } finally {
      setSaving(false);
    }
  };

  // Animate progress bar width smooth transition
  useEffect(() => {
    const targetProgress = Math.min(100, (currentIndex / total) * 100);
    const targetProgress = total > 0 ? Math.min(100, (currentIndex / total) * 100) : 0;
    Animated.timing(progressAnim, {
      toValue: targetProgress,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [currentIndex, total]);

  const triggerCardTransition = (callback: () => void) => {
    // Fade out & scale down animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.94,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      // Fade in & scale up animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  // 1-Click Mass Actions
  const handleMarkAllPresent = () => {
    setApprentices(prev => prev.map(a => ({ ...a, status: 'presente' })));
    showToast('⚡ Todos los aprendices marcados como PRESENTES');
  };

  const handleResetAll = () => {
    triggerCardTransition(() => {
      setApprentices(prev => prev.map(a => ({ ...a, status: 'ausente' })));
      setCurrentIndex(0);
    });
    showToast('↺ Toma de lista reiniciada');
  };

  const setSingleStatus = (id: string, newStatus: AttendanceState) => {
    setApprentices(prev =>
      prev.map(a => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  // Step-by-Step action with fluid animated transition
  const handleStepAction = (status: AttendanceState) => {
    const currentApprentice = apprentices[currentIndex];
    if (currentApprentice) {
      setSingleStatus(currentApprentice.id, status);
      const statusName = status === 'presente' ? 'PRESENTE 🟢' : status === 'ausente' ? 'NO VINO 🔴' : 'EXCUSA 🟡';
      showToast(`${currentApprentice.name}: ${statusName}`);

      triggerCardTransition(() => {
        setCurrentIndex(prev => prev + 1);
      });
    }
  };

  const handlePrevStudent = () => {
    if (currentIndex > 0) {
      triggerCardTransition(() => {
        setCurrentIndex(prev => prev - 1);
      });
    }
  };

  const handleSkipStudent = () => {
    if (currentIndex < total) {
      triggerCardTransition(() => {
        setCurrentIndex(prev => prev + 1);
      });
    }
  };

  // Calculations
  const presentesCount = apprentices.filter(a => a.status === 'presente').length;
  const ausentesCount = apprentices.filter(a => a.status === 'ausente').length;
  const excusasCount = apprentices.filter(a => a.status === 'excusa').length;
  const pctPresentes = total > 0 ? Math.round(((presentesCount + excusasCount * 0.5) / total) * 100) : 0;

  // Filtered apprentices for list/matrix views
  const filteredApprentices = apprentices.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.doc.includes(searchQuery);
    const matchesFilter = filterStatus === 'todos' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const currentFocusStudent = apprentices[currentIndex];
  const isFinished = currentIndex >= total;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Toast Banner Notification */}
      {toastMessage && (
        <View style={styles.toastBanner}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Header & Title */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>Registro de Asistencia</Text>
          <Text style={styles.pageSubtitle}>Toma de lista fluida, rápida y responsiva</Text>
        </View>

        {/* View Mode Switcher */}
        <View style={styles.viewToggleContainer}>
          <Pressable
            style={[styles.toggleBtn, viewMode === 'uno-por-uno' && styles.toggleBtnActive]}
            onPress={() => setViewMode('uno-por-uno')}
          >
            <Ionicons
              name="person-outline"
              size={15}
              color={viewMode === 'uno-por-uno' ? '#FFFFFF' : NAVY}
            />
            <Text style={[styles.toggleText, viewMode === 'uno-por-uno' && styles.toggleTextActive]}>
              Uno por Uno
            </Text>
          </Pressable>

          <Pressable
            style={[styles.toggleBtn, viewMode === 'tarjetas' && styles.toggleBtnActive]}
            onPress={() => setViewMode('tarjetas')}
          >
            <Ionicons
              name="card-outline"
              size={15}
              color={viewMode === 'tarjetas' ? '#FFFFFF' : NAVY}
            />
            <Text style={[styles.toggleText, viewMode === 'tarjetas' && styles.toggleTextActive]}>
              Lista Rápida
            </Text>
          </Pressable>

          <Pressable
            style={[styles.toggleBtn, viewMode === 'matriz' && styles.toggleBtnActive]}
            onPress={() => setViewMode('matriz')}
          >
            <Ionicons
              name="grid-outline"
              size={15}
              color={viewMode === 'matriz' ? '#FFFFFF' : NAVY}
            />
            <Text style={[styles.toggleText, viewMode === 'matriz' && styles.toggleTextActive]}>
              Matriz
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Quick Date Selector & Mass Actions */}
      <View style={styles.quickActionBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
          {['Hoy (26 Ago)', 'Ayer (25 Ago)', 'Jul 4', 'Jul 3'].map((d, i) => (
          {dateOptions.map((d, i) => (
            <Pressable
              key={i}
              style={[styles.dateChip, selectedDate === d && styles.dateChipActive]}
              onPress={() => setSelectedDate(d)}
              style={[styles.dateChip, selectedDate === d.iso && styles.dateChipActive]}
              onPress={() => handleSelectDate(d.iso)}
            >
              <Text style={[styles.dateChipText, selectedDate === d && styles.dateChipTextActive]}>
                {d}
              <Text style={[styles.dateChipText, selectedDate === d.iso && styles.dateChipTextActive]}>
                {d.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.massBtnGroup}>
          <Pressable 
            style={[styles.btnSaveDb, saving && { opacity: 0.7 }]} 
            onPress={handleSaveAttendance}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="cloud-upload-outline" size={16} color="#FFFFFF" />
            )}
            <Text style={styles.btnSaveDbText}>
              {saving ? 'Guardando...' : 'Guardar en BD'}
            </Text>
          </Pressable>

          <Pressable style={styles.btnMassPresent} onPress={handleMarkAllPresent}>
            <Ionicons name="flash-outline" size={16} color="#FFFFFF" />
            <Text style={styles.btnMassPresentText}>Marcar Todos Presentes</Text>
            <Text style={styles.btnMassPresentText}>Todos Presentes</Text>
          </Pressable>

          <Pressable style={styles.btnMassReset} onPress={handleResetAll}>
            <Ionicons name="refresh-outline" size={16} color="#555555" />
          </Pressable>
        </View>
      </View>

      {/* SECTION 1: UNO POR UNO (Step-by-Step Focus Animated Mode) */}
      {viewMode === 'uno-por-uno' && (
        <View style={styles.stepSection}>
          {/* Animated Progress Bar */}
          <View style={styles.stepProgressContainer}>
            <View style={styles.stepProgressLabelRow}>
              <Text style={styles.stepProgressTitle}>
                {isFinished ? '¡Completado!' : `Aprendiz ${currentIndex + 1} de ${total}`}
              </Text>
              <Text style={styles.stepProgressPercentage}>
                {Math.min(100, Math.round((currentIndex / total) * 100))}%
              </Text>
            </View>
            <View style={styles.stepProgressBarBg}>
              <Animated.View
                style={[
                  styles.stepProgressBarFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          </View>

          {/* FLUID ANIMATED STUDENT CARD */}
          {!isFinished && currentFocusStudent ? (
            <Animated.View
              style={[
                styles.focusCard,
                isSmallPhone && styles.focusCardSmall,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              {/* Avatar Circle */}
              <View style={styles.focusAvatar}>
                <Text style={styles.focusAvatarText}>{currentFocusStudent.initials}</Text>
              </View>

              {/* Student Details */}
              <Text style={styles.focusName}>{currentFocusStudent.name}</Text>
              <Text style={styles.focusSubtext}>
                Doc: {currentFocusStudent.doc} . Ficha: {currentFocusStudent.ficha}
              </Text>

              {/* Current Status Badge */}
              <View style={styles.currentStatusPill}>
                <Text style={styles.currentStatusPillLabel}>Estado actual:</Text>
                <View
                  style={[
                    styles.statusIndicator,
                    currentFocusStudent.status === 'presente' && { backgroundColor: GREEN },
                    currentFocusStudent.status === 'ausente' && { backgroundColor: RED },
                    currentFocusStudent.status === 'excusa' && { backgroundColor: YELLOW },
                  ]}
                >
                  <Text style={styles.statusIndicatorText}>
                    {currentFocusStudent.status === 'presente'
                      ? '🟢 Presente'
                      : currentFocusStudent.status === 'ausente'
                      ? '🔴 No vino'
                      : '🟡 Excusa'}
                  </Text>
                </View>
              </View>

              {/* FLUID TOUCHABLE BIG ACTION BUTTONS */}
              <View style={[styles.bigActionRow, isMobile && styles.bigActionRowMobile]}>
                <Pressable
                  style={({ pressed }) => [
                    styles.bigBtn,
                    styles.bigBtnPresente,
                    isMobile && styles.bigBtnMobile,
                    pressed && styles.bigBtnPressed,
                  ]}
                  onPress={() => handleStepAction('presente')}
                >
                  <Ionicons name="checkmark-circle" size={isMobile ? 28 : 34} color="#FFFFFF" />
                  <Text style={[styles.bigBtnText, isMobile && styles.bigBtnTextMobile]}>PRESENTE</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.bigBtn,
                    styles.bigBtnAusente,
                    isMobile && styles.bigBtnMobile,
                    pressed && styles.bigBtnPressed,
                  ]}
                  onPress={() => handleStepAction('ausente')}
                >
                  <Ionicons name="close-circle" size={isMobile ? 28 : 34} color="#FFFFFF" />
                  <Text style={[styles.bigBtnText, isMobile && styles.bigBtnTextMobile]}>NO VINO</Text>
                </Pressable>
              </View>

              {/* Secondary Excuse Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.btnExcusaSecondary,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => handleStepAction('excusa')}
              >
                <Ionicons name="alert-circle-outline" size={18} color="#000000" />
                <Text style={styles.btnExcusaSecondaryText}>Registrar Excusa / Justificado</Text>
              </Pressable>

              {/* Prev / Next Navigation Controls */}
              <View style={styles.navControlsRow}>
                <Pressable
                  style={[styles.navStepBtn, currentIndex === 0 && styles.navStepBtnDisabled]}
                  disabled={currentIndex === 0}
                  onPress={handlePrevStudent}
                >
                  <Ionicons name="arrow-back" size={16} color={currentIndex === 0 ? '#AAAAAA' : NAVY} />
                  <Text style={[styles.navStepText, currentIndex === 0 && styles.navStepTextDisabled]}>
                    Anterior
                  </Text>
                </Pressable>

                <Pressable style={styles.navStepBtn} onPress={handleSkipStudent}>
                  <Text style={styles.navStepText}>Omitir / Siguiente</Text>
                  <Ionicons name="arrow-forward" size={16} color={NAVY} />
                </Pressable>
              </View>
            </Animated.View>
          ) : (
            /* Celebration Completion Screen */
            <Animated.View
              style={[
                styles.completionCard,
                { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
              ]}
            >
              <View style={styles.celebrationIconWrap}>
                <Ionicons name="checkmark-done-circle" size={64} color={GREEN} />
              </View>
              <Text style={styles.completionTitle}>¡Asistencia Completada!</Text>
              <Text style={styles.completionSubtext}>
                Se ha registrado la lista de los {total} aprendices para {selectedDate}.
              </Text>

              {/* Summary Stats Card */}
              <View style={styles.summaryBox}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryNumber, { color: GREEN }]}>{presentesCount}</Text>
                  <Text style={styles.summaryLabel}>Presentes 🟢</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryNumber, { color: RED }]}>{ausentesCount}</Text>
                  <Text style={styles.summaryLabel}>No vinieron 🔴</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryNumber, { color: YELLOW }]}>{excusasCount}</Text>
                  <Text style={styles.summaryLabel}>Excusas 🟡</Text>
                </View>
              </View>

              <View style={styles.completionActions}>
                <Pressable
                  style={styles.btnResetStep}
                  onPress={() => {
                    triggerCardTransition(() => setCurrentIndex(0));
                  }}
                >
                  <Text style={styles.btnResetStepText}>Revisar de nuevo</Text>
                </Pressable>

                <Pressable
                  style={styles.btnGoMatrix}
                  onPress={() => setViewMode('tarjetas')}
                >
                  <Text style={styles.btnGoMatrixText}>Ver Lista Completa</Text>
                </Pressable>
              </View>
            </Animated.View>
          )}
        </View>
      )}

      {/* Live Statistics Summary Dashboard Card (For Lista Rápida & Matriz modes) */}
      {viewMode !== 'uno-por-uno' && (
        <View style={styles.statsCard}>
          <View style={styles.statMetricItem}>
            <Text style={[styles.statMetricNumber, { color: GREEN }]}>{presentesCount}</Text>
            <Text style={styles.statMetricLabel}>Presentes 🟢</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statMetricItem}>
            <Text style={[styles.statMetricNumber, { color: RED }]}>{ausentesCount}</Text>
            <Text style={styles.statMetricLabel}>No vinieron 🔴</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statMetricItem}>
            <Text style={[styles.statMetricNumber, { color: YELLOW }]}>{excusasCount}</Text>
            <Text style={styles.statMetricLabel}>Excusas 🟡</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statMetricItem}>
            <Text style={[styles.statMetricNumber, { color: GOLD }]}>{pctPresentes}%</Text>
            <Text style={styles.statMetricLabel}>Asistencia Día</Text>
          </View>
        </View>
      )}

      {/* SECTION 2: LISTA RÁPIDA (Tarjetas Mode) */}
      {viewMode === 'tarjetas' && (
        <View style={styles.listSection}>
          <View style={styles.filterRow}>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={18} color="#888888" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nombre o documento..."
                placeholderTextColor="#999999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <View style={styles.cardsList}>
            {filteredApprentices.map(item => (
              <View key={item.id} style={styles.apprenticeCard}>
                <View style={styles.cardInfoGroup}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{item.initials}</Text>
                  </View>
                  <View>
                    <Text style={styles.apprenticeName}>{item.name}</Text>
                    <Text style={styles.apprenticeDoc}>Doc: {item.doc}</Text>
                  </View>
                </View>

                <View style={styles.stateButtonGroup}>
                  <Pressable
                    style={[
                      styles.stateBtn,
                      item.status === 'presente' && styles.stateBtnPresente,
                    ]}
                    onPress={() => setSingleStatus(item.id, 'presente')}
                  >
                    <Text style={[styles.stateBtnText, item.status === 'presente' && styles.stateBtnTextActive]}>
                      🟢 Presente
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.stateBtn,
                      item.status === 'ausente' && styles.stateBtnAusente,
                    ]}
                    onPress={() => setSingleStatus(item.id, 'ausente')}
                  >
                    <Text style={[styles.stateBtnText, item.status === 'ausente' && styles.stateBtnTextActive]}>
                      🔴 No vino
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.stateBtn,
                      item.status === 'excusa' && styles.stateBtnExcusa,
                    ]}
                    onPress={() => setSingleStatus(item.id, 'excusa')}
                  >
                    <Text style={[styles.stateBtnText, item.status === 'excusa' && styles.stateBtnTextActive]}>
                      🟡 Excusa
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* SECTION 3: MATRIZ HISTÓRICA (Grid Table Mode) */}
      {viewMode === 'matriz' && (
        <View style={styles.tableCard}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.headerCell, styles.nameHeaderCell]}>Aprendiz</Text>
            <Text style={styles.headerCell}>Jul 1</Text>
            <Text style={styles.headerCell}>Jul 2</Text>
            <Text style={styles.headerCell}>Jul 3</Text>
            <Text style={styles.headerCell}>Jul 4</Text>
            <Text style={[styles.headerCell, styles.hoyHeaderCell]}>Hoy</Text>
            {dateOptions.slice(1).reverse().map((d, i) => (
              <Text key={i} style={styles.headerCell}>{d.shortLabel}</Text>
            ))}
            <Text style={[styles.headerCell, styles.hoyHeaderCell]}>Sesión</Text>
          </View>

          {filteredApprentices.map(item => (
            <View key={item.id} style={styles.tableDataRow}>
              <Text style={styles.nameDataCell}>{item.name}</Text>
              {item.history.map((h, i) => (
                <View key={i} style={styles.historyCell}>
                  {h.status === 'presente' && <Text style={{ color: GREEN, fontWeight: '700' }}>✓</Text>}
                  {h.status === 'ausente' && <Text style={{ color: RED, fontWeight: '700' }}>X</Text>}
                  {h.status === 'excusa' && <Text style={{ color: YELLOW, fontWeight: '700' }}>!</Text>}
                </View>
              ))}

              <Pressable
                style={[
                  styles.hoyCell,
                  item.status === 'presente' && { backgroundColor: '#E8F8F5' },
                  item.status === 'ausente' && { backgroundColor: '#FDEDEC' },
                  item.status === 'excusa' && { backgroundColor: '#FEF9E7' },
                ]}
                onPress={() => {
                  const nextStatus: AttendanceState =
                    item.status === 'presente'
                      ? 'ausente'
                      : item.status === 'ausente'
                      ? 'excusa'
                      : 'presente';
                  setSingleStatus(item.id, nextStatus);
                }}
              >
                <Text
                  style={[
                    styles.hoyCellText,
                    item.status === 'presente' && { color: GREEN },
                    item.status === 'ausente' && { color: RED },
                    item.status === 'excusa' && { color: YELLOW },
                  ]}
                >
                  {item.status === 'presente' ? '✓ Presente' : item.status === 'ausente' ? 'X No vino' : '! Excusa'}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  toastBanner: {
    backgroundColor: NAVY,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  toastText: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '600',
    color: '#000000',
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
  viewToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E5E5',
    borderRadius: 8,
    padding: 3,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    gap: 4,
  },
  toggleBtnActive: {
    backgroundColor: NAVY,
  },
  toggleText: {
    fontSize: 12,
    color: NAVY,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  quickActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  dateScroll: {
    flexGrow: 0,
  },
  dateChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  dateChipActive: {
    backgroundColor: GOLD,
  },
  dateChipText: {
    fontSize: 13,
    color: '#4A4A4A',
  },
  dateChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  massBtnGroup: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  btnSaveDb: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2027',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  btnSaveDbText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  btnMassPresent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
  },
  btnMassPresentText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  btnMassReset: {
    backgroundColor: '#E5E5E5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Step-by-Step UNO POR UNO Mode Styles (Balanced Desktop & Mobile Proportions)
  stepSection: {
    alignItems: 'center',
    width: '100%',
  },
  stepProgressContainer: {
    width: '100%',
    maxWidth: 620,
    marginBottom: 16,
  },
  stepProgressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  stepProgressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  stepProgressPercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: GOLD,
  },
  stepProgressBarBg: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  stepProgressBarFill: {
    height: '100%',
    backgroundColor: GOLD,
    borderRadius: 4,
  },
  focusCard: {
    backgroundColor: '#E5E5E5',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
  },
  focusCardSmall: {
    padding: 16,
  },
  focusAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: NAVY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  focusAvatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 20,
  },
  focusName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
  },
  focusSubtext: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
  currentStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 18,
  },
  currentStatusPillLabel: {
    fontSize: 12,
    color: '#666666',
  },
  statusIndicator: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  statusIndicatorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  bigActionRow: {
    flexDirection: 'row',
    gap: 14,
    width: '100%',
    marginBottom: 14,
  },
  bigActionRowMobile: {
    gap: 10,
  },
  bigBtn: {
    flex: 1,
    paddingVertical: 14,
    minHeight: 58,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  bigBtnMobile: {
    paddingVertical: 12,
    minHeight: 52,
    borderRadius: 10,
    gap: 4,
  },
  bigBtnPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  bigBtnPresente: {
    backgroundColor: GREEN,
  },
  bigBtnAusente: {
    backgroundColor: RED,
  },
  bigBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bigBtnTextMobile: {
    fontSize: 13,
    fontWeight: '700',
  },
  btnExcusaSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
    marginBottom: 16,
  },
  btnExcusaSecondaryText: {
    fontSize: 13,
    color: '#333333',
    fontWeight: '500',
  },
  navControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#D5D5D5',
    paddingTop: 12,
  },
  navStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  navStepBtnDisabled: {
    opacity: 0.4,
  },
  navStepText: {
    fontSize: 13,
    color: NAVY,
    fontWeight: '600',
  },
  navStepTextDisabled: {
    color: '#AAAAAA',
  },
  // Completion Card
  completionCard: {
    backgroundColor: '#E5E5E5',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
  },
  celebrationIconWrap: {
    marginBottom: 12,
  },
  completionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
  },
  completionSubtext: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  summaryBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 24,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 22,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  completionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  btnResetStep: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  btnResetStepText: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '500',
  },
  btnGoMatrix: {
    backgroundColor: NAVY,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  btnGoMatrixText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Common Stats Card
  statsCard: {
    backgroundColor: '#E5E5E5',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 12,
  },
  statMetricItem: {
    alignItems: 'center',
    minWidth: 70,
  },
  statMetricNumber: {
    fontSize: 22,
    fontWeight: '700',
  },
  statMetricLabel: {
    fontSize: 12,
    color: '#555555',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#CCCCCC',
  },
  // List Mode
  listSection: {},
  filterRow: {
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
  },
  cardsList: {
    gap: 12,
  },
  apprenticeCard: {
    backgroundColor: '#E5E5E5',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  cardInfoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: NAVY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  apprenticeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  apprenticeDoc: {
    fontSize: 12,
    color: '#666666',
  },
  stateButtonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  stateBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  stateBtnPresente: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  stateBtnAusente: {
    backgroundColor: RED,
    borderColor: RED,
  },
  stateBtnExcusa: {
    backgroundColor: YELLOW,
    borderColor: YELLOW,
  },
  stateBtnText: {
    fontSize: 12,
    color: '#333333',
  },
  stateBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Table Matrix Mode
  tableCard: {
    backgroundColor: '#E5E5E5',
    borderRadius: 16,
    padding: 18,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
  },
  nameHeaderCell: {
    flex: 2,
    textAlign: 'left',
  },
  hoyHeaderCell: {
    flex: 1.5,
  },
  tableDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  nameDataCell: {
    flex: 2,
    fontSize: 13,
    color: '#000000',
    fontWeight: '500',
  },
  historyCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hoyCell: {
    flex: 1.5,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hoyCellText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
