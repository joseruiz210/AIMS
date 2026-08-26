import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export default function MagicVerifyScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { setSession } = useAuth();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No se encontró el token de acceso.');
        return;
      }
      const res = await authService.verifyMagicLinkToken(token);
      if (res.success && res.user) {
        setSession(res.user);
      } else {
        setStatus('error');
        setMessage(res.message || 'El enlace es inválido o expiró.');
      }
    };
    verify();
  }, [token, setSession]);

  return (
    <View style={styles.container}>
      {status === 'loading' && (
        <>
          <ActivityIndicator size="large" color="#C59427" />
          <Text style={styles.text}>Verificando tu acceso...</Text>
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
  errorText: { color: '#EF4444', fontSize: 18, fontWeight: '600', textAlign: 'center' },
  button: { marginTop: 20, backgroundColor: '#C59427', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  buttonText: { color: '#0B1220', fontWeight: '700' },
});