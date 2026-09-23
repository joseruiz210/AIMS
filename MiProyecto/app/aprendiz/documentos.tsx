import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ActionModal from '../../components/ActionModal';
import { exportPdfDocument, DocumentLearnerInfo } from '../../utils/pdfExportUtil';
import { getUserData } from '../../utils/storage';

const NAVY = '#12103C';
const GOLD = '#cfa235';

interface DocumentoItem {
  id: string;
  nombre: string;
  tipo: string;
  fechaEmision: string;
  estado: 'Disponible' | 'En Trámite';
}

const DOCUMENTOS: DocumentoItem[] = [
  {
    id: '1',
    nombre: 'Certificado de Matrícula Oficial',
    tipo: 'PDF Oficial SENA',
    fechaEmision: '2026-02-10',
    estado: 'Disponible',
  },
  {
    id: '2',
    nombre: 'Carné Digital Institucional SENA',
    tipo: 'Carné Digital (PDF)',
    fechaEmision: '2026-02-05',
    estado: 'Disponible',
  },
  {
    id: '3',
    nombre: 'Constancia de Calificaciones y Asistencia',
    tipo: 'Constancia Académica (PDF)',
    fechaEmision: '2026-08-20',
    estado: 'Disponible',
  },
  {
    id: '4',
    nombre: 'Paz y Salvo Académico de Trimestre',
    tipo: 'Certificación Final',
    fechaEmision: '2026-09-01',
    estado: 'En Trámite',
  },
];

export default function DocumentosAprendizScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentoItem | null>(null);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await getUserData();
      if (data) {
        setCurrentUser(data);
      }
    } catch (err) {
      console.error('Error cargando datos de usuario:', err);
    }
  };

  const executeDocumentDownload = async (doc: DocumentoItem) => {
    if (doc.estado === 'En Trámite') return;
    setDownloadingDocId(doc.id);
    setFeedbackMsg(null);

    try {
      const learnerInfo: DocumentLearnerInfo = {
        nombre: currentUser?.nombre || currentUser?.name || 'Aprendiz SENA',
        correo: currentUser?.correo || currentUser?.email || 'aprendiz@sena.edu.co',
        documento: currentUser?.documento || currentUser?.numeroDocumento || 'CC. 1.094.821.390',
        tipoDocumento: currentUser?.tipoDocumento || 'Cédula de Ciudadanía',
        ficha: currentUser?.ficha || currentUser?.academicData?.fichaNumero || '2758392',
        programa: currentUser?.programa || 'Tecnólogo en Análisis y Desarrollo de Software (ADSO)',
        fechaEmision: doc.fechaEmision,
        codigoVerificacion: `SENA-VERIF-${Math.floor(1000000 + Math.random() * 9000000)}`,
      };

      await exportPdfDocument(doc.nombre, learnerInfo);
      setFeedbackMsg(`✅ Documento descargado exitosamente: ${doc.nombre}`);
    } catch (err: any) {
      console.error('Error descargando documento:', err);
      setFeedbackMsg(`⚠️ Error al generar documento: ${err.message || 'Intente nuevamente'}`);
    } finally {
      setDownloadingDocId(null);
    }
  };

  const handleOpenModal = (doc: DocumentoItem) => {
    setSelectedDoc(doc);
    setModalVisible(true);
  };

  const pad = isDesktop ? 24 : 14;

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.contentContainer, { padding: pad }]}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Text style={styles.pageTitle}>Documentos y Certificados</Text>
        <Text style={styles.pageSubtitle}>
          Descarga tus certificados oficiales, carné digital e informes académicos con validación digital.
        </Text>
      </View>

      {/* Banner de Feedback */}
      {feedbackMsg && (
        <View style={styles.feedbackBanner}>
          <Text style={styles.feedbackText}>{feedbackMsg}</Text>
        </View>
      )}

      {/* Documents Grid */}
      <View style={styles.gridContainer}>
        {DOCUMENTOS.map((doc) => {
          const isDownloading = downloadingDocId === doc.id;
          return (
            <View key={doc.id} style={styles.docCard}>
              <View style={styles.cardTop}>
                <View style={styles.fileIconBox}>
                  <Ionicons name="document-text" size={26} color={GOLD} />
                </View>
                <View
                  style={[
                    styles.statusTag,
                    doc.estado === 'Disponible' ? styles.tagDisp : styles.tagTramite,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusTagText,
                      doc.estado === 'Disponible' ? styles.tagTextDisp : styles.tagTextTramite,
                    ]}
                  >
                    {doc.estado}
                  </Text>
                </View>
              </View>

              <Text style={styles.docName}>{doc.nombre}</Text>
              <Text style={styles.docMeta}>
                Formato: {doc.tipo} • Emitido: {doc.fechaEmision}
              </Text>

              <View style={styles.cardActionsRow}>
                <Pressable
                  style={({ hovered }: any) => [
                    styles.downloadBtn,
                    doc.estado === 'En Trámite' && styles.downloadBtnDisabled,
                    isDownloading && styles.downloadBtnDisabled,
                    hovered && doc.estado === 'Disponible' && !isDownloading && styles.downloadBtnHover,
                  ]}
                  disabled={doc.estado === 'En Trámite' || isDownloading}
                  onPress={() => executeDocumentDownload(doc)}
                >
                  {isDownloading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />
                  ) : (
                    <Ionicons name="download-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  )}
                  <Text style={styles.downloadBtnText}>
                    {doc.estado === 'En Trámite'
                      ? 'En generación...'
                      : isDownloading
                      ? 'Generando PDF...'
                      : 'Descargar Documento'}
                  </Text>
                </Pressable>

                {doc.estado === 'Disponible' && (
                  <Pressable
                    style={styles.infoBtn}
                    onPress={() => handleOpenModal(doc)}
                  >
                    <Ionicons name="information-circle-outline" size={20} color={NAVY} />
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Download Action Modal */}
      {selectedDoc && (
        <ActionModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={() => executeDocumentDownload(selectedDoc)}
          title={`Descarga: ${selectedDoc.nombre}`}
          subtitle={`Formato: ${selectedDoc.tipo}`}
          iconName="cloud-download-outline"
          confirmText="Descargar Ahora (PDF)"
          fields={[
            { label: 'Documento', placeholder: selectedDoc.nombre },
            { label: 'Código de Verificación QR', placeholder: 'SENA-VERIF-OFICIAL-AIMS' },
            { label: 'Aprendiz', placeholder: currentUser?.nombre || 'Aprendiz SENA' },
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  docCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#D0D8E4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    marginBottom: 4,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  fileIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(207, 162, 53, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTag: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  tagDisp: {
    backgroundColor: '#DEF7EC',
  },
  tagTramite: {
    backgroundColor: '#FEF3C7',
  },
  statusTagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tagTextDisp: {
    color: '#03543F',
  },
  tagTextTramite: {
    color: '#92400E',
  },
  docName: {
    fontSize: 17,
    fontWeight: '700',
    color: NAVY,
    marginBottom: 6,
  },
  docMeta: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 18,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  downloadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GOLD,
    paddingVertical: 10,
    borderRadius: 10,
  },
  downloadBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  downloadBtnHover: {
    backgroundColor: '#b88d2a',
  },
  downloadBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  infoBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackBanner: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  feedbackText: {
    color: '#065F46',
    fontSize: 13,
    fontWeight: '600',
  },
});





