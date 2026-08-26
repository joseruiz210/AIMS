import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,

  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ActionModal from '../../components/ActionModal';

const NAVY = '#12103C';
const GOLD = '#cfa235';

interface ObservacionItem {
  id: string;
  tipo: 'Felicitación' | 'Académica' | 'Disciplinaria';
  fecha: string;
  instructor: string;
  materia: string;
  descripcion: string;
}

const OBSERVACIONES: ObservacionItem[] = [
  {
    id: '1',
    tipo: 'Felicitación',
    fecha: '24 de Agosto, 2026',
    instructor: 'Roberto Vargas',
    materia: 'Desarrollo de Software',
    descripcion: 'Excelente desempeño en el proyecto integrador de React Native y arquitectura backend.',
  },
  {
    id: '2',
    tipo: 'Académica',
    fecha: '15 de Agosto, 2026',
    instructor: 'Carmen López',
    materia: 'Bases de Datos SQL',
    descripcion: 'Se recomienda repasar la optimización de consultas JOIN y procedimientos almacenados.',
  },
  {
    id: '3',
    tipo: 'Disciplinaria',
    fecha: '02 de Agosto, 2026',
    instructor: 'Coordinación Académica',
    materia: 'Asistencia General',
    descripcion: 'Llegada tardía justificada en la sesión de las 7:00 AM.',
  },
];

export default function ObservacionesAprendizScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedObs, setSelectedObs] = useState<ObservacionItem | null>(null);

  const handleOpenObs = (obs: ObservacionItem) => {
    setSelectedObs(obs);
    setModalVisible(true);
  };

  const pad = isDesktop ? 24 : 14;

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.contentContainer, { padding: pad }]}>
      {/* Header */}
      <View style={styles.topHeader}>
        <Text style={styles.pageTitle}>Observaciones Académicas</Text>
        <Text style={styles.pageSubtitle}>
          Consulta las observaciones, reconocimientos y anotaciones registradas por tus instructores.
        </Text>
      </View>

      {/* Observaciones List */}
      <View style={styles.listContainer}>
        {OBSERVACIONES.map((item) => (
          <View key={item.id} style={styles.obsCard}>
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.typeBadge,
                  item.tipo === 'Felicitación'
                    ? styles.badgeFelicitacion
                    : item.tipo === 'Académica'
                    ? styles.badgeAcademica
                    : styles.badgeDisciplinaria,
                ]}
              >
                <Ionicons
                  name={
                    item.tipo === 'Felicitación'
                      ? 'star'
                      : item.tipo === 'Académica'
                      ? 'book'
                      : 'alert-circle'
                  }
                  size={14}
                  color={
                    item.tipo === 'Felicitación'
                      ? '#047857'
                      : item.tipo === 'Académica'
                      ? '#1D4ED8'
                      : '#B91C1C'
                  }
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.typeText,
                    item.tipo === 'Felicitación'
                      ? styles.textFelicitacion
                      : item.tipo === 'Académica'
                      ? styles.textAcademica
                      : styles.textDisciplinaria,
                  ]}
                >
                  {item.tipo}
                </Text>
              </View>

              <Text style={styles.dateText}>{item.fecha}</Text>
            </View>

            <Text style={styles.materiaText}>{item.materia}</Text>
            <Text style={styles.instructorText}>Instructor: {item.instructor}</Text>
            <Text style={styles.descText}>{item.descripcion}</Text>

            <Pressable
              style={({ hovered }: any) => [styles.actionBtn, hovered && styles.actionBtnHover]}
              onPress={() => handleOpenObs(item)}
            >
              <Text style={styles.actionBtnText}>Ver detalles de la observación</Text>
            </Pressable>
          </View>
        ))}
      </View>

      {/* Interactive Detail Modal */}
      {selectedObs && (
        <ActionModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title={`Observación: ${selectedObs.tipo}`}
          subtitle={`${selectedObs.materia} • ${selectedObs.instructor}`}
          iconName="eye-outline"
          confirmText="Aceptar"
          fields={[
            { label: 'Tipo', placeholder: selectedObs.tipo },
            { label: 'Instructor', placeholder: selectedObs.instructor },
            { label: 'Fecha de Registro', placeholder: selectedObs.fecha },
            { label: 'Detalle Completo', placeholder: selectedObs.descripcion, type: 'multiline' },
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
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  topHeader: {
    marginBottom: 24,
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
  listContainer: {
    gap: 16,
  },
  obsCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  badgeFelicitacion: {
    backgroundColor: '#D1FAE5',
  },
  badgeAcademica: {
    backgroundColor: '#DBEAFE',
  },
  badgeDisciplinaria: {
    backgroundColor: '#FEE2E2',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  textFelicitacion: {
    color: '#047857',
  },
  textAcademica: {
    color: '#1D4ED8',
  },
  textDisciplinaria: {
    color: '#B91C1C',
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  materiaText: {
    fontSize: 18,
    fontWeight: '700',
    color: NAVY,
  },
  instructorText: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
    fontWeight: '600',
  },
  descText: {
    fontSize: 14,
    color: '#334155',
    marginTop: 10,
    lineHeight: 20,
  },
  actionBtn: {
    marginTop: 14,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(207, 162, 53, 0.12)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  actionBtnHover: {
    backgroundColor: 'rgba(207, 162, 53, 0.25)',
  },
  actionBtnText: {
    color: GOLD,
    fontWeight: '700',
    fontSize: 13,
  },
});





