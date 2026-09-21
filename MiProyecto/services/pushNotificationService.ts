import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { authService } from './authService';

// Detectar si la aplicación se ejecuta dentro de Expo Go
const isExpoGo =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let NotificationsModule: any = null;

function getNotifications(): any {
  if (isExpoGo || Platform.OS === 'web') return null;
  if (NotificationsModule) return NotificationsModule;
  try {
    NotificationsModule = require('expo-notifications');
    return NotificationsModule;
  } catch {
    console.log('[Push] expo-notifications no está disponible en este entorno.');
    return null;
  }
}

/**
 * Solicita permisos de notificación al usuario, configura el canal prioritario en Android,
 * obtiene el Expo Push Token del dispositivo y lo envía automáticamente al backend.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // En Web o Expo Go (SDK 53+) se omite de forma segura sin romper la aplicación
  if (Platform.OS === 'web' || isExpoGo) {
    if (isExpoGo) {
      console.log('[Push] Notificaciones push omitidas en Expo Go (SDK 53+ requiere build de desarrollo / APK).');
    }
    return null;
  }

  const Notifications = getNotifications();
  if (!Notifications) return null;

  try {
    // Configurar el comportamiento de notificaciones de forma segura
    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    } catch {
      // Ignorar si el manejador no está disponible en este entorno
    }

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
      // Registrar el pushToken en el backend mediante el endpoint /users/push-token
      await authService.updatePushToken(pushToken);
    }

    return pushToken;
  } catch (error) {
    console.error('[Push] Error al registrar el token de notificación push:', error);
    return null;
  }
}


