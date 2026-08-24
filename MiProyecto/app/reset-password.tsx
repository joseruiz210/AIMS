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

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (password !== confirm) {
      setMessage({ text: 'Las contraseñas no coinciden.', isError: true });
      return;
    }
    if (!token) {
      setMessage({ text: 'Token no encontrado en el enlace.', isError: true });
      return;
    }
    setLoading(true);
    setMessage(null);
    const res = await authService.resetPassword(token, password);
    setMessage({ text: res.message || '', isError: !res.success });
    setLoading(false);
    if (res.success) {
      setTimeout(() => router.replace('/'), 1500);
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
            <Text style={styles.subtitle}>Crea una nueva contraseña para tu cuenta.</Text>

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
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const GOLD = '#C59427';
const NAVY = '#0B1220';

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: NAVY },
  container: { flex: 1, backgroundColor: NAVY },
  scrollContent: {   flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',   // 👈 centra horizontalmente en web
    padding: 24,
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
    maxWidth: 420,          // 👈 esto es lo que evita que se estire
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
});