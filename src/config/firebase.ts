import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { requireEnv } from "./env";

const projectId = requireEnv("FIREBASE_PROJECT_ID");
const clientEmail = requireEnv("FIREBASE_CLIENT_EMAIL");

const privateKey = requireEnv("FIREBASE_PRIVATE_KEY")
    .replace(/\\n/g, "\n");

const firebaseApp =
    getApps().length > 0
        ? getApps()[0]
        : initializeApp({
              credential: cert({
                  projectId,
                  clientEmail,
                  privateKey
              })
          });

export const db = getFirestore(firebaseApp);

export default firebaseApp;