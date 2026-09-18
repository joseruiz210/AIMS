import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NAVY = '#12103C';
const GOLD = '#cfa235';

type DiaKey = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes';

interface ClassDetail {
  subject: string;
  code: string;
  instructor: string;
  aula: string;
  sede: string;
  color: string;
  bg: string;
  textColor: string;
  icon: any;
}

const SUBJECT_DETAILS: Record<string, ClassDetail> = {};

interface ScheduleRow {
  time: string;
  block: string;
  lunes: string;
  martes: string;
  miercoles: string;
  jueves: string;
  viernes: string;
}

const scheduleData: ScheduleRow[] = [];

const DAYS: { key: DiaKey; label: string; short: string }[] = [
  { key: 'lunes', label: 'Lunes', short: 'LUN' },
  { key: 'martes', label: 'Martes', short: 'MAR' },
  { key: 'miercoles', label: 'Miércoles', short: 'MIÉ' },
  { key: 'jueves', label: 'Jueves', short: 'JUE' },
  { key: 'viernes', label: 'Viernes', short: 'VIE' },
];

export default function HorarioAprendiz() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState<{ time: string; subject: string; day: string } | null>(null);

  // Estados interactivos
  const [viewMode, setViewMode] = useState<'grid' | 'agenda'>(isDesktop ? 'grid' : 'agenda');
  const [activeDay, setActiveDay] = useState<DiaKey>('miercoles'); // Por defecto día actual
  const [selectedFilterSubject, setSelectedFilterSubject] = useState<string>('Todas');

  const handleOpenClass = (time: string, subject: string, day: string) => {
    if (!subject) return;
    setSelectedClass({ time, subject, day });
    setModalVisible(true);
  };

  const pad = isDesktop ? 24 : 14;

  // Clases filtradas para modo agenda
  const agendaClasses = scheduleData
    .map((row) => ({
      time: row.time,
      block: row.block,
      subject: row[activeDay],
    }))
    .filter((c) => c.subject && (selectedFilterSubject === 'Todas' || c.subject === selectedFilterSubject));

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { padding: pad, paddingTop: isDesktop ? 32 : 20 }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Mi Horario de Formación</Text>
          <Text style={styles.pageSubtitle}>
            Jornada de Formación • Horario Académico SENA
          </Text>
        </View>

        {/* View mode toggle */}
        <View style={styles.viewToggleWrap}>
          <Pressable
            style={[styles.toggleBtn, viewMode === 'grid' && styles.toggleBtnActive]}
            onPress={() => setViewMode('grid')}
          >
            <Ionicons name="grid-outline" size={15} color={viewMode === 'grid' ? '#FFFFFF' : NAVY} style={{ marginRight: 6 }} />
            <Text style={[styles.toggleBtnText, viewMode === 'grid' && styles.toggleBtnTextActive]}>Grilla</Text>
          </Pressable>

          <Pressable
            style={[styles.toggleBtn, viewMode === 'agenda' && styles.toggleBtnActive]}
            onPress={() => setViewMode('agenda')}
          >
            <Ionicons name="list-outline" size={15} color={viewMode === 'agenda' ? '#FFFFFF' : NAVY} style={{ marginRight: 6 }} />
            <Text style={[styles.toggleBtnText, viewMode === 'agenda' && styles.toggleBtnTextActive]}>Agenda</Text>
          </Pressable>
        </View>
      </View>

      {/* Summary KPI Cards */}
      <View style={[styles.summaryContainer, !isDesktop && styles.summaryContainerMobile]}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryCardHeader}>
            <Text style={styles.summaryLabel}>TOTAL SEMANAL</Text>
            <Ionicons name="time-outline" size={16} color={GOLD} />
          </View>
          <Text style={[styles.summaryValue, { color: NAVY }]}>{scheduleData.length * 2} Horas</Text>
          <Text style={styles.summarySubtext}>{scheduleData.length > 0 ? 'Horas programadas' : 'Sin horas asignadas'}</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryCardHeader}>
            <Text style={styles.summaryLabel}>MATERIAS ACTIVAS</Text>
            <Ionicons name="book-outline" size={16} color="#3B82F6" />
          </View>
          <Text style={[styles.summaryValue, { color: '#2563EB' }]}>{Object.keys(SUBJECT_DETAILS).length}</Text>
          <Text style={styles.summarySubtext}>Competencias técnicas</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryCardHeader}>
            <Text style={styles.summaryLabel}>CLASES HOY ({DAYS.find((d) => d.key === activeDay)?.short || 'HOY'})</Text>
            <Ionicons name="calendar-outline" size={16} color="#059669" />
          </View>
          <Text style={[styles.summaryValue, { color: '#059669' }]}>{agendaClasses.length} Sesiones</Text>
          <Text style={styles.summarySubtext}>{agendaClasses.length > 0 ? 'Sesiones programadas' : 'Sin clases registradas'}</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryCardHeader}>
            <Text style={styles.summaryLabel}>MODALIDAD</Text>
            <Ionicons name="business-outline" size={16} color={GOLD} />
          </View>
          <Text style={[styles.summaryValue, { color: GOLD }]}>Presencial</Text>
          <Text style={styles.summarySubtext}>Sede SENA CTMA</Text>
        </View>
      </View>

      {/* Subject Filter Pills */}
      {Object.keys(SUBJECT_DETAILS).length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Filtrar Materia:</Text>
            {['Todas', ...Object.keys(SUBJECT_DETAILS)].map((subj) => {
              const isSelected = selectedFilterSubject === subj;
              const detail = SUBJECT_DETAILS[subj];
              return (
                <Pressable
                  key={subj}
                  style={[
                    styles.filterPill,
                    isSelected && styles.filterPillActive,
                    isSelected && detail && { backgroundColor: detail.color, borderColor: detail.color },
                  ]}
                  onPress={() => setSelectedFilterSubject(subj)}
                >
                  {detail ? (
                    <View style={[styles.filterDot, { backgroundColor: isSelected ? '#FFFFFF' : detail.color }]} />
                  ) : null}
                  <Text style={[styles.filterPillText, isSelected && styles.filterPillTextActive]}>
                    {subj}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* View: Grid Mode */}
      {viewMode === 'grid' ? (
        scheduleData.length === 0 ? (
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 36, alignItems: 'center', borderWidth: 1, borderColor: '#D0D8E4', marginBottom: 20 }}>
            <Ionicons name="calendar-outline" size={48} color="#94A3B8" style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 16, fontWeight: '700', color: NAVY }}>Sin horario programado</Text>
            <Text style={{ fontSize: 13, color: '#64748B', marginTop: 4, textAlign: 'center', maxWidth: 400 }}>
              Aún no hay materias ni bloques de horario configurados para tu ficha de formación.
            </Text>
          </View>
        ) : (
        <ScrollView horizontal={!isDesktop} showsHorizontalScrollIndicator={false}>
          <View style={[styles.gridTable, !isDesktop && { minWidth: 780 }]}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={styles.headerTimeCell}>
                <Ionicons name="time" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.headerCellText}>HORA</Text>
              </View>

              {DAYS.map((d) => {
                const isToday = d.key === activeDay;
                return (
                  <View key={d.key} style={[styles.headerDayCell, isToday && styles.headerDayCellToday]}>
                    <Text style={styles.headerCellText}>{d.label.toUpperCase()}</Text>
                    {isToday && (
                      <View style={styles.todayBadge}>
                        <Text style={styles.todayBadgeText}>HOY</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Table Rows */}
            {scheduleData.map((row, index) => (
              <View key={index} style={styles.tableRow}>
                {/* Time block */}
                <View style={styles.timeCell}>
                  <Text style={styles.timeBlockTitle}>{row.block}</Text>
                  <Text style={styles.timeText}>{row.time}</Text>
                </View>

                {/* Day columns */}
                {DAYS.map((d) => {
                  const subjectName = row[d.key];
                  const detail = SUBJECT_DETAILS[subjectName];
                  const isFiltered =
                    selectedFilterSubject !== 'Todas' && subjectName !== selectedFilterSubject;
                  const isToday = d.key === activeDay;

                  return (
                    <View
                      key={d.key}
                      style={[
                        styles.subjectCell,
                        isToday && styles.subjectCellToday,
                        isFiltered && { opacity: 0.25 },
                      ]}
                    >
                      {subjectName && detail ? (
                        <Pressable
                          style={({ hovered }: any) => [
                            styles.subjectBlock,
                            {
                              backgroundColor: detail.bg,
                              borderLeftColor: detail.color,
                            },
                            hovered && styles.subjectBlockHover,
                          ]}
                          onPress={() => handleOpenClass(row.time, subjectName, d.label)}
                        >
                          <View style={styles.cardTopRow}>
                            <View style={[styles.iconCircle, { backgroundColor: detail.color + '22' }]}>
                              <Ionicons name={detail.icon} size={14} color={detail.color} />
                            </View>
                            <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
                          </View>

                          <Text style={[styles.subjectNameText, { color: NAVY }]} numberOfLines={2}>
                            {detail.subject}
                          </Text>

                          <View style={styles.cardMetaRow}>
                            <Ionicons name="location-outline" size={12} color="#64748B" style={{ marginRight: 3 }} />
                            <Text style={styles.aulaShortText} numberOfLines={1}>
                              {detail.aula.split('•')[0]}
                            </Text>
                          </View>

                          <View style={styles.instructorTag}>
                            <Ionicons name="person-outline" size={11} color="#475569" style={{ marginRight: 3 }} />
                            <Text style={styles.instructorShortText} numberOfLines={1}>
                              {detail.instructor}
                            </Text>
                          </View>
                        </Pressable>
                      ) : (
                        <View style={styles.emptyBlock}>
                          <Text style={styles.emptyBlockText}>Libre</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
        )
      ) : (
        /* View: Agenda / Day by Day */
        <View style={styles.agendaContainer}>
          {/* Day Selector Pills */}
          <View style={styles.daySelectorRow}>
            {DAYS.map((d) => {
              const isActive = activeDay === d.key;
              return (
                <Pressable
                  key={d.key}
                  style={[styles.dayTab, isActive && styles.dayTabActive]}
                  onPress={() => setActiveDay(d.key)}
                >
                  <Text style={[styles.dayTabShort, isActive && styles.dayTabShortActive]}>{d.short}</Text>
                  <Text style={[styles.dayTabName, isActive && styles.dayTabNameActive]}>{d.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Classes for the day */}
          <Text style={styles.agendaDayHeading}>
            Clases del {DAYS.find((d) => d.key === activeDay)?.label}
          </Text>

          {agendaClasses.length === 0 ? (
            <View style={styles.emptyAgendaBox}>
              <Ionicons name="sunny-outline" size={40} color={GOLD} />
              <Text style={styles.emptyAgendaTitle}>Sin clases programadas</Text>
              <Text style={styles.emptyAgendaSubtext}>No hay actividades registradas para este día.</Text>
            </View>
          ) : (
            <View style={styles.agendaList}>
              {agendaClasses.map((item, idx) => {
                const detail = SUBJECT_DETAILS[item.subject];
                if (!detail) return null;

                return (
                  <Pressable
                    key={idx}
                    style={({ hovered }: any) => [
                      styles.agendaCard,
                      { borderLeftColor: detail.color },
                      hovered && styles.agendaCardHover,
                    ]}
                    onPress={() => handleOpenClass(item.time, item.subject, DAYS.find((d) => d.key === activeDay)?.label || '')}
                  >
                    <View style={styles.agendaTimeCol}>
                      <Text style={styles.agendaBlockLabel}>{item.block}</Text>
                      <Text style={styles.agendaTimeText}>{item.time}</Text>
                    </View>

                    <View style={styles.agendaContentCol}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={[styles.iconCircle, { backgroundColor: detail.color + '22' }]}>
                          <Ionicons name={detail.icon} size={14} color={detail.color} />
                        </View>
                        <Text style={styles.agendaSubjectTitle}>{detail.subject}</Text>
                      </View>

                      <View style={styles.agendaDetailsRow}>
                        <View style={styles.agendaDetailItem}>
                          <Ionicons name="location-outline" size={14} color="#64748B" style={{ marginRight: 4 }} />
                          <Text style={styles.agendaDetailText}>{detail.aula}</Text>
                        </View>

                        <View style={styles.agendaDetailItem}>
                          <Ionicons name="person-outline" size={14} color="#64748B" style={{ marginRight: 4 }} />
                          <Text style={styles.agendaDetailText}>{detail.instructor}</Text>
                        </View>
                      </View>
                    </View>

                    <Ionicons name="chevron-forward-outline" size={20} color="#94A3B8" />
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* Interactive Detail Modal */}
      {selectedClass && (
        <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalBox, !isDesktop && styles.modalBoxMobile]}>
              {(() => {
                const detail = SUBJECT_DETAILS[selectedClass.subject];
                return (
                  <>
                    <View style={[styles.modalHeader, { backgroundColor: detail?.bg || '#F8FAFC' }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                        <View style={[styles.modalIconWrap, { backgroundColor: detail?.color || NAVY }]}>
                          <Ionicons name={detail?.icon || 'calendar'} size={20} color="#FFFFFF" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.modalSubjectTitle}>{selectedClass.subject}</Text>
                          <Text style={[styles.modalCodeText, { color: detail?.textColor || '#64748B' }]}>
                            {detail?.code || 'Competencia Técnica'}
                          </Text>
                        </View>
                      </View>
                      <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                        <Ionicons name="close" size={20} color="#64748B" />
                      </Pressable>
                    </View>

                    <View style={styles.modalBody}>
                      <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={18} color={GOLD} style={{ marginRight: 10 }} />
                        <View>
                          <Text style={styles.detailLabel}>DÍA Y HORARIO</Text>
                          <Text style={styles.detailValue}>
                            {selectedClass.day} • {selectedClass.time}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.detailRow}>
                        <Ionicons name="person-outline" size={18} color="#2563EB" style={{ marginRight: 10 }} />
                        <View>
                          <Text style={styles.detailLabel}>INSTRUCTOR A CARGO</Text>
                          <Text style={styles.detailValue}>{detail?.instructor}</Text>
                        </View>
                      </View>

                      <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={18} color="#059669" style={{ marginRight: 10 }} />
                        <View>
                          <Text style={styles.detailLabel}>AMBIENTE Y SEDE</Text>
                          <Text style={styles.detailValue}>
                            {detail?.aula} ({detail?.sede})
                          </Text>
                        </View>
                      </View>

                      <View style={styles.detailRow}>
                        <Ionicons name="information-circle-outline" size={18} color="#8B5CF6" style={{ marginRight: 10 }} />
                        <View>
                          <Text style={styles.detailLabel}>MODALIDAD FORMATIVA</Text>
                          <Text style={styles.detailValue}>Presencial • Asistencia Registrada en AIMS</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.modalFooter}>
                      <Pressable
                        style={({ hovered }: any) => [styles.modalActionBtn, hovered && styles.modalActionBtnHover]}
                        onPress={() => setModalVisible(false)}
                      >
                        <Text style={styles.modalActionBtnText}>Entendido</Text>
                      </Pressable>
                    </View>
                  </>
                );
              })()}
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
    backgroundColor: '#F4F6F9',
  },
  content: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 14,
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
  viewToggleWrap: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: '#D0D8E4',
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: NAVY,
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Summary Metrics
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  summaryContainerMobile: {
    flexDirection: 'column',
  },
  summaryCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D0D8E4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  summaryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 12,
    color: '#94A3B8',
  },
  // Filter row
  filterScrollView: {
    marginBottom: 20,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginRight: 4,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D0D8E4',
  },
  filterPillActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Grid Mode Table
  gridTable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D0D8E4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: NAVY,
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 10,
  },
  headerTimeCell: {
    width: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerDayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  headerDayCellToday: {
    backgroundColor: 'rgba(207, 162, 53, 0.25)',
    borderRadius: 8,
    paddingVertical: 4,
  },
  headerCellText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  todayBadge: {
    backgroundColor: GOLD,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  todayBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 10,
    minHeight: 110,
  },
  timeCell: {
    width: 120,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeBlockTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: NAVY,
    textAlign: 'center',
  },
  subjectCell: {
    flex: 1,
    marginHorizontal: 4,
  },
  subjectCellToday: {
    backgroundColor: 'rgba(207, 162, 53, 0.04)',
    borderRadius: 12,
  },
  subjectBlock: {
    flex: 1,
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 10,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subjectBlockHover: {
    transform: [{ translateY: -2 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subjectNameText: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  aulaShortText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  instructorTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 5,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  instructorShortText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },
  emptyBlock: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyBlockText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  // Agenda Mode Styles
  agendaContainer: {
    gap: 16,
  },
  daySelectorRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  dayTab: {
    flex: 1,
    minWidth: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D0D8E4',
  },
  dayTabActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  dayTabShort: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  dayTabShortActive: {
    color: GOLD,
  },
  dayTabName: {
    fontSize: 13,
    fontWeight: '700',
    color: NAVY,
    marginTop: 2,
  },
  dayTabNameActive: {
    color: '#FFFFFF',
  },
  agendaDayHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: NAVY,
    marginTop: 8,
  },
  agendaList: {
    gap: 12,
  },
  agendaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D0D8E4',
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    gap: 14,
  },
  agendaCardHover: {
    borderColor: GOLD,
  },
  agendaTimeCol: {
    width: 100,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    paddingRight: 10,
  },
  agendaBlockLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  agendaTimeText: {
    fontSize: 13,
    fontWeight: '700',
    color: NAVY,
    marginTop: 2,
  },
  agendaContentCol: {
    flex: 1,
    gap: 6,
  },
  agendaSubjectTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: NAVY,
  },
  agendaDetailsRow: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
  },
  agendaDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agendaDetailText: {
    fontSize: 12,
    color: '#64748B',
  },
  emptyAgendaBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D0D8E4',
    gap: 8,
  },
  emptyAgendaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: NAVY,
    marginTop: 6,
  },
  emptyAgendaSubtext: {
    fontSize: 13,
    color: '#64748B',
  },
  // Modal Styles
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
    maxWidth: 520,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  modalBoxMobile: {
    width: '95%',
    maxWidth: '95%',
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSubjectTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: NAVY,
  },
  modalCodeText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  modalBody: {
    padding: 22,
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: NAVY,
    marginTop: 2,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'flex-end',
  },
  modalActionBtn: {
    backgroundColor: NAVY,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  modalActionBtnHover: {
    backgroundColor: '#1E1B58',
  },
  modalActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
