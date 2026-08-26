import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GOLD = '#D4AF37';
const BG_PAGE = '#F8FAFC';
const NAVY = '#0F1026';

const MESSAGES = [
  {
    id: '1',
    sender: 'Carlos Mendoza',
    initials: 'CM',
    time: '10:45 AM',
    text: 'Profesor, adjunto la excusa médica de la semana pasada.',
    unread: true,
  },
  {
    id: '2',
    sender: 'Laura Jiménez',
    initials: 'LJ',
    time: 'Ayer',
    text: 'Muchas gracias por el material de refuerzo en SQL.',
    unread: false,
  },
];

export default function MensajesScreenPremium() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.pageTitle}>Mensajes</Text>
      
      <View style={styles.list}>
        {MESSAGES.map(item => (
          <Pressable key={item.id} style={[styles.msgCard, item.unread && styles.msgCardUnread]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.initials}</Text>
            </View>
            <View style={styles.contentWrap}>
              <View style={styles.topRow}>
                <Text style={styles.sender}>{item.sender}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <Text style={styles.msgText}>{item.text}</Text>
            </View>
          </Pressable>
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
    marginBottom: 20,
  },
  list: {
    gap: 12,
  },
  msgCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  msgCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: GOLD,
    backgroundColor: '#FFFDF5',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: NAVY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  contentWrap: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sender: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  time: {
    fontSize: 12,
    color: '#64748B',
  },
  msgText: {
    fontSize: 13,
    color: '#475569',
  },
});
