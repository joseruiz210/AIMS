import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getToken } from '../../utils/storage';

const GOLD = '#D4AF37';
const BG_PAGE = '#F8FAFC';

export default function ReportesScreenPremium() {
  const exportReport = async (type: 'asistencia' | 'academico' | 'riesgo') => {
    try {
      const token = await getToken();
      const baseUrl = typeof window !== 'undefined' ? `http://${window.location.hostname}:3000/api/v1` : 'http://localhost:3000/api/v1';
      const url = `${baseUrl}/reportes/exportar?type=${type}${token ? `&token=${encodeURIComponent(token)}` : ''}`;
      if (typeof window !== 'undefined') {
        window.open(url, '_blank');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.pageTitle}>Reportes</Text>
      
      {/* Quick Export Grid */}
      <View style={styles.grid}>
        <View style={styles.reportCard}>
          <View style={[styles.iconWrap, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="document-text-outline" size={24} color={GOLD} />
          </View>
          <Text style={styles.cardTitle}>Consolidado de Asistencia</Text>
          <Text style={styles.cardText}>
            Exporta el registro completo de asistencias e inasistencias en PDF oficial.
          </Text>
          <Pressable style={styles.btnDownload} onPress={() => exportReport('asistencia')}>
            <Ionicons name="download-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.btnDownloadText}>Descargar PDF</Text>
          </Pressable>
        </View>

        <View style={styles.reportCard}>
          <View style={[styles.iconWrap, { backgroundColor: '#E0E7FF' }]}>
            <Ionicons name="analytics-outline" size={24} color="#6366F1" />
          </View>
          <Text style={styles.cardTitle}>Reporte Académico</Text>
          <Text style={styles.cardText}>
            Resumen comparativo de promedios por competencia y aprendices destacados.
          </Text>
          <Pressable style={styles.btnDownload} onPress={() => exportReport('academico')}>
            <Ionicons name="download-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.btnDownloadText}>Descargar PDF</Text>
          </Pressable>
        </View>

        <View style={styles.reportCard}>
          <View style={[styles.iconWrap, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="alert-circle-outline" size={24} color="#EF4444" />
          </View>
          <Text style={styles.cardTitle}>Casos en Seguimiento</Text>
          <Text style={styles.cardText}>
            Fichas de alerta temprana para coordinación sobre aprendices en riesgo.
          </Text>
          <Pressable style={styles.btnDownload} onPress={() => exportReport('riesgo')}>
            <Ionicons name="download-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.btnDownloadText}>Descargar PDF</Text>
          </Pressable>
        </View>
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
  grid: {
    flexDirection: 'row',
    gap: 18,
    flexWrap: 'wrap',
  },
  reportCard: {
    flex: 1,
    minWidth: 260,
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
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 20,
  },
  btnDownload: {
    backgroundColor: GOLD,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  btnDownloadText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
