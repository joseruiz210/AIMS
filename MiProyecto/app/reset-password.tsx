import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';

// ===== Misma lógica de validación que usa el register =====
function getPasswordValidation(password: string) {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]~`;']/.test(password),
  };

  const score = Object.values(requirements).filter(Boolean).length;
  const isValid = score === 5;

  let strengthText = 'Muy débil';
  let strengthColor = '#EF4444';
  if (score === 5) {
    strengthText = 'Muy fuerte';
    strengthColor = '#10B981';
  } else if (score === 4) {
    strengthText = 'Fuerte';
    strengthColor = '#22C55E';
  } else if (score === 3) {
    strengthText = 'Media';
    strengthColor = '#F59E0B';
  } else if (score === 2) {
    strengthText = 'Débil';
    strengthColor = '#F97316';
  }

  return { requirements, score, isValid, strengthText, strengthColor };
}

export default function ResetPasswordScreen() {
  const { token: paramToken } = useLocalSearchParams<{ token: string }>();
  const [token, setToken] = useState(paramToken || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const passValidation = getPasswordValidation(password);
  const passMatches = confirm.length > 0 && password === confirm;

  const handleSubmit = async () => {
    setMessage(null);

    const cleanToken = token.trim();
    if (!cleanToken) {
      setMessage({ text: 'Por favor ingresa o pega el token de recuperación que recibiste por correo.', isError: true });
      return;
    }

    if (!password || !confirm) {
      setMessage({ text: 'Por favor completa todos los campos.', isError: true });
      return;
    }

    if (!passValidation.isValid) {
      setMessage({ text: 'La contraseña no cumple con los requisitos de seguridad.', isError: true });
      return;
    }

    if (!passMatches) {
      setMessage({ text: 'Las contraseñas no coinciden.', isError: true });
      return;
    }

    setLoading(true);
    const res = await authService.resetPassword(cleanToken, password);
    setMessage({ text: res.message || '', isError: !res.success });
    setLoading(false);
    if (res.success) {
      setTimeout(() => router.replace('/'), 2000);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <View style={styles.circleTop} />
        <View style={styles.circleBottom} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Image
              source={require('../assets/images/logo.jpeg')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.brand}>AIMS</Text>
            <Text style={styles.title}>NUEVA CONTRASEÑA</Text>
            <Text style={styles.subtitle}>Ingresa el código que recibiste por correo y crea tu nueva contraseña.</Text>

            <Text style={styles.label}>Token / Código de recuperación</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="key-outline" size={18} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Pega aquí el token recibido"
                placeholderTextColor="#94A3B8"
                value={token}
                onChangeText={(t) => {
                  setToken(t);
                  if (message) setMessage(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Text style={styles.label}>Nueva contraseña</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            {/* ===== VALIDACIÓN DE CONTRASEÑA EN TIEMPO REAL (igual que en register) ===== */}
            {password.length > 0 && (
              <View style={styles.passValidationBox}>
                <View style={styles.passHeaderRow}>
                  <Text style={styles.passValidationTitle}>Fortaleza de Contraseña:</Text>
                  <Text style={[styles.passStrengthLabel, { color: passValidation.strengthColor }]}>
                    {passValidation.strengthText}
                  </Text>
                </View>

                <View style={styles.strengthBarBackground}>
                  <View
                    style={[
                      styles.strengthBarFill,
                      {
                        width: `${(passValidation.score / 5) * 100}%`,
                        backgroundColor: passValidation.strengthColor,
                      },
                    ]}
                  />
                </View>

                <View style={styles.reqList}>
                  <View style={styles.reqItem}>
                    <Ionicons
                      name={passValidation.requirements.minLength ? 'checkmark-circle' : 'ellipse-outline'}
                      size={14}
                      color={passValidation.requirements.minLength ? '#10B981' : '#94A3B8'}
                    />
                    <Text style={[styles.reqText, passValidation.requirements.minLength && styles.reqTextSuccess]}>
                      Mínimo 8 caracteres
                    </Text>
                  </View>

                  <View style={styles.reqItem}>
                    <Ionicons
                      name={passValidation.requirements.hasUppercase ? 'checkmark-circle' : 'ellipse-outline'}
                      size={14}
                      color={passValidation.requirements.hasUppercase ? '#10B981' : '#94A3B8'}
                    />
                    <Text style={[styles.reqText, passValidation.requirements.hasUppercase && styles.reqTextSuccess]}>
                      Al menos una mayúscula (A-Z)
                    </Text>
                  </View>

                  <View style={styles.reqItem}>
                    <Ionicons
                      name={passValidation.requirements.hasLowercase ? 'checkmark-circle' : 'ellipse-outline'}
                      size={14}
                      color={passValidation.requirements.hasLowercase ? '#10B981' : '#94A3B8'}
                    />
                    <Text style={[styles.reqText, passValidation.requirements.hasLowercase && styles.reqTextSuccess]}>
                      Al menos una minúscula (a-z)
                    </Text>
                  </View>

                  <View style={styles.reqItem}>
                    <Ionicons
                      name={passValidation.requirements.hasNumber ? 'checkmark-circle' : 'ellipse-outline'}
                      size={14}
                      color={passValidation.requirements.hasNumber ? '#10B981' : '#94A3B8'}
                    />
                    <Text style={[styles.reqText, passValidation.requirements.hasNumber && styles.reqTextSuccess]}>
                      Al menos un número (0-9)
                    </Text>
                  </View>

                  <View style={styles.reqItem}>
                    <Ionicons
                      name={passValidation.requirements.hasSpecialChar ? 'checkmark-circle' : 'ellipse-outline'}
                      size={14}
                      color={passValidation.requirements.hasSpecialChar ? '#10B981' : '#94A3B8'}
                    />
                    <Text style={[styles.reqText, passValidation.requirements.hasSpecialChar && styles.reqTextSuccess]}>
                      Al menos un símbolo (!@#$%^&*)
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <Text style={styles.label}>Confirmar contraseña</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showConfirm}
                value={confirm}
                onChangeText={setConfirm}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                <Ionicons
                  name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
            {confirm.length > 0 && (
              <Text style={[styles.matchText, passMatches ? styles.matchSuccess : styles.matchError]}>
                {passMatches ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
              </Text>
            )}

            {message && (
              <Text style={message.isError ? styles.errorText : styles.successText}>
                {message.text}
              </Text>
            )}

            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
              <Text style={styles.buttonText}>
                {loading ? 'Guardando...' : 'Restablecer contraseña →'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/forgot-password')} style={styles.secondaryLinkWrapper}>
              <Text style={styles.secondaryLink}>¿No tienes un token? Solicitar nuevo enlace</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace('/')} style={styles.linkWrapper}>
              <Text style={styles.link}>← Volver al inicio de sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const GOLD = '#C59427';
const NAVY = '#0B1220';

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: NAVY, width: '100%', maxWidth: '100%', overflow: 'hidden' },
  container: { flex: 1, backgroundColor: NAVY, width: '100%', maxWidth: '100%', overflow: 'hidden' },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  circleTop: {
    position: 'absolute',
    top: -140,
    left: '50%',
    marginLeft: -160,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#3A2E12',
    opacity: 0.6,
  },
  circleBottom: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#141C3A',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderTopWidth: 3,
    borderTopColor: GOLD,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: { width: 56, height: 56, marginBottom: 8 },
  brand: {
    color: NAVY,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1,
    marginBottom: 16,
  },
  title: {
    color: NAVY,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  label: {
    alignSelf: 'flex-start',
    color: '#1E293B',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: '#1E293B',
    fontSize: 14,
  },
  button: {
    backgroundColor: GOLD,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginTop: 4,
  },
  buttonText: { color: NAVY, fontWeight: '800', fontSize: 14 },
  errorText: { color: '#EF4444', marginBottom: 12, fontSize: 13, textAlign: 'center' },
  successText: { color: '#22C55E', marginBottom: 12, fontSize: 13, textAlign: 'center' },

  /* Validación de contraseña en vivo (mismo estilo que register, adaptado a fondo blanco) */
  passValidationBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
  },
  passHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  passValidationTitle: {
    color: '#475569',
    fontSize: 11,
  },
  passStrengthLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  strengthBarBackground: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  reqList: {
    gap: 4,
  },
  reqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reqText: {
    fontSize: 11,
    color: '#64748B',
  },
  reqTextSuccess: {
    color: '#10B981',
    fontWeight: '600',
  },
  matchText: {
    fontSize: 11,
    marginTop: -10,
    marginBottom: 12,
    fontWeight: '600',
    alignSelf: 'flex-start',
  },
  matchSuccess: {
    color: '#10B981',
  },
  matchError: {
    color: '#F87171',
  },
  secondaryLinkWrapper: {
    marginTop: 16,
    alignItems: 'center',
  },
  secondaryLink: {
    color: '#64748B',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  linkWrapper: {
    marginTop: 14,
    alignItems: 'center',
  },
  link: {
    color: GOLD,
    fontSize: 13,
    fontWeight: '700',
  },
});