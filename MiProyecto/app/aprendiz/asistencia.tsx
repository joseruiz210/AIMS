import React from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NAVY = '#12103C';
const GOLD = '#cfa235';
const GRAY_BG = '#EAEAEA';

const asistenciaData = [
  { subject: 'Analisis de Datos', totalClasses: 20, attended: 18, percentage: 90 },
  { subject: 'POO', totalClasses: 25, attended: 20, percentage: 80 },
  { subject: 'Requisitos', totalClasses: 15, attended: 15, percentage: 100 },
  { subject: 'Programación BD', totalClasses: 30, attended: 27, percentage: 90 },
];

export default function AsistenciaAprendiz() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return '#4CAF50'; // Verde
    if (percentage >= 80) return GOLD; // Amarillo
    return '#F44336'; // Rojo
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

      <Text style={styles.pageTitle}>Mi Asistencia</Text>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>ASISTENCIA GLOBAL</Text>
          <Text style={styles.summaryValue}>88%</Text>
          <Text style={styles.summarySubtext}>Promedio general</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>TOTAL FALTAS</Text>
          <Text style={styles.summaryValue}>10</Text>
          <Text style={styles.summarySubtext}>Horas falladas</Text>
        </View>
      </View>

      {isDesktop ? (
        <View style={styles.desktopMainCard}>
          <Text style={styles.cardSectionTitle}>DETALLE POR COMPETENCIA</Text>
          
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, { flex: 3 }]}>COMPETENCIA</Text>
            <Text style={[styles.headerText, { flex: 2, textAlign: 'center' }]}>ASISTENCIA</Text>
            <Text style={[styles.headerText, { flex: 1, textAlign: 'center' }]}>PORCENTAJE</Text>
          </View>

          {asistenciaData.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.subjectText}>{item.subject}</Text>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${item.percentage}%`, backgroundColor: getStatusColor(item.percentage) }]} />
                </View>
                <Text style={styles.progressSubtext}>{item.attended} / {item.totalClasses} hrs</Text>
              </View>
              
              <Text style={[styles.percentageValue, { color: getStatusColor(item.percentage) }]}>{item.percentage}%</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.mobileListContainer}>
          <Text style={styles.cardSectionTitle}>DETALLE POR COMPETENCIA</Text>
          {asistenciaData.map((item, index) => (
            <View key={index} style={styles.mobileGradeCard}>
              <View style={styles.mobileGradeHeader}>
                <Text style={styles.mobileSubjectText}>{item.subject}</Text>
                <Text style={[styles.mobileGradeValue, { color: getStatusColor(item.percentage) }]}>{item.percentage}%</Text>
              </View>
              
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${item.percentage}%`, backgroundColor: getStatusColor(item.percentage) }]} />
              </View>
              <Text style={styles.mobileProgressSubtext}>{item.attended} de {item.totalClasses} horas asistidas</Text>
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
  summaryContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: GRAY_BG,
    borderRadius: 16,
    padding: 20,
    minHeight: 140,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 15,
  },
  summaryValue: {
    fontSize: 48,
    fontWeight: '300',
    color: NAVY,
    marginBottom: 15,
  },
  summarySubtext: {
    fontSize: 14,
    color: '#333',
  },
  // Desktop specific
  desktopMainCard: {
    backgroundColor: GRAY_BG,
    borderRadius: 16,
    padding: 30,
    marginTop: 10,
  },
  cardSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    marginBottom: 25,
    textTransform: 'uppercase',
  },
  tableHeader: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  headerText: {
    fontSize: 13,
    color: '#666',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  subjectText: {
    flex: 3,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  progressContainer: {
    flex: 2,
    paddingHorizontal: 10,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#FFF',
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  percentageValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Mobile specific
  mobileListContainer: {
    marginTop: 10,
  },
  mobileGradeCard: {
    backgroundColor: GRAY_BG,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  mobileGradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mobileSubjectText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  mobileGradeValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  mobileProgressSubtext: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
  }
});
