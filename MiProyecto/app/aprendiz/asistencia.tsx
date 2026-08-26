import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ActionModal from '../../components/ActionModal';

const NAVY = '#12103C';
const GOLD = '#cfa235';

interface AsistenciaItem {
  subject: string;
  totalClasses: number;
  attended: number;
  percentage: number;
  instructor: string;
  faltas: number;
}

const asistenciaData: AsistenciaItem[] = [
  { subject: 'Analisis de Datos', totalClasses: 20, attended: 18, percentage: 90, instructor: 'Roberto Vargas', faltas: 2 },
  { subject: 'POO', totalClasses: 25, attended: 20, percentage: 80, instructor: 'Carmen López', faltas: 5 },
  { subject: 'Requisitos', totalClasses: 15, attended: 15, percentage: 100, instructor: 'Juan Pérez', faltas: 0 },
  { subject: 'Programación BD', totalClasses: 30, attended: 27, percentage: 90, instructor: 'Ana Martínez', faltas: 3 },
];

export default function AsistenciaAprendiz() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AsistenciaItem | null>(null);

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return '#4CAF50';
    if (percentage >= 80) return GOLD;
    return '#F44336';
  };

  const getStatusLabel = (percentage: number) => {
    if (percentage >= 90) return 'Excelente';
    if (percentage >= 80) return 'Aceptable';
    return 'En riesgo';
  };

  const handleOpenDetail = (item: AsistenciaItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const pad = isDesktop ? 24 : 14;

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { padding: pad, paddingTop: isDesktop ? 32 : 20 }]}>
      <Text style={styles.pageTitle}>Mi Asistencia</Text>
      <Text style={styles.pageSubtitle}>Consulta tu porcentaje de asistencia por competencia.</Text>

      {/* Summary Cards */}
      <View style={[styles.summaryContainer, !isDesktop && styles.summaryContainerMobile]}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>ASISTENCIA GLOBAL</Text>
          <Text style={styles.summaryValue}>88%</Text>
          <Text style={styles.summarySubtext}>Promedio general</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>TOTAL FALTAS</Text>
          <Text style={[styles.summaryValue, { color: '#F44336' }]}>10</Text>
          <Text style={styles.summarySubtext}>Horas falladas</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>MATERIAS</Text>
          <Text style={styles.summaryValue}>{asistenciaData.length}</Text>
          <Text style={styles.summarySubtext}>En seguimiento</Text>
        </View>
      </View>

      {/* Detail List */}
      <View style={styles.detailContainer}>
        <Text style={styles.sectionTitle}>DETALLE POR COMPETENCIA</Text>

        {asistenciaData.map((item, index) => (
          <Pressable
            key={index}
            style={({ hovered }: any) => [styles.rowCard, hovered && styles.rowCardHover]}
            onPress={() => handleOpenDetail(item)}
          >
            <View style={styles.rowHeader}>
              <Text style={styles.subjectName}>{item.subject}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.percentage) + '22' }]}>
                <Text style={[styles.statusBadgeText, { color: getStatusColor(item.percentage) }]}>
                  {getStatusLabel(item.percentage)}
                </Text>
              </View>
            </View>

            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${item.percentage}%` as any, backgroundColor: getStatusColor(item.percentage) },
                ]}
              />
            </View>

            <View style={styles.rowFooter}>
              <Text style={styles.rowMeta}>{item.attended} / {item.totalClasses} horas • {item.faltas} falta(s)</Text>
              <Text style={[styles.percentValue, { color: getStatusColor(item.percentage) }]}>
                {item.percentage}%
              </Text>
            </View>

            <View style={styles.detailBtnRow}>
              <Ionicons name="eye-outline" size={14} color={GOLD} style={{ marginRight: 4 }} />
              <Text style={styles.detailBtnText}>Ver detalle</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Action Modal */}
      {selectedItem && (
        <ActionModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title={`Detalle de Asistencia`}
          subtitle={selectedItem.subject}
          iconName="checkmark-circle-outline"
          confirmText="Aceptar"
          fields={[
            { label: 'Competencia', placeholder: selectedItem.subject },
            { label: 'Instructor', placeholder: selectedItem.instructor },
            { label: 'Horas Asistidas', placeholder: `${selectedItem.attended} de ${selectedItem.totalClasses}` },
            { label: 'Faltas Registradas', placeholder: `${selectedItem.faltas} falta(s)` },
            { label: 'Porcentaje de Asistencia', placeholder: `${selectedItem.percentage}% — ${getStatusLabel(selectedItem.percentage)}` },
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
    marginBottom: 24,
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
  detailContainer: {
    gap: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  rowCard: {
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
  rowCardHover: {
    borderColor: GOLD,
    shadowOpacity: 0.1,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '700',
    color: NAVY,
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  rowFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowMeta: {
    fontSize: 13,
    color: '#64748B',
  },
  percentValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  detailBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  detailBtnText: {
    color: GOLD,
    fontSize: 13,
    fontWeight: '700',
  },
});



