import {configEnv} from "./config/env";
import {createApp} from "./app";
import * as admin from "firebase-admin";
import serviceAccount from "../serviceAccountKey.json";

configEnv();

const app = createApp();
const PORT = process.env.PORT || 3000;


const isLocal = process.env.FUNCTIONS_EMULATOR === "true" || process.env.NODE_ENV !== "production";

if (admin.apps.length === 0) {
    if (isLocal) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
            projectId: (serviceAccount as any).project_id,
        });
    } else {
        admin.initializeApp();
    }
}

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 Docs: http://localhost:${PORT}/docs`);
});
