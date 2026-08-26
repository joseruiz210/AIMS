import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack>
        {/* Definimos nuestra pantalla principal (index.tsx) y le ocultamos la barra superior para que se vea el fondo oscuro completo */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="aprendiz" options={{ headerShown: false }} />
        <Stack.Screen name="instructor" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      {/* Ponemos la barra de estado del celular (hora, batería) en color claro para que resalte con el fondo oscuro */}
      <StatusBar style="light" />
    </>
  );
}
