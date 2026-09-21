import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';

export default function VerifyEmailScreen() {
  const { token: paramToken } = useLocalSearchParams<{ token: string }>();
  const [token, setToken] = useState(paramToken || '');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(paramToken ? 'loading' : 'idle');
  const [message, setMessage] = useState('');

  const handleVerify = async (tokenToVerify?: string) => {
    const t = (tokenToVerify || token).trim();
    if (!t) {
      setStatus('error');
      setMessage('Por favor ingresa el token de verificación que recibiste por correo.');
      return;
    }
    setStatus('loading');
    setMessage('');
    const res = await authService.verifyEmailToken(t);
    if (res.success) {
      setStatus('success');
      setMessage(res.message || 'Correo verificado correctamente.');
      setTimeout(() => router.replace('/'), 2000);
    } else {
      setStatus('error');
      setMessage(res.message || 'No se pudo verificar el correo.');
    }
  };

  useEffect(() => {
    if (paramToken) {
      handleVerify(paramToken);
    }
  }, [paramToken]);

  return (
    <View style={styles.container}>
      {status === 'loading' && (
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#C59427" />
          <Text style={styles.text}>Verificando tu correo...</Text>
        </View>
      )}

      {status === 'success' && (
        <View style={styles.card}>
          <Ionicons name="checkmark-circle" size={48} color="#22C55E" style={{ marginBottom: 12 }} />
          <Text style={styles.successText}>{message}</Text>
          <Text style={styles.text}>Redirigiendo al inicio de sesión...</Text>
        </View>
      )}

      {(status === 'error' || status === 'idle') && (
        <View style={styles.card}>
          <Ionicons
            name={status === 'error' ? 'alert-circle' : 'mail-outline'}
            size={48}
            color={status === 'error' ? '#EF4444' : '#C59427'}
            style={{ marginBottom: 12 }}
          />
          <Text style={styles.title}>VERIFICAR CORREO</Text>
          <Text style={styles.subtitle}>
            Ingresa el código o token de verificación que recibiste en tu correo electrónico.
          </Text>

          <View style={styles.inputWrapper}>
            <Ionicons name="key-outline" size={18} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Pega aquí el código de verificación"
              placeholderTextColor="#94A3B8"
              value={token}
              onChangeText={(val) => {
                setToken(val);
                if (message) setMessage('');
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {message ? (
            <Text style={status === 'error' ? styles.errorText : styles.successText}>
              {message}
            </Text>
          ) : null}

          <TouchableOpacity style={styles.button} onPress={() => handleVerify()}>
            <Text style={styles.buttonText}>Confirmar y Activar Cuenta →</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/')} style={styles.linkWrapper}>
            <Text style={styles.link}>← Volver al inicio de sesión</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const GOLD = '#C59427';
const NAVY = '#0B1220';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: NAVY,
    padding: 20,
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
    elevation: 8,
  },
  title: {
    color: NAVY,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
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
  text: { color: '#64748B', marginTop: 12, fontSize: 14, textAlign: 'center' },
  successText: { color: '#22C55E', fontSize: 15, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  errorText: { color: '#EF4444', fontSize: 13, fontWeight: '600', textAlign: 'center', marginBottom: 12 },
  button: {
    backgroundColor: GOLD,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginTop: 6,
  },
  buttonText: { color: NAVY, fontWeight: '800', fontSize: 14 },
  linkWrapper: { marginTop: 16 },
  link: { color: '#64748B', fontSize: 13 },
});