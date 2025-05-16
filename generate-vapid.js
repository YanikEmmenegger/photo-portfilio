// generate-vapid.js
import webpush from 'web-push';

const vapidKeys = webpush.generateVAPIDKeys();
console.log("Public VAPID Key:", vapidKeys.publicKey);
console.log("Private VAPID Key:", vapidKeys.privateKey);
