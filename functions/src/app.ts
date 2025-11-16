import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import {swaggerSpec} from "./config/swagger";
import {router} from "./routes";
import {errorHandler} from "./middlewares/errorHandler";
import * as admin from "firebase-admin";


export function createApp() {
    const app = express();

    // Middlewares globaux
    app.use(cors());
    app.use(express.json());
    app.use(morgan("dev"));
    app.use(cookieParser());

    // Swagger UI
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Health check
    app.use("/health", async (_req, res) => {
        let firebaseStatus: string = admin.app.length != 0 ? "ok" : "error";
        let firestoreStatus: string;
        try {
            await admin.firestore().collection("_status").limit(1).get();
            firestoreStatus = "ok";
        } catch (e) {
            console.error("Firestore unreachable:", e);
            firestoreStatus = "error";
        }
        let status: number = firebaseStatus === "ok" && firestoreStatus === "ok" ? 200 : 500;

        return res.status(status).json({
            "status": "started",
            "firebaseStatus": firebaseStatus,
            "firestoreStatus": firestoreStatus
        });
    })

    // Routes API
    app.use("/api", router);

    // Middleware d’erreur
    app.use(errorHandler);

    return app;
}

