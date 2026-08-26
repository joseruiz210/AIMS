import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NAVY = '#0F1026';
const GOLD = '#D4AF37';
const BG_PAGE = '#F8FAFC';

interface Apprentice {
  id: string;
  name: string;
  initials: string;
  doc: string;
  ficha: string;
  nota: number;
  asistencia: number;
  status: string;
  telefono: string;
  correo: string;
}

const APPRENTICES_DATA: Apprentice[] = [
  {
    id: '1',
    name: 'Valentina Torres',
    initials: 'VT',
    doc: '1020345678',
    ficha: '2845671',
    nota: 4.6,
    asistencia: 96,
    status: 'Activo',
    telefono: '3112345678',
    correo: 'v.torres@soy.sena.edu.co',
  },
  {
    id: '2',
    name: 'Carlos Mendoza',
    initials: 'CM',
    doc: '1020345679',
    ficha: '2845671',
    nota: 3.9,
    asistencia: 88,
    status: 'Activo',
    telefono: '3112345679',
    correo: 'c.mendoza@soy.sena.edu.co',
  },
  {
    id: '3',
    name: 'Laura Jiménez',
    initials: 'LJ',
    doc: '1020345680',
    ficha: '2845671',
    nota: 4.2,
    asistencia: 90,
    status: 'Activo',
    telefono: '3112345680',
    correo: 'l.jimenez@soy.sena.edu.co',
  },
];

export default function AprendicesScreenPremium() {
  const [selectedApprentice, setSelectedApprentice] = useState<Apprentice | null>(APPRENTICES_DATA[1]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Title */}
      <Text style={styles.pageTitle}>Aprendices</Text>

      {/* List of Apprentice Cards */}
      <View style={styles.listContainer}>
        {APPRENTICES_DATA.map((item) => {
          const isSelected = selectedApprentice?.id === item.id;
          return (
            <Pressable
              key={item.id}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => setSelectedApprentice(item)}
            >
              <View style={styles.cardLeft}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{item.initials}</Text>
                </View>
                <View style={styles.infoGroup}>
                  <Text style={styles.nameText}>{item.name}</Text>
                  <Text style={styles.docText}>
                    Doc: {item.doc} . Ficha: {item.ficha}
                  </Text>
                </View>
              </View>

              <View style={styles.cardRight}>
                <View style={styles.statsGroup}>
                  <Text style={styles.notaText}>{item.nota.toFixed(1)}</Text>
                  <Text style={styles.asistenciaText}>{item.asistencia}% asist.</Text>
                </View>
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Selected Apprentice Detail Card */}
      {selectedApprentice && (
        <View style={styles.detailCard}>
          <View style={styles.detailAvatarCircle}>
            <Text style={styles.detailAvatarText}>{selectedApprentice.initials}</Text>
          </View>

          <Text style={styles.detailName}>{selectedApprentice.name}</Text>
          
          <View style={styles.detailStatusBadge}>
            <Text style={styles.detailStatusText}>{selectedApprentice.status}</Text>
          </View>

          <View style={styles.detailFieldsGroup}>
            <View style={styles.fieldItem}>
              <Text style={styles.fieldLabel}>Documento</Text>
              <Text style={styles.fieldValue}>{selectedApprentice.doc}</Text>
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.fieldLabel}>Ficha</Text>
              <Text style={styles.fieldValue}>{selectedApprentice.ficha}</Text>
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.fieldLabel}>Telefono</Text>
              <Text style={styles.fieldValue}>{selectedApprentice.telefono}</Text>
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.fieldLabel}>Correo</Text>
              <Text style={styles.fieldValue}>{selectedApprentice.correo}</Text>
            </View>
          </View>

          {/* Stats bottom row */}
          <View style={styles.detailBottomRow}>
            <View style={styles.detailMetricsGroup}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{selectedApprentice.nota.toFixed(1)}</Text>
                <Text style={styles.metricLabel}>Promedio</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{selectedApprentice.asistencia}%</Text>
                <Text style={styles.metricLabel}>Asistencia</Text>
              </View>
            </View>

            <Pressable style={styles.sendMessageBtn}>
              <Ionicons name="mail-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.sendMessageBtnText}>Enviar mensaje</Text>
            </Pressable>
          </View>
        </View>
      )}
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
    marginBottom: 20,
  },
  listContainer: {
    gap: 14,
    marginBottom: 28,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    flexWrap: 'wrap',
    gap: 12,
  },
  cardSelected: {
    borderColor: GOLD,
    borderWidth: 2,
    backgroundColor: '#FFFDF5',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: NAVY,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: GOLD,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  infoGroup: {},
  nameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  docText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  statsGroup: {
    alignItems: 'flex-end',
  },
  notaText: {
    fontSize: 15,
    fontWeight: '800',
    color: GOLD,
  },
  asistenciaText: {
    fontSize: 12,
    color: '#64748B',
  },
  statusBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '700',
  },
  // Detailed Apprentice Card
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    maxWidth: 550,
    alignSelf: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  detailAvatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: NAVY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 3,
    borderColor: GOLD,
  },
  detailAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 22,
  },
  detailName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  detailStatusBadge: {
    backgroundColor: GOLD,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 4,
    marginBottom: 18,
  },
  detailStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  detailFieldsGroup: {
    width: '100%',
    gap: 10,
    marginBottom: 24,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fieldItem: {
    alignItems: 'flex-start',
  },
  fieldLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  fieldValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  detailBottomRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailMetricsGroup: {
    flexDirection: 'row',
    gap: 20,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: GOLD,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  sendMessageBtn: {
    backgroundColor: GOLD,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sendMessageBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
