import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';
import { Platform } from 'react-native';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

const RECAPTCHA_SITE_KEY = process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

function AppStack() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="admin" options={{ headerShown: false }} />
        <Stack.Screen name="aprendiz" options={{ headerShown: false }} />
        <Stack.Screen name="instructor" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="light" />
    </AuthProvider>
  );
}

export default function RootLayout() {
  if (Platform.OS === 'web') {
    return (
      <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY} language="es">
        <AppStack />
      </GoogleReCaptchaProvider>
    );
  }
  return <AppStack />;
}
