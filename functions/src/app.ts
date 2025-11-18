import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import {swaggerSpec} from "./config/swagger";
import {router} from "./routes";
import {errorHandler} from "./middlewares/errorHandler";
import * as admin from "firebase-admin";
import {db} from "./firebase/firebase";

export function createApp() {
    const app = express();

    // Globals Middlewares
    app.use(cors());
    app.use(express.json());
    app.use(morgan("dev"));
    app.use(cookieParser());

    // Swagger UI
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Health check
    app.get("/health", async (_req, res) => {
        const firebaseStatus = admin.apps.length !== 0 ? "ok" : "error";
        let firestoreStatus: string;

        try {
            await db.collection("_status").limit(1).get();
            firestoreStatus = "ok";
        } catch (e) {
            console.error("Firestore unreachable:", e);
            firestoreStatus = "error";
        }

        const statusCode: 200 | 500 =
            firebaseStatus === "ok" && firestoreStatus === "ok" ? 200 : 500;

        return res.status(statusCode).json({
            status: "started",
            firebaseStatus,
            firestoreStatus,
            time: new Date().toISOString(),
        });
    });

    // Routes API
    app.use("/", router);

    // Error Middleware
    app.use(errorHandler);

    return app;
}
