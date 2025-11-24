import { Router } from "express";
import { addReaction, getReactions, removeReaction } from "../firebase/reaction-utils";

export const reactionsRouter: Router = Router({ mergeParams: true });

/**
 * @swagger
 * /messages/{messageId}/reactions:
 *   get:
 *     summary: Liste des réactions d'un message
 *     tags: [Reactions]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du message
 *     responses:
 *       200:
 *         description: Résumé des réactions par emoji
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: object
 *                 properties:
 *                   count:
 *                     type: integer
 *                   users:
 *                     type: array
 *                     items:
 *                       type: string
 *             example:
 *               "👍":
 *                 count: 3
 *                 users: ["user1", "user2", "user3"]
 *               "❤️":
 *                 count: 1
 *                 users: ["user1"]
 *       400:
 *         description: messageId manquant
 *       500:
 *         description: Erreur serveur
 */
reactionsRouter.get("/", async (req, res) => {
    try {
        const { messageId } = req.params as { messageId: string };

        if (!messageId) {
            return res.status(400).json({
                error: "Bad Request",
                message: "messageId is required",
            });
        }

        const reactions = await getReactions(messageId);
        return res.json(reactions);
    } catch (err) {
        console.error("GET /messages/:messageId/reactions error", err);
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
});

/**
 * @swagger
 * /messages/{messageId}/reactions:
 *   post:
 *     summary: Ajouter une réaction à un message
 *     tags: [Reactions]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du message
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - emoji
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID de l'utilisateur
 *               emoji:
 *                 type: string
 *                 description: Emoji de la réaction
 *             example:
 *               userId: "uid123"
 *               emoji: "👍"
 *     responses:
 *       201:
 *         description: Réaction ajoutée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Paramètres manquants ou invalides
 *       500:
 *         description: Erreur serveur
 */
reactionsRouter.post("/", async (req, res) => {
    try {
        const { messageId } = req.params as { messageId: string };
        const { userId, emoji } = req.body ?? {};

        if (!messageId) {
            return res.status(400).json({
                error: "Bad Request",
                message: "messageId is required",
            });
        }

        if (!userId || typeof userId !== "string") {
            return res.status(400).json({
                error: "Bad Request",
                message: "userId is required",
            });
        }

        if (!emoji || typeof emoji !== "string" || emoji.trim().length === 0) {
            return res.status(400).json({
                error: "Bad Request",
                message: "emoji is required",
            });
        }

        await addReaction(messageId, userId, emoji.trim());
        return res.status(201).json({
            success: true,
            message: "Reaction added successfully",
        });
    } catch (err) {
        console.error("POST /messages/:messageId/reactions error", err);
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
});

/**
 * @swagger
 * /messages/{messageId}/reactions:
 *   delete:
 *     summary: Supprimer une réaction d'un message
 *     tags: [Reactions]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du message
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - emoji
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID de l'utilisateur
 *               emoji:
 *                 type: string
 *                 description: Emoji de la réaction
 *             example:
 *               userId: "uid123"
 *               emoji: "👍"
 *     responses:
 *       200:
 *         description: Réaction supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Paramètres manquants ou invalides
 *       500:
 *         description: Erreur serveur
 */
reactionsRouter.delete("/", async (req, res) => {
    try {
        const { messageId } = req.params as { messageId: string };
        const { userId, emoji } = req.body ?? {};

        if (!messageId) {
            return res.status(400).json({
                error: "Bad Request",
                message: "messageId is required",
            });
        }

        if (!userId || typeof userId !== "string") {
            return res.status(400).json({
                error: "Bad Request",
                message: "userId is required",
            });
        }

        if (!emoji || typeof emoji !== "string" || emoji.trim().length === 0) {
            return res.status(400).json({
                error: "Bad Request",
                message: "emoji is required",
            });
        }

        await removeReaction(messageId, userId, emoji.trim());
        return res.status(200).json({
            success: true,
            message: "Reaction removed successfully",
        });
    } catch (err) {
        console.error("DELETE /messages/:messageId/reactions error", err);
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
});
