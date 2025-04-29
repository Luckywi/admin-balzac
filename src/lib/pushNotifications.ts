import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { db } from './firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function registerPushNotifications() {
  if (!Capacitor.isNativePlatform()) return;

  // Demander l'autorisation à l'utilisateur
  const permStatus = await PushNotifications.requestPermissions();
  if (permStatus.receive !== 'granted') {
    console.warn('Notifications non autorisées.');
    return;
  }

  // Enregistrement du device pour recevoir des notifs
  await PushNotifications.register();

  // 🔑 Récupérer le device token
  PushNotifications.addListener('registration', async (token) => {
    console.log('📲 Token reçu :', token.value);

    try {
      await setDoc(doc(db, 'deviceTokens', token.value), {
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error('❌ Erreur Firestore:', err);
    }
  });

  PushNotifications.addListener('registrationError', (error) => {
    console.error('❌ Erreur lors de l’enregistrement:', error);
  });

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('🔔 Notification reçue (foreground):', notification);
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('👆 Notification tapée:', notification.notification);
  });
}
