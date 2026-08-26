import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ActionModal from '../../components/ActionModal';

const NAVY = '#12103C';
const GOLD = '#cfa235';

type DiaKey = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes';

interface ScheduleRow {
  time: string;
  lunes: string;
  martes: string;
  miercoles: string;
  jueves: string;
  viernes: string;
}

const scheduleData: ScheduleRow[] = [
  {
    time: '07:00 - 09:00',
    lunes: 'Analisis de Datos',
    martes: 'Programación BD',
    miercoles: 'POO',
    jueves: 'Requisitos',
    viernes: 'Seguridad Informática',
  },
  {
    time: '09:00 - 11:00',
    lunes: 'Seguridad Informática',
    martes: 'Analisis de Datos',
    miercoles: 'Programación BD',
    jueves: 'POO',
    viernes: 'Programación BD',
  },
  {
    time: '11:00 - 01:00',
    lunes: 'Programación BD',
    martes: 'Requisitos',
    miercoles: 'Analisis de Datos',
    jueves: 'Programación BD',
    viernes: 'Requisitos',
  },
  {
    time: '01:00 - 04:00',
    lunes: '',
    martes: '',
    miercoles: '',
    jueves: '',
    viernes: '',
  },
];

const instructores: Record<string, string> = {
  'Analisis de Datos': 'Roberto Vargas — Aula 201',
  'Programación BD': 'Ana Martínez — Aula 305',
  'POO': 'Carmen López — Aula 102',
  'Requisitos': 'Juan Pérez — Aula 204',
  'Seguridad Informática': 'Luis Gómez — Lab. Sistemas',
};

const DAYS: { key: DiaKey; label: string }[] = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
];

export default function HorarioAprendiz() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState<{ time: string; subject: string } | null>(null);

  const handleOpenClass = (time: string, subject: string) => {
    if (!subject) return;
    setSelectedClass({ time, subject });
    setModalVisible(true);
  };

  const renderDesktopView = () => (
    <View style={styles.desktopContainer}>
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, { flex: 1 }]}>HORA</Text>
        {DAYS.map((d) => (
          <Text key={d.key} style={[styles.headerCell, { flex: 1 }]}>{d.label.toUpperCase()}</Text>
        ))}
      </View>

      {scheduleData.map((row, index) => (
        <View key={index} style={styles.tableRow}>
          <View style={styles.timeCell}>
            <Text style={styles.timeText}>{row.time}</Text>
          </View>
          {DAYS.map((d) => {
            const subject = row[d.key];
            return (
              <View key={d.key} style={styles.subjectCell}>
                {subject ? (
                  <Pressable
                    style={({ hovered }: any) => [styles.subjectBlock, hovered && styles.subjectBlockHover]}
                    onPress={() => handleOpenClass(row.time, subject)}
                  >
                    <Text style={styles.subjectText}>{subject}</Text>
                    <Ionicons name="information-circle-outline" size={14} color={GOLD} style={{ marginTop: 6 }} />
                  </Pressable>
                ) : (
                  <View style={styles.emptyBlock} />
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );

  const renderMobileView = () => (
    <View style={styles.mobileContainer}>
      {DAYS.map((d) => {
        const clases = scheduleData.filter((row) => row[d.key]);
        if (clases.length === 0) return null;
        return (
          <View key={d.key} style={styles.mobileCard}>
            <Text style={styles.mobileDayTitle}>{d.label}</Text>
            {clases.map((row, idx) => {
              const subject = row[d.key];
              if (!subject) return null;
              return (
                <Pressable
                  key={idx}
                  style={({ hovered }: any) => [styles.mobileRow, hovered && styles.mobileRowHover]}
                  onPress={() => handleOpenClass(row.time, subject)}
                >
                  <Text style={styles.mobileTime}>{row.time}</Text>
                  <View style={styles.mobileSubjectBtn}>
                    <Text style={styles.mobileSubjectBtnText}>{subject}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        );
      })}
    </View>
  );

  const pad = isDesktop ? 24 : 14;

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { padding: pad, paddingTop: isDesktop ? 32 : 20 }]}>
      <Text style={styles.pageTitle}>Mi Horario</Text>
      <Text style={styles.pageSubtitle}>Consulta tus clases programadas. Toca una clase para ver los detalles.</Text>

      {isDesktop ? renderDesktopView() : renderMobileView()}

      {selectedClass && (
        <ActionModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title="Detalle de Clase"
          subtitle={`${selectedClass.subject} • ${selectedClass.time}`}
          iconName="calendar-outline"
          confirmText="Aceptar"
          fields={[
            { label: 'Competencia', placeholder: selectedClass.subject },
            { label: 'Horario', placeholder: selectedClass.time },
            { label: 'Instructor / Aula', placeholder: instructores[selectedClass.subject] ?? 'Por confirmar' },
          ]}
        />
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
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: NAVY,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 28,
  },
  // Desktop Styles
  desktopContainer: {
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: NAVY,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  headerCell: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 10,
  },
  timeCell: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#D0D8E4',
  },
  timeText: {
    fontSize: 13,
    color: NAVY,
    fontWeight: '600',
  },
  subjectCell: {
    flex: 1,
  },
  subjectBlock: {
    backgroundColor: 'rgba(207, 162, 53, 0.1)',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    height: '100%',
    minHeight: 90,
  },
  subjectBlockHover: {
    backgroundColor: 'rgba(207, 162, 53, 0.22)',
  },
  emptyBlock: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    height: '100%',
    minHeight: 90,
    borderWidth: 1,
    borderColor: '#D0D8E4',
    borderStyle: 'dashed',
  },
  subjectText: {
    fontSize: 13,
    color: NAVY,
    textAlign: 'center',
    fontWeight: '600',
  },
  // Mobile Styles
  mobileContainer: {
    width: '100%',
    gap: 16,
  },
  mobileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#D0D8E4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
  },
  mobileDayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: NAVY,
    marginBottom: 16,
  },
  mobileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 10,
  },
  mobileRowHover: {
    opacity: 0.85,
  },
  mobileTime: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
    fontWeight: '500',
  },
  mobileSubjectBtn: {
    backgroundColor: GOLD,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    flex: 1.5,
    alignItems: 'center',
  },
  mobileSubjectBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});



