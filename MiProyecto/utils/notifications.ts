import { Platform } from 'react-native';
import { authService } from '../services/authService';

/**
 * Registra el dispositivo actual para recibir notificaciones push mediante Expo
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // En Web o emuladores sin soporte de Google Play, manejar de forma silenciosa
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    // Import dinámico para no romper entornos donde expo-notifications no esté instalado
    let Notifications: any;
    try {
      Notifications = await (Function('return import("expo-notifications")')());
    } catch {
      console.log('[Push] expo-notifications no está disponible en este entorno.');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Push] Permiso para notificaciones denegado.');
      return null;
    }

    // Configuración para Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D4AF37',
      });
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const pushToken = tokenData.data;

    if (pushToken) {
      // Enviar el token al backend para asociarlo con el usuario actual
      await authService.updatePushToken(pushToken);
    }

    return pushToken;
  } catch (error: any) {
    console.warn('[Push] Error al registrar notificaciones push:', error?.message);
    return null;
  }
}
