/* eslint-disable no-undef */
/* eslint-env node */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendNewRdvNotification = functions.firestore
  .document('rdvs/{rdvId}')
  .onCreate(async (snap, context) => {
    const rdv = snap.data();
    console.log("Nouveau document de rendez-vous créé:", context.params.rdvId);  // Log du rdvId du document créé

    // Vérification de la présence des données nécessaires
    const rdvStartDate = rdv.start ? new Date(rdv.start) : null;
    console.log("Date de début du rendez-vous:", rdvStartDate);

    // Si les dates sont valides, les formater. Sinon, utiliser une valeur par défaut.
    const formattedDate = rdvStartDate && !isNaN(rdvStartDate.getTime())
      ? rdvStartDate.toLocaleString('fr-FR', {
          weekday: 'short',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Date de rendez-vous non spécifiée';

    console.log("Date formatée pour la notification:", formattedDate); // Log de la date formatée

    // Si le nom du client est valide, l'utiliser. Sinon, marquer comme "Client non spécifié".
    const clientName = rdv.clientName ? rdv.clientName : 'Client non spécifié';
    console.log("Nom du client:", clientName);  // Log du nom du client

    // Payload de la notification
    const payload = {
      notification: {
        title: '📅 Nouveau rendez-vous !',
        body: `Un rendez-vous a été pris par ${clientName} le ${formattedDate}`,
        sound: 'default',
      },
      data: {
        rdvId: context.params.rdvId,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
    };

    try {
      // Récupérer tous les tokens d'appareils enregistrés
      console.log("Récupération des tokens d'appareils...");
      const tokensSnapshot = await admin.firestore().collection('deviceTokens').get();
      const tokens = tokensSnapshot.docs.map((doc) => doc.id);

      if (tokens.length === 0) {
        console.log('Aucun token trouvé pour envoyer la notification.');
        return null; // Aucun token, donc on ne fait rien
      }

      console.log(`Tokens récupérés : ${tokens.length} token(s)`);  // Log du nombre de tokens récupérés

      // Envoi de la notification aux appareils enregistrés
      console.log("Envoi de la notification...");
      const response = await admin.messaging().sendToDevice(tokens, payload);
      console.log(`✅ ${response.successCount} notification(s) envoyée(s) sur ${tokens.length}`);

      // Si l'envoi a échoué pour certains tokens, on les logue
      if (response.failureCount > 0) {
        console.log(`Échec de l'envoi pour ${response.failureCount} token(s)`);
        response.results.forEach((result, index) => {
          if (result.error) {
            console.log(`Erreur pour le token ${tokens[index]} : ${result.error.message}`);
          }
        });
      }

    } catch (error) {
      // Si une erreur se produit, loguer l'erreur sans interrompre la fonction
      console.error("Erreur lors de l'envoi de la notification:", error);
      return null; // Retourner null si une erreur se produit, mais sans échouer
    }
  });
