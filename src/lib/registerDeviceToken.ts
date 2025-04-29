import { getToken } from "firebase/messaging";
import { messaging, db } from './firebase';
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function registerDeviceToken() {
  try {
    const token = await getToken(messaging); // PAS de vapidKey ici
    if (token) {
      await setDoc(doc(db, 'deviceTokens', token), {
        createdAt: serverTimestamp()
      });
      console.log('Device Token enregistré:', token);
    }
  } catch (error) {
    console.error('Erreur d’enregistrement du token FCM', error);
  }
}
