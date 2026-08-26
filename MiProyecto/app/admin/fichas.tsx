import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ActionModal from '../../components/ActionModal';

const NAVY = '#12103C';
const GOLD = '#cfa235';

interface FichaItem {
  id: string;
  badgeCode: string;
  programTitle: string;
  fichaNumber: string;
  instructor: string;
  shift: string;
  aprendicesCount: number;
  status: 'Activo' | 'Riesgo' | 'Inactivo';
}

const INITIAL_FICHAS: FichaItem[] = [
  {
    id: '1',
    badgeCode: '670',
    programTitle: 'Análisis y Desarrollo de Software',
    fichaNumber: '2845670',
    instructor: 'Roberto Vargas',
    shift: 'Jornada Mañana',
    aprendicesCount: 26,
    status: 'Activo',
  },
  {
    id: '2',
    badgeCode: '680',
    programTitle: 'Administración de Empresas',
    fichaNumber: '2845680',
    instructor: 'Carmen López',
    shift: 'Jornada Tarde',
    aprendicesCount: 24,
    status: 'Activo',
  },
  {
    id: '3',
    badgeCode: '690',
    programTitle: 'Contabilidad y Finanzas',
    fichaNumber: '2845690',
    instructor: 'Jorge Pinzón',
    shift: 'Jornada Mañana',
    aprendicesCount: 22,
    status: 'Activo',
  },
  {
    id: '4',
    badgeCode: '700',
    programTitle: 'Diseño Gráfico',
    fichaNumber: '2845700',
    instructor: 'María Ruiz',
    shift: 'Jornada Noche',
    aprendicesCount: 20,
    status: 'Riesgo',
  },
];

export default function FichasScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [search, setSearch] = useState('');
  const [fichas] = useState<FichaItem[]>(INITIAL_FICHAS);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFicha, setSelectedFicha] = useState<FichaItem | null>(null);

  const filteredFichas = fichas.filter(
    (f) =>
      f.programTitle.toLowerCase().includes(search.toLowerCase()) ||
      f.fichaNumber.includes(search) ||
      f.badgeCode.includes(search) ||
      f.instructor.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenDetail = (item: FichaItem) => {
    setSelectedFicha(item);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Text style={styles.pageTitle}>Fichas</Text>
        <Pressable 
          style={({ hovered }: any) => [styles.newBtn, hovered && styles.newBtnHover]}
          onPress={() => {
            setSelectedFicha(null);
            setModalVisible(true);
          }}
        >
          <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.newBtnText}>+ Nueva ficha</Text>
        </Pressable>
      </View>

      {/* Search Input */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={20} color="#64748B" style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por número de ficha, programa o instructor..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Fichas Cards List */}
      <View style={styles.listContainer}>
        {filteredFichas.map((item) => (
          <View key={item.id} style={styles.fichaCard}>
            {/* Left Badge */}
            <View style={styles.badgeBox}>
              <Text style={styles.badgeCodeText}>{item.badgeCode}</Text>
            </View>

            {/* Middle Info */}
            <View style={styles.infoContainer}>
              <Text style={styles.programTitle}>{item.programTitle}</Text>
              <Text style={styles.subDetail}>
                Ficha {item.fichaNumber} • {item.instructor} • {item.shift}
              </Text>
            </View>

            {/* Right Meta (Aprendices, Status, Button) */}
            <View style={styles.rightGroup}>
              <View style={styles.aprendicesBox}>
                <Text style={styles.aprendicesNum}>{item.aprendicesCount}</Text>
                <Text style={styles.aprendicesText}>Aprendices</Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  item.status === 'Riesgo' ? styles.statusRiesgo : styles.statusActivo,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    item.status === 'Riesgo' ? styles.statusTextRiesgo : styles.statusTextActivo,
                  ]}
                >
                  {item.status}
                </Text>
              </View>

              <Pressable
                style={({ hovered }: any) => [styles.detailBtn, hovered && styles.detailBtnHover]}
                onPress={() => handleOpenDetail(item)}
              >
                <Text style={styles.detailBtnText}>Ver detalle</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      {/* New Ficha Modal */}
      <ActionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Crear Nueva Ficha Académica"
        subtitle="Registro de Grupo de Formación SENA"
        iconName="folder-open-outline"
        confirmText="Crear Ficha"
        fields={[
          { label: 'Número de Ficha', placeholder: 'Ej: 2845699' },
          { label: 'Programa de Formación', placeholder: 'Ej: Análisis y Desarrollo de Software' },
          { label: 'Instructor Líder', placeholder: 'Ej: Roberto Vargas' },
          { label: 'Jornada', placeholder: 'Ej: Jornada Mañana / Tarde / Noche' },
        ]}
      />

      {/* View Detail Modal */}
      {selectedFicha && (
        <ActionModal
          visible={!!selectedFicha}
          onClose={() => setSelectedFicha(null)}
          title={`Ficha: ${selectedFicha.fichaNumber}`}
          subtitle={selectedFicha.programTitle}
          iconName="information-circle-outline"
          confirmText="Cerrar Detalle"
          fields={[
            { label: 'Código de Insignia', placeholder: selectedFicha.badgeCode },
            { label: 'Instructor Asignado', placeholder: selectedFicha.instructor },
            { label: 'Jornada y Horario', placeholder: selectedFicha.shift },
            { label: 'Total de Aprendices Enrolados', placeholder: `${selectedFicha.aprendicesCount} Aprendices` },
            { label: 'Estado del Grupo', placeholder: selectedFicha.status },
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: NAVY,
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GOLD,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  newBtnHover: {
    backgroundColor: '#b88d2a',
  },
  newBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: NAVY,
  },
  listContainer: {
    gap: 16,
  },
  fichaCard: {
    backgroundColor: '#EAEAEA',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  badgeBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCodeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  },
  infoContainer: {
    flex: 1,
    minWidth: 200,
  },
  programTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: NAVY,
  },
  subDetail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
  },
  aprendicesBox: {
    alignItems: 'center',
  },
  aprendicesNum: {
    fontSize: 16,
    fontWeight: '700',
    color: NAVY,
  },
  aprendicesText: {
    fontSize: 12,
    color: '#64748B',
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusActivo: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  statusRiesgo: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextActivo: {
    color: GOLD,
  },
  statusTextRiesgo: {
    color: '#D97706',
  },
  detailBtn: {
    backgroundColor: GOLD,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  detailBtnHover: {
    backgroundColor: '#b88d2a',
  },
  detailBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
});
