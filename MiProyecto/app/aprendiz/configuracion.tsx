import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const NAVY_DARK = '#0F1026';
const NAVY = '#12103C';
const GOLD = '#D4AF37';
const GOLD_LIGHT = 'rgba(212, 175, 55, 0.12)';
const BORDER_COLOR = '#D0D8E4';
const BG_PAGE = '#F4F6F9';

const DOC_TYPES = ['CC', 'TI', 'CE', 'PPT', 'PASAPORTE'];

export default function ConfiguracionAprendiz() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const { updateUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [documentType, setDocumentType] = useState('CC');
  const [documentNumber, setDocumentNumber] = useState('');

  // Read-only account info
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('APRENDIZ');
  const [estadoAcademico, setEstadoAcademico] = useState('EN_FORMACION');
  const [fichaInfo, setFichaInfo] = useState<{
    numero?: string;
    programa?: string;
    jornada?: string;
    sede?: string;
    trimestre?: number;
  } | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await authService.getProfile();
      if (res.success && res.user) {
        const u = res.user;
        setFirstName(u.firstName || '');
        setLastName(u.lastName || '');
        setPhone(u.phone || '');
        setDocumentType(u.documentType || 'CC');
        setDocumentNumber(u.documentNumber || '');
        setEmail(u.email || '');
        setRole(u.role || 'APRENDIZ');
        setEstadoAcademico(u.estadoAcademico || 'EN_FORMACION');

        if (u.matriculas && u.matriculas.length > 0) {
          const mat = u.matriculas[0];
          setFichaInfo({
            numero: mat.ficha?.numero,
            programa: mat.ficha?.programa?.nombre,
            jornada: mat.ficha?.jornada,
            sede: mat.sede || mat.ficha?.sede,
            trimestre: mat.trimestre,
          });
        }
      } else {
        setMessage({ text: res.message || 'No fue posible cargar el perfil.', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error al conectar con el servidor para cargar el perfil.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setMessage(null);

    if (!firstName.trim()) {
      setMessage({ text: 'El nombre es obligatorio.', type: 'error' });
      return;
    }
    if (!lastName.trim()) {
      setMessage({ text: 'El apellido es obligatorio.', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      const res = await authService.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        documentType: documentType || undefined,
        documentNumber: documentNumber.trim() || undefined,
      });

      if (res.success && res.user) {
        setMessage({ text: 'Tus datos han sido actualizados exitosamente en la base de datos.', type: 'success' });
        // Actualizar contexto global
        const fullName = `${res.user.firstName || ''} ${res.user.lastName || ''}`.trim();
        updateUser({
          nombre: fullName,
        });
      } else {
        setMessage({ text: res.message || 'Error al actualizar los datos.', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Error de conexión al guardar cambios.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const pad = isDesktop ? 28 : 16;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GOLD} />
        <Text style={styles.loadingText}>Cargando información del aprendiz...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { padding: pad }]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIconBadge}>
          <Ionicons name="settings-outline" size={24} color={GOLD} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>Configuración de Perfil</Text>
          <Text style={styles.pageSubtitle}>
            Modifica tus datos personales básicos y consulta el estado actual de tu cuenta institucional.
          </Text>
        </View>
      </View>

      {/* Mensaje de feedback */}
      {message && (
        <View
          style={[
            styles.alertBox,
            message.type === 'success' ? styles.alertSuccess : styles.alertError,
          ]}
        >
          <Ionicons
            name={message.type === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline'}
            size={20}
            color={message.type === 'success' ? '#059669' : '#DC2626'}
            style={{ marginRight: 8 }}
          />
          <Text
            style={[
              styles.alertText,
              message.type === 'success' ? styles.alertTextSuccess : styles.alertTextError,
            ]}
          >
            {message.text}
          </Text>
        </View>
      )}

      {/* Grid: 2 columnas en desktop, 1 columna en mobile */}
      <View style={[styles.mainLayout, isDesktop && styles.mainLayoutDesktop]}>
        {/* Columna Izquierda: Formulario de edición */}
        <View style={[styles.card, isDesktop && styles.columnFlex]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIconWrap}>
              <Ionicons name="person-outline" size={18} color={NAVY} />
            </View>
            <Text style={styles.cardHeaderTitle}>Información Personal Editable</Text>
          </View>
          <Text style={styles.cardHeaderSub}>
            Estos datos se actualizan directamente en la base de datos del sistema académico.
          </Text>

          {/* Nombres y Apellidos */}
          <View style={[styles.formRow, isDesktop && styles.formRowSplit]}>
            <View style={[styles.formGroup, isDesktop && { flex: 1 }]}>
              <Text style={styles.inputLabel}>Nombres *</Text>
              <TextInput
                style={styles.textInput}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Ej. Juan Andrés"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={[styles.formGroup, isDesktop && { flex: 1 }]}>
              <Text style={styles.inputLabel}>Apellidos *</Text>
              <TextInput
                style={styles.textInput}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Ej. Rodríguez Pérez"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {/* Teléfono */}
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Número de Teléfono / WhatsApp</Text>
            <View style={styles.inputIconWrapper}>
              <Ionicons name="call-outline" size={18} color="#64748B" style={styles.inputLeftIcon} />
              <TextInput
                style={[styles.textInput, styles.textInputWithIcon]}
                value={phone}
                onChangeText={setPhone}
                placeholder="Ej. 3001234567"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Tipo de Documento */}
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Tipo de Documento</Text>
            <View style={styles.docTypeRow}>
              {DOC_TYPES.map((type) => {
                const isSelected = documentType === type;
                return (
                  <Pressable
                    key={type}
                    style={[styles.docTypeBtn, isSelected && styles.docTypeBtnActive]}
                    onPress={() => setDocumentType(type)}
                  >
                    <Text style={[styles.docTypeBtnText, isSelected && styles.docTypeBtnTextActive]}>
                      {type}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Número de Documento */}
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Número de Documento</Text>
            <View style={styles.inputIconWrapper}>
              <Ionicons name="card-outline" size={18} color="#64748B" style={styles.inputLeftIcon} />
              <TextInput
                style={[styles.textInput, styles.textInputWithIcon]}
                value={documentNumber}
                onChangeText={setDocumentNumber}
                placeholder="Ej. 1020304050"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Botón Guardar */}
          <Pressable
            style={({ hovered }: any) => [
              styles.saveBtn,
              hovered && styles.saveBtnHover,
              saving && styles.saveBtnDisabled,
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator size="small" color="#0B1228" />
                <Text style={styles.saveBtnText}>Guardando en base de datos...</Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="save-outline" size={18} color="#0B1228" />
                <Text style={styles.saveBtnText}>Guardar Cambios</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Columna Derecha: Información de Cuenta y Ficha (Solo Lectura) */}
        <View style={[styles.card, isDesktop && styles.columnFlex]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardHeaderIconWrap, { backgroundColor: GOLD_LIGHT }]}>
              <Ionicons name="shield-checkmark-outline" size={18} color={GOLD} />
            </View>
            <Text style={styles.cardHeaderTitle}>Detalles de Cuenta y Ficha</Text>
          </View>
          <Text style={styles.cardHeaderSub}>
            Información académica gestionada administrativamente por el centro de formación.
          </Text>

          {/* Correo Electrónico Institucional */}
          <View style={styles.readOnlyItem}>
            <Text style={styles.readOnlyLabel}>CORREO INSTITUCIONAL</Text>
            <View style={styles.readOnlyField}>
              <Ionicons name="mail" size={16} color="#64748B" style={{ marginRight: 8 }} />
              <Text style={styles.readOnlyValue}>{email || 'No disponible'}</Text>
            </View>
            <Text style={styles.readOnlyNote}>
              El correo está enlazado a tus credenciales de acceso y no es modificable desde este panel.
            </Text>
          </View>

          {/* Rol y Estado Académico */}
          <View style={[styles.formRow, isDesktop && styles.formRowSplit]}>
            <View style={[styles.readOnlyItem, isDesktop && { flex: 1 }]}>
              <Text style={styles.readOnlyLabel}>ROL ASIGNADO</Text>
              <View style={styles.badgeWrapper}>
                <View style={styles.badgeRole}>
                  <Text style={styles.badgeRoleText}>{role}</Text>
                </View>
              </View>
            </View>

            <View style={[styles.readOnlyItem, isDesktop && { flex: 1 }]}>
              <Text style={styles.readOnlyLabel}>ESTADO ACADÉMICO</Text>
              <View style={styles.badgeWrapper}>
                <View style={styles.badgeStatus}>
                  <Text style={styles.badgeStatusText}>
                    {estadoAcademico.replace('_', ' ')}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Datos de Ficha */}
          {fichaInfo ? (
            <View style={styles.fichaCard}>
              <View style={styles.fichaHeader}>
                <Ionicons name="school-outline" size={18} color={NAVY} style={{ marginRight: 6 }} />
                <Text style={styles.fichaTitle}>Ficha: {fichaInfo.numero || 'Sin asignar'}</Text>
              </View>
              {fichaInfo.programa && (
                <Text style={styles.fichaPrograma}>{fichaInfo.programa}</Text>
              )}
              <View style={styles.fichaMetaRow}>
                {fichaInfo.jornada && (
                  <View style={styles.fichaMetaBadge}>
                    <Text style={styles.fichaMetaText}>Jornada: {fichaInfo.jornada}</Text>
                  </View>
                )}
                {fichaInfo.trimestre !== undefined && (
                  <View style={styles.fichaMetaBadge}>
                    <Text style={styles.fichaMetaText}>Trimestre: {fichaInfo.trimestre}</Text>
                  </View>
                )}
                {fichaInfo.sede && (
                  <View style={styles.fichaMetaBadge}>
                    <Text style={styles.fichaMetaText}>Sede: {fichaInfo.sede}</Text>
                  </View>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.noFichaBox}>
              <Ionicons name="information-circle-outline" size={24} color="#64748B" />
              <Text style={styles.noFichaText}>
                No tienes ficha activa asignada en este momento.
              </Text>
            </View>
          )}

          {/* Seguridad y Privacidad */}
          <View style={styles.securityBox}>
            <Ionicons name="lock-closed-outline" size={16} color="#10B981" style={{ marginRight: 8 }} />
            <Text style={styles.securityText}>
              Tus datos personales se encuentran protegidos y cumplen los estándares de seguridad de AIMS.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_PAGE,
    width: '100%',
    maxWidth: '100%',
  },
  content: {
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG_PAGE,
    padding: 30,
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: NAVY,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: NAVY_DARK,
    letterSpacing: 0.5,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 18,
  },
  // Alertas
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  alertSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  alertError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  alertTextSuccess: {
    color: '#065F46',
  },
  alertTextError: {
    color: '#991B1B',
  },
  // Layout principal
  mainLayout: {
    flexDirection: 'column',
    gap: 20,
  },
  mainLayoutDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  columnFlex: {
    flex: 1,
  },
  // Tarjetas
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  cardHeaderIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(18, 16, 60, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: NAVY,
  },
  cardHeaderSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 18,
    lineHeight: 16,
  },
  // Formularios
  formRow: {
    flexDirection: 'column',
    gap: 12,
  },
  formRowSplit: {
    flexDirection: 'row',
    gap: 14,
  },
  formGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: NAVY,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: NAVY_DARK,
    fontWeight: '500',
  },
  inputIconWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputLeftIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 2,
  },
  textInputWithIcon: {
    paddingLeft: 38,
  },
  // Tipo Documento selector
  docTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  docTypeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  docTypeBtnActive: {
    backgroundColor: NAVY,
    borderColor: GOLD,
  },
  docTypeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  docTypeBtnTextActive: {
    color: '#FFFFFF',
  },
  // Botón Guardar
  saveBtn: {
    backgroundColor: GOLD,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  saveBtnHover: {
    opacity: 0.9,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B1228',
    letterSpacing: 0.5,
  },
  // Detalles solo lectura
  readOnlyItem: {
    marginBottom: 14,
  },
  readOnlyLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  readOnlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  readOnlyValue: {
    fontSize: 13,
    color: NAVY,
    fontWeight: '600',
  },
  readOnlyNote: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    fontStyle: 'italic',
  },
  badgeWrapper: {
    flexDirection: 'row',
    marginTop: 2,
  },
  badgeRole: {
    backgroundColor: 'rgba(18, 16, 60, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(18, 16, 60, 0.2)',
  },
  badgeRoleText: {
    fontSize: 11,
    fontWeight: '800',
    color: NAVY,
  },
  badgeStatus: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  badgeStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  fichaCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    marginTop: 6,
    marginBottom: 14,
  },
  fichaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  fichaTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: NAVY,
  },
  fichaPrograma: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 10,
    lineHeight: 16,
  },
  fichaMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  fichaMetaBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fichaMetaText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  noFichaBox: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 10,
    gap: 6,
  },
  noFichaText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 4,
  },
  securityText: {
    flex: 1,
    fontSize: 11,
    color: '#166534',
    lineHeight: 15,
  },
});
