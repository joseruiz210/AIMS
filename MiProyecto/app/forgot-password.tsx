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
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';

export default function ForgotPasswordScreen() {
  const [correo, setCorreo] = useState('');
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);
    const res = await authService.forgotPassword(correo);
    setMessage({ text: res.message || '', isError: !res.success });
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* Círculos decorativos de fondo */}
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
            <Text style={styles.title}>RECUPERAR CONTRASEÑA</Text>
            <Text style={styles.subtitle}>
              Ingresa tu correo y te enviaremos un enlace para restablecerla.
            </Text>

            <Text style={styles.label}>Correo Institucional / Matrícula</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="correo@institucion.edu"
                placeholderTextColor="#94A3B8"
                value={correo}
                onChangeText={setCorreo}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {message && (
              <Text style={message.isError ? styles.errorText : styles.successText}>
                {message.text}
              </Text>
            )}

            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
              <Text style={styles.buttonText}>
                {loading ? 'Enviando...' : 'Enviar enlace →'}
              </Text>
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
    maxWidth: 420,          // esto es lo que evita que se estire
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
  linkWrapper: { marginTop: 18 },
  link: { color: '#64748B', fontSize: 13 },
  errorText: { color: '#EF4444', marginBottom: 12, fontSize: 13, textAlign: 'center' },
  successText: { color: '#22C55E', marginBottom: 12, fontSize: 13, textAlign: 'center' },
});