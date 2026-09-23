import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fichasService, Ficha } from '../../services/fichasService';
import { asistenciaService } from '../../services/asistenciaService';
import { calificacionesService } from '../../services/calificacionesService';
import { exportToCsv } from '../../utils/exportUtil';

const GOLD = '#D4AF37';
const NAVY = '#0F172A';
const BG_PAGE = '#F8FAFC';

export default function ReportesScreenPremium() {
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
        // Si aún no hay sesiones tomadas en BD, exportamos plantilla con aprendices de la ficha
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
        // Plantilla por defecto si no existen notas registradas
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.pageTitle}>Reportes y Consolidados por Ficha</Text>
      <Text style={styles.pageSubtitle}>Descarga e inspecciona informes de asistencia y calificaciones de tus grupos</Text>

      {/* Selector de Ficha para Reportes */}
      <View style={styles.selectorCard}>
        <Text style={styles.selectorTitle}>Selecciona la Ficha de Formación:</Text>
        {loading ? (
          <ActivityIndicator size="small" color={GOLD} />
        ) : fichas.length === 0 ? (
          <Text style={styles.noFichasText}>No tienes fichas asignadas.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {fichas.map(f => {
              const isSelected = f.id === selectedFichaId;
              return (
                <Pressable
                  key={f.id}
                  style={[styles.fichaChip, isSelected && styles.fichaChipActive]}
                  onPress={() => setSelectedFichaId(f.id)}
                >
                  <Ionicons name="school-outline" size={16} color={isSelected ? '#FFFFFF' : NAVY} />
                  <Text style={[styles.fichaChipText, isSelected && styles.fichaChipTextActive]}>
                    Ficha {f.numero || f.codigo} {f.programaNombre ? `(${f.programaNombre})` : ''}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Banner de Feedback */}
      {feedbackMsg && (
        <View style={styles.feedbackBanner}>
          <Text style={styles.feedbackText}>{feedbackMsg}</Text>
        </View>
      )}

      {/* Grid de Reportes */}
      <View style={styles.grid}>
        {/* Consolidado de Asistencia */}
        <View style={styles.reportCard}>
          <View style={[styles.iconWrap, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="document-text-outline" size={24} color={GOLD} />
          </View>
          <Text style={styles.cardTitle}>Consolidado de Asistencia</Text>
          <Text style={styles.cardText}>
            Exporta el registro completo de asistencias, inasistencias y excusas de la Ficha{' '}
            <Text style={{ fontWeight: '700', color: NAVY }}>{selectedFicha?.numero || selectedFicha?.codigo || 'seleccionada'}</Text> en CSV / Excel.
          </Text>
          <Pressable
            style={[styles.btnDownload, downloadingAsistencia && styles.btnDisabled]}
            disabled={downloadingAsistencia || !selectedFichaId}
            onPress={handleDownloadAsistencia}
          >
            {downloadingAsistencia ? (
              <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />
            ) : (
              <Ionicons name="download-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            )}
            <Text style={styles.btnDownloadText}>
              {downloadingAsistencia ? 'Generando CSV...' : 'Descargar Asistencia CSV'}
            </Text>
          </Pressable>
        </View>

        {/* Reporte Académico / Notas */}
        <View style={styles.reportCard}>
          <View style={[styles.iconWrap, { backgroundColor: '#E0E7FF' }]}>
            <Ionicons name="analytics-outline" size={24} color="#6366F1" />
          </View>
          <Text style={styles.cardTitle}>Reporte Académico (Notas)</Text>
          <Text style={styles.cardText}>
            Genera el resumen de notas finales y estados de aprobación por competencia para la Ficha{' '}
            <Text style={{ fontWeight: '700', color: NAVY }}>{selectedFicha?.numero || selectedFicha?.codigo || 'seleccionada'}</Text> en CSV / Excel.
          </Text>
          <Pressable
            style={[styles.btnDownload, downloadingNotas && styles.btnDisabled]}
            disabled={downloadingNotas || !selectedFichaId}
            onPress={handleDownloadNotas}
          >
            {downloadingNotas ? (
              <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />
            ) : (
              <Ionicons name="download-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            )}
            <Text style={styles.btnDownloadText}>
              {downloadingNotas ? 'Generando CSV...' : 'Descargar Notas CSV'}
            </Text>
          </Pressable>
        </View>

        {/* Casos en Seguimiento */}
        <View style={styles.reportCard}>
          <View style={[styles.iconWrap, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="alert-circle-outline" size={24} color="#EF4444" />
          </View>
          <Text style={styles.cardTitle}>Casos en Seguimiento</Text>
          <Text style={styles.cardText}>
            Fichas de alerta temprana para coordinación sobre aprendices en riesgo por bajo rendimiento o inasistencia.
          </Text>
          <Pressable
            style={styles.btnDownload}
            onPress={() => handleDownloadAsistencia()}
          >
            <Ionicons name="share-social-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.btnDownloadText}>Exportar Informe de Alertas</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 18,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: NAVY,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 18,
  },
  selectorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  selectorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: NAVY,
    marginBottom: 10,
  },
  noFichasText: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  fichaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
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
    fontSize: 13,
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
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  feedbackText: {
    color: '#065F46',
    fontSize: 13,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'column',
    gap: 14,
  },
  reportCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: NAVY,
    marginBottom: 6,
  },
  cardText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    marginBottom: 16,
  },
  btnDownload: {
    backgroundColor: GOLD,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnDownloadText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
