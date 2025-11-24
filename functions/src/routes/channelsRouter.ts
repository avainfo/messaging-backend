import { Router } from "express";
import { createChannel, getChannels } from "../firebase/channel-utils";

export const channelsRouter: Router = Router({ mergeParams: true });

/**
 * @swagger
 * /servers/{serverId}/channels:
 *   get:
 *     summary: Liste des channels d'un serveur
 *     tags: [Channels]
 *     parameters:
 *       - in: path
 *         name: serverId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du serveur
 *     responses:
 *       200:
 *         description: Liste des channels
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   serverId:
 *                     type: string
 *                   name:
 *                     type: string
 *                   type:
 *                     type: string
 *                     enum: [text]
 *                   createdAt:
 *                     type: object
 *                     nullable: true
 *       400:
 *         description: serverId manquant
 *       500:
 *         description: Erreur serveur
 */
channelsRouter.get("/", async (req, res) => {
    try {
        const { serverId } = req.params as { serverId: string };

        if (!serverId) {
            return res.status(400).json({
                error: "Bad Request",
                message: "serverId is required",
            });
        }

        const channels = await getChannels(serverId);
        return res.json(channels);
    } catch (err) {
        console.error("GET /servers/:serverId/channels error", err);
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
});

/**
 * @swagger
 * /servers/{serverId}/channels:
 *   post:
 *     summary: Créer un nouveau channel
 *     tags: [Channels]
 *     parameters:
 *       - in: path
 *         name: serverId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du serveur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom du channel
 *     responses:
 *       201:
 *         description: Channel créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 serverId:
 *                   type: string
 *                 name:
 *                   type: string
 *                 type:
 *                   type: string
 *                   enum: [text]
 *                 createdAt:
 *                   type: object
 *                   nullable: true
 *       400:
 *         description: Paramètres manquants ou invalides
 *       500:
 *         description: Erreur serveur
 */
channelsRouter.post("/", async (req, res) => {
    try {
        const { serverId } = req.params as { serverId: string };
        const { name } = req.body ?? {};

        if (!serverId) {
            return res.status(400).json({
                error: "Bad Request",
                message: "serverId is required",
            });
        }

        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return res.status(400).json({
                error: "Bad Request",
                message: "name is required",
            });
        }

        const channel = await createChannel(serverId, name.trim());
        return res.status(201).json(channel);
    } catch (err) {
        console.error("POST /servers/:serverId/channels error", err);
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
});
