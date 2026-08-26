import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const GOLD = '#D4AF37';
const BG_PAGE = '#F8FAFC';
const NAVY = '#0F1026';

interface StudentGrade {
  name: string;
  nota: number;
  maxNota: number;
}

interface CompetenciaGroup {
  id: string;
  title: string;
  overallNota: number;
  students: StudentGrade[];
}

const GRADES_DATA: CompetenciaGroup[] = [
  {
    id: '1',
    title: 'Analisis de Datos',
    overallNota: 4.2,
    students: [
      { name: 'Valentina Torres', nota: 4.5, maxNota: 5.0 },
      { name: 'Carlos Mendoza', nota: 3.8, maxNota: 5.0 },
      { name: 'Laura Jiménez', nota: 4.2, maxNota: 5.0 },
      { name: 'Andrés Reyes', nota: 4.9, maxNota: 5.0 },
    ],
  },
  {
    id: '2',
    title: 'Programación BD',
    overallNota: 4.2,
    students: [
      { name: 'Valentina Torres', nota: 4.5, maxNota: 5.0 },
      { name: 'Carlos Mendoza', nota: 3.8, maxNota: 5.0 },
      { name: 'Laura Jiménez', nota: 4.2, maxNota: 5.0 },
      { name: 'Andrés Reyes', nota: 4.9, maxNota: 5.0 },
    ],
  },
];

export default function CalificacionesScreenPremium() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Title */}
      <Text style={styles.pageTitle}>Calificaciones</Text>

      {/* Cards List */}
      <View style={styles.cardsList}>
        {GRADES_DATA.map((group) => (
          <View key={group.id} style={styles.gradeCard}>
            {/* Header row inside card */}
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>{group.title}</Text>
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreBadgeLabel}>Promedio:</Text>
                <Text style={styles.overallScore}>{group.overallNota.toFixed(1)}</Text>
              </View>
            </View>

            {/* Table Column Headers */}
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.headerCell, styles.nameHeader]}>Aprendiz</Text>
              <Text style={[styles.headerCell, styles.notaHeader]}>Nota</Text>
              <Text style={[styles.headerCell, styles.progressHeader]}>Progreso</Text>
            </View>

            {/* Student Rows */}
            {group.students.map((student, idx) => {
              const progressPct = (student.nota / student.maxNota) * 100;
              return (
                <View key={idx} style={styles.studentRow}>
                  <View style={styles.nameGroup}>
                    <View style={styles.miniAvatar}>
                      <Text style={styles.miniAvatarText}>
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </Text>
                    </View>
                    <Text style={styles.studentName}>{student.name}</Text>
                  </View>

                  <Text style={styles.studentNota}>{student.nota.toFixed(1)}</Text>
                  
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_PAGE,
  },
  contentContainer: {
    paddingHorizontal: 28,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 24,
  },
  cardsList: {
    gap: 24,
  },
  gradeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 6,
  },
  scoreBadgeLabel: {
    fontSize: 12,
    color: '#78350F',
    fontWeight: '500',
  },
  overallScore: {
    fontSize: 18,
    fontWeight: '800',
    color: GOLD,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerCell: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  nameHeader: {
    flex: 2,
  },
  notaHeader: {
    flex: 1,
    textAlign: 'center',
  },
  progressHeader: {
    flex: 2,
    textAlign: 'center',
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  nameGroup: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: NAVY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniAvatarText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  studentName: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  studentNota: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
  },
  progressContainer: {
    flex: 2,
    justifyContent: 'center',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: GOLD,
    borderRadius: 4,
  },
});
