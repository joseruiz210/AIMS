import React from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NAVY = '#12103C';
const GOLD = '#cfa235';
const GRAY_BG = '#EAEAEA';

const gradesData = [
  { subject: 'Analisis de Datos', grade: 4.5 },
  { subject: 'POO', grade: 4.0 },
  { subject: 'Requisitos', grade: 3.8 },
  { subject: 'Programación BD', grade: 4.2 },
];

export default function CalificacionesAprendiz() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Mis calificaciones</Text>

      <View style={[styles.summaryContainer, !isDesktop && styles.summaryContainerMobile]}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>PROMEDIO GENERAL</Text>
          <Text style={styles.summaryValue}>4.1</Text>
          <Text style={styles.summarySubtext}>Sobre 5.0</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>MAS ALTA</Text>
          <Text style={styles.summaryValue}>4.5</Text>
          <Text style={styles.summarySubtext}>Analisis de Datos</Text>
        </View>
      </View>

      {isDesktop ? (
        <View style={styles.desktopMainCard}>
          <Text style={styles.cardSectionTitle}>MIS COMPETENCIAS</Text>
          {gradesData.map((item, index) => (
            <View key={index} style={styles.gradeRowDesktop}>
              <Text style={styles.subjectText}>{item.subject}</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${(item.grade / 5) * 100}%` }]} />
                </View>
              </View>
              <Text style={styles.gradeValue}>{item.grade.toFixed(1)}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.mobileListContainer}>
          {gradesData.map((item, index) => (
            <View key={index} style={styles.mobileGradeCard}>
              <View style={styles.mobileGradeHeader}>
                <Text style={styles.mobileSubjectText}>{item.subject}</Text>
                <Text style={styles.mobileGradeValue}>{item.grade.toFixed(1)}</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${(item.grade / 5) * 100}%` }]} />
              </View>
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
  summaryContainerMobile: {
    flexDirection: 'column',
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
    color: GOLD,
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
  gradeRowDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  subjectText: {
    flex: 2,
    fontSize: 16,
    color: '#333',
  },
  progressContainer: {
    flex: 3,
    paddingHorizontal: 20,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#FFF',
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: GOLD,
    borderRadius: 3,
  },
  gradeValue: {
    flex: 0.5,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'right',
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
  },
  mobileGradeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  }
});
