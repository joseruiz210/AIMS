import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ActionModal from '../../components/ActionModal';

const NAVY = '#12103C';
const GOLD = '#cfa235';

interface GradeItem {
  subject: string;
  grade: number;
  periodo: string;
  instructor: string;
  estado: 'Aprobado' | 'En proceso' | 'Por mejorar';
}

const gradesData: GradeItem[] = [
  { subject: 'Analisis de Datos', grade: 4.5, periodo: 'Trimestre I - 2026', instructor: 'Roberto Vargas', estado: 'Aprobado' },
  { subject: 'POO', grade: 4.0, periodo: 'Trimestre I - 2026', instructor: 'Carmen López', estado: 'Aprobado' },
  { subject: 'Requisitos', grade: 3.8, periodo: 'Trimestre I - 2026', instructor: 'Juan Pérez', estado: 'Aprobado' },
  { subject: 'Programación BD', grade: 4.2, periodo: 'Trimestre I - 2026', instructor: 'Ana Martínez', estado: 'Aprobado' },
  { subject: 'Seguridad Informática', grade: 3.5, periodo: 'Trimestre I - 2026', instructor: 'Luis Gómez', estado: 'Por mejorar' },
];

export default function CalificacionesAprendiz() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GradeItem | null>(null);

  const getGradeColor = (grade: number) => {
    if (grade >= 4.0) return '#4CAF50';
    if (grade >= 3.5) return GOLD;
    return '#F44336';
  };

  const handleOpenDetail = (item: GradeItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const promedio = (gradesData.reduce((s, g) => s + g.grade, 0) / gradesData.length).toFixed(1);
  const masAlta = Math.max(...gradesData.map((g) => g.grade)).toFixed(1);
  const masAltaSubject = gradesData.find((g) => g.grade === Math.max(...gradesData.map((g2) => g2.grade)))?.subject ?? '';

  const pad = isDesktop ? 24 : 14;

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { padding: pad, paddingTop: isDesktop ? 32 : 20 }]}>
      <Text style={styles.pageTitle}>Mis Calificaciones</Text>
      <Text style={styles.pageSubtitle}>Revisa tus notas por competencia del trimestre actual.</Text>

      {/* Summary Cards */}
      <View style={[styles.summaryContainer, !isDesktop && styles.summaryContainerMobile]}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>PROMEDIO GENERAL</Text>
          <Text style={[styles.summaryValue, { color: GOLD }]}>{promedio}</Text>
          <Text style={styles.summarySubtext}>Sobre 5.0</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>MÁS ALTA</Text>
          <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>{masAlta}</Text>
          <Text style={styles.summarySubtext}>{masAltaSubject}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>COMPETENCIAS</Text>
          <Text style={styles.summaryValue}>{gradesData.length}</Text>
          <Text style={styles.summarySubtext}>En evaluación</Text>
        </View>
      </View>

      {/* Grade Detail List */}
      <Text style={styles.sectionTitle}>MIS COMPETENCIAS</Text>
      <View style={styles.listContainer}>
        {gradesData.map((item, index) => (
          <Pressable
            key={index}
            style={({ hovered }: any) => [styles.gradeCard, hovered && styles.gradeCardHover]}
            onPress={() => handleOpenDetail(item)}
          >
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.subjectName}>{item.subject}</Text>
                <Text style={styles.instructorText}>Instructor: {item.instructor}</Text>
              </View>
              <Text style={[styles.gradeNum, { color: getGradeColor(item.grade) }]}>
                {item.grade.toFixed(1)}
              </Text>
            </View>

            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${(item.grade / 5) * 100}%` as any,
                    backgroundColor: getGradeColor(item.grade),
                  },
                ]}
              />
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.periodoText}>{item.periodo}</Text>
              <Pressable
                style={({ hovered }: any) => [styles.detailBtn, hovered && styles.detailBtnHover]}
                onPress={() => handleOpenDetail(item)}
              >
                <Ionicons name="eye-outline" size={14} color={GOLD} style={{ marginRight: 4 }} />
                <Text style={styles.detailBtnText}>Ver detalle</Text>
              </Pressable>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Action Modal */}
      {selectedItem && (
        <ActionModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title="Detalle de Calificación"
          subtitle={selectedItem.subject}
          iconName="star-outline"
          confirmText="Aceptar"
          fields={[
            { label: 'Competencia', placeholder: selectedItem.subject },
            { label: 'Instructor', placeholder: selectedItem.instructor },
            { label: 'Período', placeholder: selectedItem.periodo },
            { label: 'Nota Obtenida', placeholder: `${selectedItem.grade.toFixed(1)} / 5.0` },
            { label: 'Estado', placeholder: selectedItem.estado },
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
    marginBottom: 24,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 28,
    flexWrap: 'wrap',
  },
  summaryContainerMobile: {
    flexDirection: 'column',
  },
  summaryCard: {
    flex: 1,
    minWidth: 130,
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
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 40,
    fontWeight: '300',
    color: NAVY,
    marginBottom: 8,
  },
  summarySubtext: {
    fontSize: 13,
    color: '#94A3B8',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  listContainer: {
    gap: 14,
  },
  gradeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#D0D8E4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
  },
  gradeCardHover: {
    borderColor: GOLD,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '700',
    color: NAVY,
  },
  instructorText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  gradeNum: {
    fontSize: 32,
    fontWeight: '300',
    marginLeft: 12,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  periodoText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(207, 162, 53, 0.1)',
    borderRadius: 8,
  },
  detailBtnHover: {
    backgroundColor: 'rgba(207, 162, 53, 0.22)',
  },
  detailBtnText: {
    color: GOLD,
    fontSize: 13,
    fontWeight: '700',
  },
});



