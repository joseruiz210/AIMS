import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ActionModal from '../../components/ActionModal';

const NAVY = '#12103C';
const GOLD = '#cfa235';

const competencias = [
  { nombre: 'Analisis de Datos', nota: 4.5, max: 5 },
  { nombre: 'POO', nota: 4.0, max: 5 },
  { nombre: 'Requisitos', nota: 3.8, max: 5 },
  { nombre: 'Programación BD', nota: 4.2, max: 5 },
];

const statCards = [
  { label: 'PROMEDIO', value: '4.0', highlight: true, icon: 'star-outline', route: '/aprendiz/calificaciones' },
  { label: 'ASISTENCIA', value: '96%', highlight: true, icon: 'checkmark-circle-outline', route: '/aprendiz/asistencia' },
  { label: 'MATERIAS', value: '6', highlight: false, icon: 'book-outline', route: '/aprendiz/horario' },
];

const proximasClases = [
  { hora: '07:00 - 09:00', materia: 'Analisis de Datos', instructor: 'Roberto Vargas', aula: '201' },
  { hora: '09:00 - 11:00', materia: 'POO', instructor: 'Carmen López', aula: '102' },
];

const notificacionesRecientes = [
  { id: '1', titulo: 'Nueva calificación en ADSO', hora: 'Hace 10 min', leida: false },
  { id: '2', titulo: 'Recordatorio de Asistencia mañana', hora: 'Hace 2 horas', leida: true },
];

export default function AprendizHome() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const router = useRouter();

  const [selectedClase, setSelectedClase] = useState<typeof proximasClases[0] | null>(null);
  const [claseModalVisible, setClaseModalVisible] = useState(false);

  const [selectedNotif, setSelectedNotif] = useState<typeof notificacionesRecientes[0] | null>(null);
  const [notifModalVisible, setNotifModalVisible] = useState(false);

  const handleOpenClase = (clase: typeof proximasClases[0]) => {
    setSelectedClase(clase);
    setClaseModalVisible(true);
  };

  const handleOpenNotif = (notif: typeof notificacionesRecientes[0]) => {
    setSelectedNotif(notif);
    setNotifModalVisible(true);
  };

  const pad = isDesktop ? 28 : 16;

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { padding: pad }]}>
      {/* Header greeting + bell */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bienvenida,</Text>
          <Text style={styles.name}>Maria Torres</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            style={({ hovered }: any) => [styles.bellWrap, hovered && styles.bellWrapHover]}
            onPress={() => router.push('/aprendiz/notificaciones' as any)}
          >
            <Ionicons name="notifications-outline" size={22} color={NAVY} />
            <View style={styles.bellBadge} />
          </Pressable>
        </View>
      </View>

      {/* Stat Cards */}
      <View style={styles.statsRow}>
        {statCards.map((card, i) => (
          <Pressable
            key={i}
            style={({ hovered }: any) => [
              styles.statCard,
              !isDesktop && styles.statCardMobile,
              hovered && styles.statCardHover,
            ]}
            onPress={() => router.push(card.route as any)}
          >
            <Ionicons name={card.icon as any} size={22} color={card.highlight ? GOLD : NAVY} style={{ marginBottom: 8 }} />
            <Text style={[styles.statValue, card.highlight && styles.statValueGold]}>
              {card.value}
            </Text>
            <Text style={styles.statLabel}>{card.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Mis Competencias */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>MIS COMPETENCIAS</Text>
          <Pressable onPress={() => router.push('/aprendiz/calificaciones' as any)}>
            <Text style={styles.sectionLink}>Ver todo →</Text>
          </Pressable>
        </View>

        {competencias.map((comp, i) => (
          <Pressable
            key={i}
            style={({ hovered }: any) => [styles.compRow, hovered && styles.compRowHover]}
            onPress={() => router.push('/aprendiz/calificaciones' as any)}
          >
            <Text style={styles.compNombre}>{comp.nombre}</Text>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${(comp.nota / comp.max) * 100}%` as any }]} />
            </View>
            <Text style={styles.compNota}>{comp.nota.toFixed(1)}</Text>
          </Pressable>
        ))}
      </View>

      {/* Próximas clases */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>PRÓXIMAS CLASES HOY</Text>
          <Pressable onPress={() => router.push('/aprendiz/horario' as any)}>
            <Text style={styles.sectionLink}>Ver horario →</Text>
          </Pressable>
        </View>
        {proximasClases.map((clase, i) => (
          <Pressable
            key={i}
            style={({ hovered }: any) => [styles.claseRow, hovered && styles.claseRowHover]}
            onPress={() => handleOpenClase(clase)}
          >
            <View style={styles.claseTimeBadge}>
              <Ionicons name="time-outline" size={14} color={GOLD} />
              <Text style={styles.claseTimeText}>{clase.hora}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.claseMateriaText}>{clase.materia}</Text>
              <Text style={styles.claseInfoText}>Aula {clase.aula} • {clase.instructor}</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color="#94A3B8" />
          </Pressable>
        ))}
      </View>

      {/* Notificaciones recientes */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>NOTIFICACIONES RECIENTES</Text>
          <Pressable onPress={() => router.push('/aprendiz/notificaciones' as any)}>
            <Text style={styles.sectionLink}>Ver todas →</Text>
          </Pressable>
        </View>
        {notificacionesRecientes.map((notif, i) => (
          <Pressable
            key={i}
            style={({ hovered }: any) => [
              styles.notifRow,
              !notif.leida && styles.notifRowUnread,
              hovered && styles.notifRowHover,
            ]}
            onPress={() => handleOpenNotif(notif)}
          >
            <View style={[styles.notifDot, !notif.leida && styles.notifDotActive]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.notifTitle, !notif.leida && styles.notifTitleBold]}>{notif.titulo}</Text>
              <Text style={styles.notifTime}>{notif.hora}</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color="#94A3B8" />
          </Pressable>
        ))}
      </View>

      {/* Clase Modal */}
      {selectedClase && (
        <ActionModal
          visible={claseModalVisible}
          onClose={() => setClaseModalVisible(false)}
          title="Detalle de Clase"
          subtitle={selectedClase.materia}
          iconName="calendar-outline"
          confirmText="Ir al horario completo"
          fields={[
            { label: 'Competencia', placeholder: selectedClase.materia },
            { label: 'Instructor', placeholder: selectedClase.instructor },
            { label: 'Horario', placeholder: selectedClase.hora },
            { label: 'Aula', placeholder: selectedClase.aula },
          ]}
        />
      )}

      {/* Notif Modal */}
      {selectedNotif && (
        <ActionModal
          visible={notifModalVisible}
          onClose={() => setNotifModalVisible(false)}
          title={selectedNotif.titulo}
          subtitle={selectedNotif.hora}
          iconName="notifications-outline"
          confirmText="Entendido"
          fields={[
            { label: 'Notificación', placeholder: selectedNotif.titulo },
            { label: 'Recibida', placeholder: selectedNotif.hora },
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
    padding: 16,
    paddingBottom: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#888',
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: NAVY,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellWrap: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D0D8E4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  bellWrapHover: {
    borderColor: GOLD,
  },
  bellBadge: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    flexWrap: 'nowrap',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D0D8E4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
  },
  statCardMobile: {
    flex: 1,
  },
  statCardHover: {
    borderColor: GOLD,
    shadowOpacity: 0.1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: NAVY,
    marginBottom: 4,
  },
  statValueGold: {
    color: GOLD,
  },
  statLabel: {
    fontSize: 10,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D0D8E4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    color: '#888',
    letterSpacing: 1,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sectionLink: {
    fontSize: 12,
    color: GOLD,
    fontWeight: '600',
  },
  compRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
    paddingVertical: 4,
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  compRowHover: {
    backgroundColor: 'rgba(207, 162, 53, 0.06)',
  },
  compNombre: {
    width: 110,
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    flexShrink: 1,
  },
  barBg: {
    flex: 1,
    height: 7,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: GOLD,
    borderRadius: 4,
  },
  compNota: {
    width: 32,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '700',
    color: NAVY,
  },
  // Clases
  claseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  claseRowHover: {
    backgroundColor: '#F8FAFC',
  },
  claseTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(207, 162, 53, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  claseTimeText: {
    fontSize: 11,
    color: GOLD,
    fontWeight: '700',
  },
  claseMateriaText: {
    fontSize: 15,
    fontWeight: '700',
    color: NAVY,
  },
  claseInfoText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  // Notificaciones
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  notifRowUnread: {
    backgroundColor: 'rgba(207, 162, 53, 0.05)',
  },
  notifRowHover: {
    backgroundColor: '#F8FAFC',
  },
  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  notifDotActive: {
    backgroundColor: GOLD,
  },
  notifTitle: {
    fontSize: 14,
    color: '#334155',
  },
  notifTitleBold: {
    fontWeight: '700',
    color: NAVY,
  },
  notifTime: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
});



