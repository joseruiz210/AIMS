import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { authService } from './authService';

// Configurar el comportamiento de las notificaciones flotantes (in-app banner, sonido e insignia)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Solicita permisos de notificación al usuario, configura el canal prioritario en Android,
 * obtiene el Expo Push Token del dispositivo y lo envía automáticamente al backend de Azure.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // En entorno Web se omite limpiamente
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    // Configurar canal de notificación prioritaria en Android (requerido para Android 8.0+)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Notificaciones AIMS',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D4AF37',
        enableVibrate: true,
        showBadge: true,
      });
    }

    // Verificar permisos
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Push] Permiso para notificaciones push denegado o no concedido.');
      return null;
    }

    // Obtener Expo Push Token utilizando el projectId asignado en eas.json/app.json
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    const pushToken = tokenData.data;

    if (pushToken) {
      // Registrar el pushToken en el backend en Azure mediante el endpoint /users/push-token
      await authService.updatePushToken(pushToken);
    }

    return pushToken;
  } catch (error) {
    console.error('[Push] Error al registrar el token de notificación push:', error);
    return null;
  }
}
