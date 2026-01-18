import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { router } from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { validateFirebaseIdToken } from "./middlewares/auth";
import * as admin from "firebase-admin";
import { db } from "./firebase/firebase";

/**
 * Create and configure the Express application.
 * @return {express.Application} The configured Express application.
 */
export function createApp() {
  const app = express();

  // Globals Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));
  app.use(cookieParser());

  // Swagger UI
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  /**
   * @swagger
   * /health:
   *   get:
 *     summary: Vérifie l'état de l'API
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: API opérationnelle
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: started
   *                 firebaseStatus:
   *                   type: string
   *                   example: ok
   *                 firestoreStatus:
   *                   type: string
   *                   example: ok
   *                 time:
   *                   type: string
   *                   format: date-time
   *       500:
   *         description: Erreur de connexion aux services Firebase
   */
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
  // Security: Verify Firebase Token for all API routes
  app.use(validateFirebaseIdToken);
  app.use("/", router);

  // Error Middleware
  app.use(errorHandler);

  return app;
}
