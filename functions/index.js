import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();

export const sendNewRdvNotification = functions.firestore
  .document('rdvs/{rdvId}')
  .onCreate(async (snap, context) => {
    const rdv = snap.data();

    const tokensSnapshot = await admin.firestore().collection('deviceTokens').get();
    const tokens = tokensSnapshot.docs.map(doc => doc.id);

    if (tokens.length === 0) {
      console.log('Aucun device token trouvé.');
      return;
    }

    // 🕒 Format de la date/heure du RDV
    const rdvDate = rdv.start.toDate(); // Convertir Firestore Timestamp en JS Date
    const formattedDate = rdvDate.toLocaleString('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const payload = {
      notification: {
        title: '📅 Nouveau rendez-vous !',
        body: `${rdv.clientName} a pris un RDV le ${formattedDate}`,
        sound: 'default',
      },
      data: {
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        rdvId: context.params.rdvId
      }
    };

    try {
        const response = await admin.messaging().sendToDevice(tokens, payload);
        console.log(`✅ ${response.successCount} notification(s) envoyée(s) sur ${tokens.length}`);        
    } catch (error) {
      console.error('Erreur d’envoi des notifications:', error);
    }
  });
