import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ActionModal from '../../components/ActionModal';

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
    tipo: 'PDF (1.2 MB)',
    fechaEmision: '2024-02-10',
    estado: 'Disponible',
  },
  {
    id: '2',
    nombre: 'Carné Digital Institucional SENA',
    tipo: 'PNG / PDF',
    fechaEmision: '2024-02-05',
    estado: 'Disponible',
  },
  {
    id: '3',
    nombre: 'Constancia de Calificaciones y Asistencia',
    tipo: 'PDF (850 KB)',
    fechaEmision: '2026-08-20',
    estado: 'Disponible',
  },
  {
    id: '4',
    nombre: 'Paz y Salvo Académico de Trimestre',
    tipo: 'PDF',
    fechaEmision: '2026-08-01',
    estado: 'En Trámite',
  },
];

export default function DocumentosAprendizScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentoItem | null>(null);

  const downloadFile = (docName: string, tipo: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const content = `SERVICIO NACIONAL DE APRENDIZAJE - SENA\nSISTEMA INTELIGENTE DE GESTIÓN ACADÉMICA (AIMS)\n======================================================\n\nDOCUMENTO OFICIAL: ${docName.toUpperCase()}\nFORMATO: ${tipo}\nFECHA DE EMISIÓN: ${new Date().toLocaleDateString('es-CO')}\nCÓDIGO DE VERIFICACIÓN QR: SENA-VERIF-9982412\nESTADO: VÁLIDO Y VERIFICADO EN SISTEMA AIMS\n\n------------------------------------------------------\nEste documento es una constancia digital expedida oficialmente por el Centro de Formación SENA AIMS.`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${docName.replace(/\s+/g, '_')}_SENA.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleDownload = (doc: DocumentoItem) => {
    setSelectedDoc(doc);
    setModalVisible(true);
    downloadFile(doc.nombre, doc.tipo);
  };

  const pad = isDesktop ? 24 : 14;

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.contentContainer, { padding: pad }]}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Text style={styles.pageTitle}>Documentos y Certificados</Text>
        <Text style={styles.pageSubtitle}>
          Descarga tus certificados oficiales, carné digital e informes académicos.
        </Text>
      </View>

      {/* Documents Grid */}
      <View style={styles.gridContainer}>
        {DOCUMENTOS.map((doc) => (
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

            <Pressable
              style={({ hovered }: any) => [
                styles.downloadBtn,
                doc.estado === 'En Trámite' && styles.downloadBtnDisabled,
                hovered && doc.estado === 'Disponible' && styles.downloadBtnHover,
              ]}
              disabled={doc.estado === 'En Trámite'}
              onPress={() => handleDownload(doc)}
            >
              <Ionicons name="download-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.downloadBtnText}>
                {doc.estado === 'Disponible' ? 'Descargar Documento' : 'En generación...'}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>

      {/* Download Action Modal */}
      {selectedDoc && (
        <ActionModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title={`Descarga: ${selectedDoc.nombre}`}
          subtitle={`Formato: ${selectedDoc.tipo}`}
          iconName="cloud-download-outline"
          confirmText="Descargar Ahora"
          fields={[
            { label: 'Documento', placeholder: selectedDoc.nombre },
            { label: 'Código de Verificación QR', placeholder: 'SENA-VERIF-9982412' },
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
  downloadBtn: {
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
});





