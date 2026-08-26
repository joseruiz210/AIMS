import React from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NAVY = '#12103C';
const GOLD = '#cfa235';

const scheduleData = [
  {
    time: '07:00 - 09:00',
    lunes: 'Analisis de Datos',
    martes: 'Programación BD',
    miercoles: 'POO',
    jueves: 'Requisitos',
    viernes: 'Seguridad informatica'
  },
  {
    time: '09:00 - 11:00',
    lunes: 'Seguridad informatica',
    martes: 'Analisis de Datos',
    miercoles: 'Programación BD',
    jueves: 'POO',
    viernes: 'Programación BD'
  },
  {
    time: '11:00 - 01:00',
    lunes: 'Programación BD',
    martes: 'Requisitos',
    miercoles: 'Analisis de Datos',
    jueves: 'Programación BD',
    viernes: 'Requisitos'
  },
  {
    time: '01:00 - 04:00',
    lunes: '',
    martes: '',
    miercoles: '',
    jueves: '',
    viernes: ''
  }
];

export default function HorarioAprendiz() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const renderDesktopView = () => (
    <View style={styles.desktopContainer}>
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, { flex: 1 }]}>HORA</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>LUNES</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>MARTES</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>MIERCOLES</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>JUEVES</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>VIERNES</Text>
      </View>
      
      {scheduleData.map((row, index) => (
        <View key={index} style={styles.tableRow}>
          <View style={styles.timeCell}>
            <Text style={styles.timeText}>{row.time}</Text>
          </View>
          <View style={styles.subjectCell}>
            {row.lunes ? <View style={styles.subjectBlock}><Text style={styles.subjectText}>{row.lunes}</Text></View> : <View style={styles.emptyBlock} />}
          </View>
          <View style={styles.subjectCell}>
            {row.martes ? <View style={styles.subjectBlock}><Text style={styles.subjectText}>{row.martes}</Text></View> : <View style={styles.emptyBlock} />}
          </View>
          <View style={styles.subjectCell}>
            {row.miercoles ? <View style={styles.subjectBlock}><Text style={styles.subjectText}>{row.miercoles}</Text></View> : <View style={styles.emptyBlock} />}
          </View>
          <View style={styles.subjectCell}>
            {row.jueves ? <View style={styles.subjectBlock}><Text style={styles.subjectText}>{row.jueves}</Text></View> : <View style={styles.emptyBlock} />}
          </View>
          <View style={styles.subjectCell}>
            {row.viernes ? <View style={styles.subjectBlock}><Text style={styles.subjectText}>{row.viernes}</Text></View> : <View style={styles.emptyBlock} />}
          </View>
        </View>
      ))}
    </View>
  );

  const renderMobileView = () => {
    const days = ['Lunes', 'Martes']; // Según la imagen solo se muestra Lunes y Martes en esa vista, o mapeamos todos omitiendo vacíos.
    return (
      <View style={styles.mobileContainer}>
        {days.map((day) => (
          <View key={day} style={styles.mobileCard}>
            <Text style={styles.mobileDayTitle}>{day}</Text>
            {scheduleData.map((row, index) => {
              const subject = day === 'Lunes' ? row.lunes : row.martes;
              if (!subject) return null;
              
              return (
                <View key={index} style={styles.mobileRow}>
                  <Text style={styles.mobileTime}>{row.time}</Text>
                  <View style={styles.mobileSubjectBtn}>
                    <Text style={styles.mobileSubjectBtnText}>{subject}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {!isDesktop && (
        <View style={styles.mobileTopBar}>
          <Ionicons name="menu" size={32} color="#000" />
          <View style={styles.topIcons}>
            <Ionicons name="notifications-outline" size={26} color="#000" style={{ marginRight: 15 }} />
            <Ionicons name="person" size={26} color="#000" />
          </View>
        </View>
      )}

      <Text style={styles.pageTitle}>Mi horario</Text>
      
      {isDesktop ? renderDesktopView() : renderMobileView()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 24,
    paddingTop: 40,
  },
  mobileTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  topIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '400',
    color: '#000',
    marginBottom: 30,
  },
  // Desktop Styles
  desktopContainer: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: NAVY,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  headerCell: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 10,
  },
  timeCell: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  timeText: {
    fontSize: 14,
    color: NAVY,
    fontWeight: '600',
  },
  subjectCell: {
    flex: 1,
  },
  subjectBlock: {
    backgroundColor: 'rgba(207, 162, 53, 0.12)',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    height: '100%',
    minHeight: 85,
  },
  emptyBlock: {
    backgroundColor: '#F8F9FB',
    borderRadius: 10,
    height: '100%',
    minHeight: 85,
    borderWidth: 1,
    borderColor: '#EAEAEA',
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
  },
  mobileCard: {
    backgroundColor: '#E5E5E5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  mobileDayTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  mobileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  mobileTime: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  mobileSubjectBtn: {
    backgroundColor: GOLD,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flex: 1.5,
    alignItems: 'center',
  },
  mobileSubjectBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
