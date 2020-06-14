import * as admin from "firebase-admin";
//import * as serviceAccount from "../key/serviceAcountKey.json";
const serviceAccount = require("../key/serviceAcountKey.json");
import config from "./config";
const { databaseURL, storageBucket } = config;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL,
  storageBucket,
});

export const db = admin.firestore();
export const cloud = admin.storage();
