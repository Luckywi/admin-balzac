/* eslint-disable no-undef */
/* eslint-env node */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.sendNewRdvNotification = functions.firestore
  .document('rdvs/{rdvId}')
  .onCreate(async (snap, context) => {
    const rdv = snap.data();

    const tokensSnapshot = await admin.firestore().collection('deviceTokens').get();
    const tokens = tokensSnapshot.docs.map(doc => doc.id);

    if (tokens.length === 0) {
      console.log('Aucun device token trouvé.');
      return;
    }

    const rdvDate = rdv.start.toDate();
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
        rdvId: context.params.rdvId,
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      }
    };

    try {
      const response = await admin.messaging().sendToDevice(tokens, payload);
      console.log(`✅ ${response.successCount} notification(s) envoyée(s) sur ${tokens.length}`);
    } catch (error) {
      console.error('❌ Erreur d’envoi des notifications :', error);
    }
  });
