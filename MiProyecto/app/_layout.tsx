import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      // 1. Asegurar viewport estricto en navegadores móviles
      let meta = document.querySelector('meta[name="viewport"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'viewport');
        document.head.appendChild(meta);
      }
      meta.setAttribute(
        'content',
        'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
      );

      // 2. Inyectar estilos globales para evitar desbordamiento horizontal y márgenes
      const styleId = 'aims-web-responsive-reset';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          html, body {
            width: 100% !important;
            max-width: 100% !important;
            min-height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow-x: hidden !important;
            background-color: #020308 !important;
            -webkit-text-size-adjust: 100% !important;
          }
          #root {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: 100vh !important;
            min-height: 100dvh !important;
            overflow-x: hidden !important;
          }
          * {
            box-sizing: border-box !important;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
        <Stack.Screen name="reset-password" options={{ headerShown: false }} />
        <Stack.Screen name="verify-email" options={{ headerShown: false }} />
        <Stack.Screen name="magic-verify" options={{ headerShown: false }} />
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
