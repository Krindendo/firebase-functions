import * as admin from "firebase-admin";
import * as serviceAccount from "../key/serviceAcountKey.json";
import config from "./config";
const { databaseURL, storageBucket } = config;
admin.initializeApp({
  credential: admin.credential.cert({
    privateKey: serviceAccount.private_key,
    clientEmail: serviceAccount.client_email,
    projectId: serviceAccount.project_id,
  }),
  databaseURL,
  storageBucket,
});

export const db = admin.firestore();
export const cloud = admin.storage();
