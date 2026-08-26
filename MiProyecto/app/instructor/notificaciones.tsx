import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const GOLD = '#cfa235';

export default function NotificacionesScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.pageTitle}>Notificaciones</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Centro de Alertas y Avisos</Text>
        <Text style={styles.cardText}>
          No tienes notificaciones pendientes en este momento.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingHorizontal: 28,
    paddingVertical: 20,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#E5E5E5',
    borderRadius: 14,
    padding: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 14,
    color: '#555555',
  },
});
