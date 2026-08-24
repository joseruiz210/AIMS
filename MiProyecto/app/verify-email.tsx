import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { authService } from '../services/authService';

export default function VerifyEmailScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No se encontró el token de verificación.');
        return;
      }
      const res = await authService.verifyEmailToken(token);
      if (res.success) {
        setStatus('success');
        setMessage(res.message || 'Correo verificado correctamente.');
        setTimeout(() => router.replace('/'), 2000);
      } else {
        setStatus('error');
        setMessage(res.message || 'No se pudo verificar el correo.');
      }
    };
    verify();
  }, [token]);

  return (
    <View style={styles.container}>
      {status === 'loading' && (
        <>
          <ActivityIndicator size="large" color="#C59427" />
          <Text style={styles.text}>Verificando tu correo...</Text>
        </>
      )}
      {status === 'success' && (
        <>
          <Text style={styles.successText}>✓ {message}</Text>
          <Text style={styles.text}>Redirigiendo al inicio de sesión...</Text>
        </>
      )}
      {status === 'error' && (
        <>
          <Text style={styles.errorText}>✕ {message}</Text>
          <TouchableOpacity onPress={() => router.replace('/')} style={styles.button}>
            <Text style={styles.buttonText}>Volver al inicio de sesión</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B1220', padding: 24 },
  text: { color: '#94A3B8', marginTop: 16, fontSize: 15 },
  successText: { color: '#22C55E', fontSize: 18, fontWeight: '600', textAlign: 'center' },
  errorText: { color: '#EF4444', fontSize: 18, fontWeight: '600', textAlign: 'center' },
  button: { marginTop: 20, backgroundColor: '#C59427', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  buttonText: { color: '#0B1220', fontWeight: '700' },
});