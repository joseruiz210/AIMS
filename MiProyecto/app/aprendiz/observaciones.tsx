import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ActionModal from '../../components/ActionModal';
import { observacionesService, ObservacionItem } from '../../services/observacionesService';

const NAVY = '#12103C';
const GOLD = '#cfa235';

export default function ObservacionesAprendizScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const [items, setItems] = useState<ObservacionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedObs, setSelectedObs] = useState<ObservacionItem | null>(null);

  useEffect(() => {
    loadObservaciones();
  }, []);

  const loadObservaciones = async () => {
    setLoading(true);
    try {
      const data = await observacionesService.getMisObservaciones();
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'RECONOCIMIENTO':
      case 'Felicitación':
        return 'Felicitación';
      case 'ACADEMICA':
      case 'Académica':
        return 'Académica';
      case 'DISCIPLINARIA':
      case 'Disciplinaria':
        return 'Disciplinaria';
      default:
        return 'General';
    }
  };

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
      {loading ? (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={GOLD} />
          <Text style={{ marginTop: 12, color: '#64748B', fontSize: 14 }}>Cargando observaciones...</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="document-text-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyTitle}>Sin observaciones registradas</Text>
          <Text style={styles.emptySubtext}>Actualmente no tienes observaciones ni anotaciones en tu historial.</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {items.map((item) => {
            const tipoLabel = formatTipoLabel(item.tipo);
            const isFelicitacion = tipoLabel === 'Felicitación';
            const isAcademica = tipoLabel === 'Académica';

            return (
              <View key={item.id} style={styles.obsCard}>
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.typeBadge,
                      isFelicitacion
                        ? styles.badgeFelicitacion
                        : isAcademica
                        ? styles.badgeAcademica
                        : styles.badgeDisciplinaria,
                    ]}
                  >
                    <Ionicons
                      name={
                        isFelicitacion
                          ? 'star'
                          : isAcademica
                          ? 'book'
                          : 'alert-circle'
                      }
                      size={14}
                      color={
                        isFelicitacion
                          ? '#047857'
                          : isAcademica
                          ? '#1D4ED8'
                          : '#B91C1C'
                      }
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[
                        styles.typeText,
                        isFelicitacion
                          ? styles.textFelicitacion
                          : isAcademica
                          ? styles.textAcademica
                          : styles.textDisciplinaria,
                      ]}
                    >
                      {tipoLabel}
                    </Text>
                  </View>

                  <Text style={styles.dateText}>{item.fecha}</Text>
                </View>

                <Text style={styles.materiaText}>{item.materia || 'Formación Técnica ADSO'}</Text>
                <Text style={styles.instructorText}>Instructor: {item.instructorNombre || 'Instructor SENA'}</Text>
                <Text style={styles.descText}>{item.descripcion}</Text>

                <Pressable
                  style={({ hovered }: any) => [styles.actionBtn, hovered && styles.actionBtnHover]}
                  onPress={() => handleOpenObs(item)}
                >
                  <Text style={styles.actionBtnText}>Ver detalles de la observación</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

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
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D0D8E4',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: NAVY,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
});





