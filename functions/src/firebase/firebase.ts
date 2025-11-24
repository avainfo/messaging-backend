import * as admin from "firebase-admin";
import serviceAccountJson from "../../serviceAccountKey.json";

const isLocal =
  process.env.FUNCTIONS_EMULATOR === "true" ||
  process.env.NODE_ENV !== "production";

if (admin.apps.length === 0) {
  if (isLocal) {
    const serviceAccount = serviceAccountJson as admin.ServiceAccount;

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: (serviceAccount as unknown as { project_id: string })
        .project_id,
    });
  } else {
    admin.initializeApp();
  }
}

export const db = admin.firestore();
