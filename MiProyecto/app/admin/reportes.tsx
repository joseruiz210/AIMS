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
import { fichasService, Ficha } from '../../services/fichasService';
import { asistenciaService } from '../../services/asistenciaService';
import { calificacionesService } from '../../services/calificacionesService';
import { exportToCsv } from '../../utils/exportUtil';

const NAVY = '#12103C';
const GOLD = '#cfa235';

export default function ReportesAdminScreen() {
  const { width } = useWindowDimensions();
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [selectedFichaId, setSelectedFichaId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [downloadingAsistencia, setDownloadingAsistencia] = useState(false);
  const [downloadingNotas, setDownloadingNotas] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    loadFichas();
  }, []);

  const loadFichas = async () => {
    setLoading(true);
    try {
      const data = await fichasService.getFichas();
      setFichas(data);
      if (data.length > 0) {
        setSelectedFichaId(data[0].id);
      }
    } catch (err) {
      console.error('Error cargando fichas:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedFicha = fichas.find(f => f.id === selectedFichaId) || fichas[0];

  const handleDownloadAsistencia = async () => {
    if (!selectedFichaId) return;
    setDownloadingAsistencia(true);
    setFeedbackMsg(null);
    try {
      const fichaCodigo = selectedFicha?.numero || selectedFicha?.codigo || 'General';
      const asistencias = await asistenciaService.getAsistenciasByFicha(selectedFichaId);

      const headers = ['Ficha', 'ID Sesión', 'Fecha', 'Tema', 'Aprendiz ID', 'Nombre Aprendiz', 'Estado Asistencia', 'Observaciones'];
      const rows: (string | number)[][] = [];

      if (asistencias && asistencias.length > 0) {
        asistencias.forEach(a => {
          rows.push([
            a.fichaCodigo || fichaCodigo,
            a.sesionId || 'N/A',
            a.fecha || new Date().toLocaleDateString('es-CO'),
            a.tema || 'Sesión Académica',
            a.aprendizId,
            a.aprendizNombre,
            a.estado,
            a.observacion || '',
          ]);
        });
      } else {
        const detail = await fichasService.getFichaById(selectedFichaId);
        if (detail && detail.matriculas && detail.matriculas.length > 0) {
          detail.matriculas.forEach((m: any) => {
            const apr = m.aprendiz;
            rows.push([
              fichaCodigo,
              'Sin Sesión',
              new Date().toISOString().split('T')[0],
              'General',
              apr.id,
              `${apr.firstName} ${apr.lastName || ''}`.trim(),
              'SIN REGISTRO',
              '',
            ]);
          });
        }
      }

      exportToCsv(`Consolidado_Asistencia_Ficha_${fichaCodigo}.csv`, headers, rows);
      setFeedbackMsg(`✅ Asistencia exportada exitosamente (Ficha ${fichaCodigo})`);
    } catch (err: any) {
      console.error('Error exportando asistencia:', err);
      setFeedbackMsg(`⚠️ Error al exportar asistencia: ${err.message || 'Intente nuevamente'}`);
    } finally {
      setDownloadingAsistencia(false);
    }
  };

  const handleDownloadNotas = async () => {
    if (!selectedFichaId) return;
    setDownloadingNotas(true);
    setFeedbackMsg(null);
    try {
      const fichaCodigo = selectedFicha?.numero || selectedFicha?.codigo || 'General';
      const competencias = await calificacionesService.getCalificacionesByFicha(selectedFichaId);

      const headers = ['Ficha', 'Competencia / Actividad', 'Nombre Aprendiz', 'Nota Final', 'Resultado'];
      const rows: (string | number)[][] = [];

      if (competencias && competencias.length > 0) {
        competencias.forEach(comp => {
          (comp.students || []).forEach(st => {
            rows.push([
              fichaCodigo,
              comp.title || 'Competencia Académica',
              st.name,
              st.nota ?? 0,
              (st.nota ?? 0) >= 3.5 ? 'APROBADO' : 'NO APROBADO',
            ]);
          });
        });
      } else {
        const detail = await fichasService.getFichaById(selectedFichaId);
        if (detail && detail.matriculas && detail.matriculas.length > 0) {
          detail.matriculas.forEach((m: any) => {
            const apr = m.aprendiz;
            rows.push([
              fichaCodigo,
              'General',
              `${apr.firstName} ${apr.lastName || ''}`.trim(),
              0,
              'PENDIENTE',
            ]);
          });
        }
      }

      exportToCsv(`Reporte_Notas_Ficha_${fichaCodigo}.csv`, headers, rows);
      setFeedbackMsg(`✅ Calificaciones exportadas exitosamente (Ficha ${fichaCodigo})`);
    } catch (err: any) {
      console.error('Error exportando calificaciones:', err);
      setFeedbackMsg(`⚠️ Error al exportar calificaciones: ${err.message || 'Intente nuevamente'}`);
    } finally {
      setDownloadingNotas(false);
    }
  };

  const monthlyEnrollments: Array<{ month: string; count: number }> = [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Text style={styles.pageTitle}>Reportes Administrativos</Text>
        <View style={styles.btnGroup}>
          <Pressable
            style={[styles.btn, downloadingAsistencia && styles.btnDisabled]}
            disabled={downloadingAsistencia || !selectedFichaId}
            onPress={handleDownloadAsistencia}
          >
            <Ionicons name="download-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.btnText}>Exportar Asistencia</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, downloadingNotas && styles.btnDisabled]}
            disabled={downloadingNotas || !selectedFichaId}
            onPress={handleDownloadNotas}
          >
            <Ionicons name="document-text-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.btnText}>Exportar Notas</Text>
          </Pressable>
        </View>
      </View>

      {/* Selector de Ficha para Administración */}
      <View style={styles.selectorCard}>
        <Text style={styles.selectorTitle}>Ficha Seleccionada para Exportación:</Text>
        {loading ? (
          <ActivityIndicator size="small" color={GOLD} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {fichas.map(f => {
              const isSelected = f.id === selectedFichaId;
              return (
                <Pressable
                  key={f.id}
                  style={[styles.fichaChip, isSelected && styles.fichaChipActive]}
                  onPress={() => setSelectedFichaId(f.id)}
                >
                  <Ionicons name="school-outline" size={14} color={isSelected ? '#FFFFFF' : NAVY} />
                  <Text style={[styles.fichaChipText, isSelected && styles.fichaChipTextActive]}>
                    Ficha {f.numero || f.codigo} {f.programaNombre ? `(${f.programaNombre})` : ''}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>

      {feedbackMsg && (
        <View style={styles.feedbackBanner}>
          <Text style={styles.feedbackText}>{feedbackMsg}</Text>
        </View>
      )}

      {/* Metrics Row */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>PROMEDIO GLOBAL</Text>
          <Text style={styles.metricValueGold}>0.0</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>MEJOR PROGRAMA</Text>
          <Text style={styles.metricValueDark}>Sin datos</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>APROBADOS</Text>
          <Text style={styles.metricValueGold}>0%</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>EN RIESGO</Text>
          <Text style={styles.metricValueDark}>0%</Text>
        </View>
      </View>

      {/* Monthly Enrollments Chart Box */}
      <View style={styles.chartBox}>
        <Text style={styles.chartTitle}>MATRICULAS MENSUALES</Text>

        {monthlyEnrollments.length === 0 ? (
          <View style={{ padding: 28, alignItems: 'center' }}>
            <Ionicons name="bar-chart-outline" size={36} color="#94A3B8" style={{ marginBottom: 6 }} />
            <Text style={{ color: '#64748B', fontSize: 13 }}>No hay datos de matrículas mensuales registradas.</Text>
          </View>
        ) : (
          <View style={styles.vChartArea}>
            {/* Y Axis Numbers */}
            <View style={styles.yAxisColumn}>
              <Text style={styles.yAxisText}>60</Text>
              <Text style={styles.yAxisText}>45</Text>
              <Text style={styles.yAxisText}>30</Text>
              <Text style={styles.yAxisText}>15</Text>
              <Text style={styles.yAxisText}>0</Text>
            </View>

            {/* Vertical Bars */}
            <View style={styles.barsFlexContainer}>
              {monthlyEnrollments.map((item) => {
                const heightPct = (item.count / 60) * 100;

                return (
                  <View key={item.month} style={styles.vBarColumn}>
                    <Text style={styles.barValText}>{item.count}</Text>
                    <View style={styles.vBarTrack}>
                      <View style={[styles.vBarFill, { height: `${heightPct}%` }]} />
                    </View>
                    <Text style={styles.vBarLabel}>{item.month}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>
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
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: NAVY,
  },
  btnGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GOLD,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  selectorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectorTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: NAVY,
    marginBottom: 8,
  },
  fichaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  fichaChipActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  fichaChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: NAVY,
    marginLeft: 6,
  },
  fichaChipTextActive: {
    color: '#FFFFFF',
  },
  feedbackBanner: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  feedbackText: {
    color: '#065F46',
    fontSize: 13,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 22,
  },
  metricCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#E5E7EB',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    letterSpacing: 0.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  metricValueGold: {
    fontSize: 24,
    fontWeight: '800',
    color: GOLD,
  },
  metricValueDark: {
    fontSize: 24,
    fontWeight: '800',
    color: NAVY,
  },
  chartBox: {
    backgroundColor: '#EAEAEA',
    borderRadius: 16,
    padding: 22,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginBottom: 20,
  },
  vChartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 200,
  },
  yAxisColumn: {
    height: '100%',
    justifyContent: 'space-between',
    paddingRight: 12,
  },
  yAxisText: {
    fontSize: 12,
    color: '#64748B',
  },
  barsFlexContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '100%',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#CBD5E1',
    paddingLeft: 8,
    paddingBottom: 4,
  },
  vBarColumn: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    width: 44,
  },
  barValText: {
    fontSize: 11,
    fontWeight: '700',
    color: NAVY,
    marginBottom: 4,
  },
  vBarTrack: {
    width: 24,
    height: '80%',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  vBarFill: {
    width: '100%',
    backgroundColor: GOLD,
    borderRadius: 6,
  },
  vBarLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: NAVY,
    marginTop: 6,
  },
});
