import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import {swaggerSpec} from "./config/swagger";
import {router} from "./routes";
import {errorHandler} from "./middlewares/errorHandler";

export function createApp() {
    const app = express();

    // Middlewares globaux
    app.use(cors());
    app.use(express.json());
    app.use(morgan("dev"));
    app.use(cookieParser());

    // Swagger UI
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Routes API
    app.use("/api", router);

    // Middleware d’erreur
    app.use(errorHandler);

    return app;
}

