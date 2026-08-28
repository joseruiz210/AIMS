import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';
import { LogBox, Platform } from 'react-native';

// Ocultar advertencias de deprecación de estilos y mensajes COOP de la consola en Web y App
LogBox.ignoreLogs([
  '"shadow*" style props are deprecated',
  'props.pointerEvents is deprecated',
  'Cross-Origin-Opener-Policy',
]);

if (Platform.OS === 'web' && typeof window !== 'undefined') {
  // Evitar que errores no capturados de extensiones o COOP aparezcan en la consola de la web
  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (msg.includes('startTime') || msg.includes('Cross-Origin-Opener-Policy')) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || String(event.reason || '');
    if (reason.includes('startTime') || reason.includes('Cross-Origin-Opener-Policy')) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const msg = args[0];
    if (typeof msg === 'string' && (msg.includes('shadow*') || msg.includes('pointerEvents'))) {
      return;
    }
    originalWarn(...args);
  };

  const originalError = console.error;
  console.error = (...args: any[]) => {
    const msg = args[0] ? String(args[0]) : '';
    if (msg.includes('Cross-Origin-Opener-Policy') || msg.includes('startTime')) {
      return;
    }
    originalError(...args);
  };
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
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
