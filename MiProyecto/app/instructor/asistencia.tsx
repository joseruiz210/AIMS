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
import { fichasService, Ficha } from '../../services/fichasService';
import { asistenciaService } from '../../services/asistenciaService';

const NAVY = '#12103C';
const GOLD = '#cfa235';
const GREEN = '#2ECC71';
const RED = '#E74C3C';
const YELLOW = '#F1C40F';

type AttendanceState = 'presente' | 'ausente' | 'excusa';
type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

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

const toLocalIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const AUTO_SAVE_DEBOUNCE_MS = 800;

export default function AsistenciaAnimatedScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isSmallPhone = width < 400;

  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [apprentices, setApprentices] = useState<ApprenticeAttendance[]>([]);
  const [fichaId, setFichaId] = useState<string>('');
  const [fichaNumero, setFichaNumero] = useState<string>('2670142');
  const [programaNombre, setProgramaNombre] = useState<string>('ADSO');
  const [loading, setLoading] = useState(true);
  const [loadingDate, setLoadingDate] = useState(false);
  const dateRequestId = useRef(0);

  const dateOptions = React.useMemo(() => {
    const today = new Date();
    return [0, 1, 2, 3].map(offset => {
      const d = new Date(today);
      d.setDate(today.getDate() - offset);
      const iso = toLocalIsoDate(d);
      const dayName = offset === 0 ? 'Hoy' : offset === 1 ? 'Ayer' : d.toLocaleDateString('es-CO', { weekday: 'short' });
      const dayNum = d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
      return {
        iso,
        label: `${dayName} (${dayNum})`,
        shortLabel: dayNum,
      };
    });
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(toLocalIsoDate(new Date()));
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | AttendanceState>('todos');
  const [viewMode, setViewMode] = useState<'uno-por-uno' | 'tarjetas' | 'matriz'>('uno-por-uno');

  // Tema de la sesión: obligatorio para poder autoguardar
  const [tema, setTema] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>('idle');
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextAutoSave = useRef(false);

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

  const handleSelectFicha = async (targetFicha: Ficha) => {
    setFichaId(targetFicha.id);
    setFichaNumero(targetFicha.numero);
    setProgramaNombre(targetFicha.programaNombre || 'Formación SENA');
    setCurrentIndex(0);
    setLoadingDate(true);
    try {
      const detail = await fichasService.getFichaById(targetFicha.id);
      if (detail && detail.matriculas && detail.matriculas.length > 0) {
        const list: ApprenticeAttendance[] = detail.matriculas.map((m: any) => {
          const a = m.aprendiz;
          const fullName = `${a.firstName} ${a.lastName || ''}`.trim();
          const initials = `${a.firstName?.[0] || 'A'}${a.lastName?.[0] || 'P'}`.toUpperCase();
          return {
            id: a.id,
            name: fullName,
            doc: a.documentNumber || a.phone || a.id.slice(0, 8),
            ficha: targetFicha.numero,
            initials,
            status: 'presente',
            history: [],
          };
        });
        await fetchAttendanceForDate(targetFicha.id, selectedDate, list);
      } else {
        setApprentices([]);
      }
      showToast(`Ficha activa: ${targetFicha.numero}`);
    } catch (err: any) {
      console.error('Error al cambiar de ficha:', err);
      showToast(`⚠️ Error al cargar la ficha ${targetFicha.numero}`);
    } finally {
      setLoadingDate(false);
    }
  };

  const fetchAttendanceForDate = async (currentFichaId: string, isoDate: string, currentList?: ApprenticeAttendance[]) => {
    const prevRecords = await asistenciaService.getAsistenciasByFicha(currentFichaId, isoDate);
    const prevMap = new Map<string, string>();
    prevRecords.forEach(r => prevMap.set(r.aprendizId, r.estado));

    // Si ya existe una sesión guardada para esta fecha, recuperamos su tema.
    // Si no existe, se limpia para que el instructor defina uno nuevo antes
    // de que se dispare el autoguardado.
    const temaExistente = prevRecords.find(r => r.tema)?.tema || '';
    skipNextAutoSave.current = true;
    setTema(temaExistente);
    setAutoSaveStatus('idle');

    setApprentices(prev => {
      const base = currentList || prev;
      return base.map(a => {
        const prevStatus = prevMap.get(a.id);
        let st: AttendanceState = 'presente';
        if (prevStatus === 'AUSENTE') st = 'ausente';
        else if (prevStatus === 'EXCUSA' || prevStatus === 'EXCUSADO') st = 'excusa';
        return { ...a, status: st };
      });
    });
  };

  const handleSelectDate = async (isoDate: string) => {
    const requestId = ++dateRequestId.current;
    setSelectedDate(isoDate);
    setCurrentIndex(0);
    fadeAnim.setValue(1);
    scaleAnim.setValue(1);

    if (fichaId) {
      setLoadingDate(true);
      try {
        await fetchAttendanceForDate(fichaId, isoDate);
        if (requestId === dateRequestId.current) {
          showToast(`Sesión: ${isoDate}`);
        }
      } catch (err: any) {
        console.error('Error al obtener asistencias por fecha:', err);
        showToast(`⚠️ ${err.message || 'No se pudo cargar la fecha seleccionada'}`);
      } finally {
        if (requestId === dateRequestId.current) {
          setLoadingDate(false);
        }
      }
    }
  };

  const loadApprenticesFromDb = async () => {
    setLoading(true);
    try {
      const fichasData = await fichasService.getFichas();
      setFichas(fichasData);
      if (fichasData.length > 0) {
        const targetFicha = fichasData[0];
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
              doc: a.documentNumber || a.phone || a.id.slice(0, 8),
              ficha: targetFicha.numero,
              initials,
              status: 'presente',
              history: [],
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

  // ---- Autoguardado ----
  // Cualquier cambio en la lista de aprendices o en el tema dispara un
  // guardado con debounce, en vez del botón manual "Guardar en BD".
  // No se guarda nada mientras no haya un tema definido: eso evita crear
  // sesiones vacías en la BD apenas se abre la pantalla.
  useEffect(() => {
    if (loading || !fichaId || apprentices.length === 0) return;

    if (skipNextAutoSave.current) {
      // Este cambio vino de cargar datos desde la BD (cambio de fecha /
      // carga inicial), no de una acción del instructor: no reprogramar guardado.
      skipNextAutoSave.current = false;
      return;
    }

    if (!tema.trim()) {
      setAutoSaveStatus('idle');
      return;
    }

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      runAutoSave();
    }, AUTO_SAVE_DEBOUNCE_MS);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apprentices, tema]);

  const runAutoSave = async () => {
    if (!fichaId || apprentices.length === 0 || !tema.trim()) return;
    setAutoSaveStatus('saving');
    try {
      const payload = {
        fichaId,
        fecha: selectedDate,
        tema: tema.trim(),
        asistencias: apprentices.map(a => ({
          aprendizId: a.id,
          estado: a.status === 'presente' ? 'PRESENTE' : a.status === 'ausente' ? 'AUSENTE' : 'EXCUSA',
          observacion: a.note || undefined,
        })),
      };

      await asistenciaService.registrarAsistencia(payload);
      setAutoSaveStatus('saved');
    } catch (err: any) {
      console.error('Error en autoguardado de asistencia:', err);
      setAutoSaveStatus('error');
      showToast('⚠️ ' + (err.message || 'No se pudo autoguardar la asistencia'));
    }
  };

  // Animate progress bar width smooth transition
  useEffect(() => {
    const targetProgress = Math.min(100, (currentIndex / total) * 100);
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

  const autoSaveLabel =
    autoSaveStatus === 'saving'
      ? 'Guardando...'
      : autoSaveStatus === 'saved'
      ? 'Guardado'
      : autoSaveStatus === 'error'
      ? 'Error al guardar'
      : !tema.trim()
      ? 'Escribe el tema para guardar'
      : 'Sin cambios';

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
        </View>
      </View>

      {/* Selector de Ficha Activa para el Instructor */}
      {fichas.length > 0 && (
        <View style={styles.fichaSelectorBar}>
          <Text style={styles.fichaSelectorLabel}>Ficha:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {fichas.map(f => {
              const isSelected = f.id === fichaId;
              return (
                <Pressable
                  key={f.id}
                  style={[styles.fichaChip, isSelected && styles.fichaChipActive]}
                  onPress={() => handleSelectFicha(f)}
                >
                  <Ionicons name="school-outline" size={14} color={isSelected ? '#FFFFFF' : NAVY} />
                  <Text style={[styles.fichaChipText, isSelected && styles.fichaChipTextActive]}>
                    {f.numero || f.codigo} {f.programaNombre ? `(${f.programaNombre})` : ''}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Tema de la sesión + estado de autoguardado (reemplaza el botón "Guardar en BD") */}
      <View style={styles.temaBar}>
        <Ionicons name="book-outline" size={18} color={NAVY} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.temaInput}
          placeholder="Tema de la sesión de hoy (obligatorio para guardar)"
          placeholderTextColor="#999999"
          value={tema}
          onChangeText={setTema}
        />
        <View style={styles.autoSaveBadge}>
          {autoSaveStatus === 'saving' && <ActivityIndicator size="small" color={NAVY} style={{ marginRight: 6 }} />}
          {autoSaveStatus === 'saved' && <Ionicons name="checkmark-circle" size={16} color={GREEN} style={{ marginRight: 4 }} />}
          {autoSaveStatus === 'error' && <Ionicons name="alert-circle" size={16} color={RED} style={{ marginRight: 4 }} />}
          <Text
            style={[
              styles.autoSaveBadgeText,
              autoSaveStatus === 'saved' && { color: GREEN },
              autoSaveStatus === 'error' && { color: RED },
            ]}
          >
            {autoSaveLabel}
          </Text>
        </View>
      </View>

      {/* Quick Date Selector & Mass Actions */}
      <View style={styles.quickActionBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
          {dateOptions.map((d, i) => (
            <Pressable
              key={i}
              style={[
                styles.dateChip,
                selectedDate === d.iso && styles.dateChipActive,
                loadingDate && styles.dateChipDisabled,
              ]}
              onPress={() => handleSelectDate(d.iso)}
              disabled={loadingDate}
            >
              <Text style={[styles.dateChipText, selectedDate === d.iso && styles.dateChipTextActive]}>
                {d.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.massBtnGroup}>
          <Pressable style={styles.btnMassPresent} onPress={handleMarkAllPresent}>
            <Ionicons name="flash-outline" size={16} color="#FFFFFF" />
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
  // Tema de la sesión + badge de autoguardado
  temaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
    gap: 8,
  },
  temaInput: {
    flex: 1,
    minWidth: 180,
    fontSize: 14,
    color: '#000000',
  },
  autoSaveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  autoSaveBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
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
  dateChipDisabled: {
    opacity: 0.55,
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
  fichaSelectorBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  fichaSelectorLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: NAVY,
    marginRight: 10,
  },
  fichaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
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
    color: NAVY,
    marginLeft: 6,
  },
  fichaChipTextActive: {
    color: '#FFFFFF',
  },
});
