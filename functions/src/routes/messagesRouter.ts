import { Router } from "express";
import {
    createMessage,
    deleteMessage,
    getMessages,
} from "../firebase/message-utils";
import { addServerLog } from "../firebase/server-utils";

export const messagesRouter: Router = Router({ mergeParams: true });

/**
 * @swagger
 * /channels/{channelId}/messages:
 *   get:
 *     summary: Liste des messages d'un channel
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du channel
 *     responses:
 *       200:
 *         description: Liste des messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   channelId:
 *                     type: string
 *                   authorId:
 *                     type: string
 *                   authorName:
 *                     type: string
 *                   authorAvatarUrl:
 *                     type: string
 *                     nullable: true
 *                   content:
 *                     type: string
 *                   createdAt:
 *                     type: object
 *                     nullable: true
 *       400:
 *         description: channelId manquant
 *       500:
 *         description: Erreur serveur
 */
messagesRouter.get("/", async (req, res) => {
    try {
        const { channelId } = req.params as { channelId: string };

        if (!channelId) {
            return res.status(400).json({
                error: "Bad Request",
                message: "channelId is required",
            });
        }

        const messages = await getMessages(channelId);
        return res.json(messages);
    } catch (err) {
        console.error("GET /channels/:channelId/messages error", err);
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
});

/**
 * @swagger
 * /channels/{channelId}/messages:
 *   post:
 *     summary: Envoyer un nouveau message
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du channel
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - authorId
 *               - authorName
 *               - content
 *               - serverId
 *             properties:
 *               authorId:
 *                 type: string
 *                 description: ID de l'auteur
 *               authorName:
 *                 type: string
 *                 description: Nom de l'auteur
 *               authorAvatarUrl:
 *                 type: string
 *                 nullable: true
 *                 description: URL avatar de l'auteur
 *               content:
 *                 type: string
 *                 description: Contenu du message
 *               serverId:
 *                 type: string
 *                 description: ID du serveur (pour logging)
 *     responses:
 *       201:
 *         description: Message créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 channelId:
 *                   type: string
 *                 authorId:
 *                   type: string
 *                 authorName:
 *                   type: string
 *                 authorAvatarUrl:
 *                   type: string
 *                   nullable: true
 *                 content:
 *                   type: string
 *                 createdAt:
 *                   type: object
 *                   nullable: true
 *       400:
 *         description: Paramètres manquants ou invalides
 *       500:
 *         description: Erreur serveur
 */
messagesRouter.post("/", async (req, res) => {
    try {
        const { channelId } = req.params as { channelId: string };
        const { authorId, authorName, authorAvatarUrl, content, serverId } =
            req.body ?? {};

        if (!channelId) {
            return res.status(400).json({
                error: "Bad Request",
                message: "channelId is required",
            });
        }

        if (!authorId || typeof authorId !== "string") {
            return res.status(400).json({
                error: "Bad Request",
                message: "authorId is required",
            });
        }

        if (!authorName || typeof authorName !== "string") {
            return res.status(400).json({
                error: "Bad Request",
                message: "authorName is required",
            });
        }

        if (!content || typeof content !== "string" || content.trim().length === 0) {
            return res.status(400).json({
                error: "Bad Request",
                message: "content is required",
            });
        }

        if (!serverId || typeof serverId !== "string") {
            return res.status(400).json({
                error: "Bad Request",
                message: "serverId is required",
            });
        }

        const message = await createMessage(channelId, {
            authorId,
            authorName,
            authorAvatarUrl: authorAvatarUrl ?? null,
            content: content.trim(),
        });

        // Log message creation
        await addServerLog(serverId, {
            type: "message",
            action: "created",
            userId: authorId,
            targetId: message.id,
            metadata: { channelId },
        });

        return res.status(201).json(message);
    } catch (err) {
        console.error("POST /channels/:channelId/messages error", err);
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
});

/**
 * @swagger
 * /channels/{channelId}/messages/{messageId}:
 *   delete:
 *     summary: Supprimer un message
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du channel
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
 *               - authorId
 *               - serverId
 *             properties:
 *               authorId:
 *                 type: string
 *                 description: ID de l'auteur (pour vérification)
 *               serverId:
 *                 type: string
 *                 description: ID du serveur (pour logging)
 *     responses:
 *       200:
 *         description: Message supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Message deleted successfully
 *       400:
 *         description: Paramètres manquants
 *       403:
 *         description: Non autorisé (pas le propriétaire du message)
 *       404:
 *         description: Message non trouvé
 *       500:
 *         description: Erreur serveur
 */
messagesRouter.delete("/:messageId", async (req, res) => {
    try {
        const { channelId, messageId } = req.params as {
            channelId: string;
            messageId: string;
        };
        const { authorId, serverId } = req.body ?? {};

        if (!channelId) {
            return res.status(400).json({
                error: "Bad Request",
                message: "channelId is required",
            });
        }

        if (!messageId) {
            return res.status(400).json({
                error: "Bad Request",
                message: "messageId is required",
            });
        }

        if (!authorId || typeof authorId !== "string") {
            return res.status(400).json({
                error: "Bad Request",
                message: "authorId is required",
            });
        }

        if (!serverId || typeof serverId !== "string") {
            return res.status(400).json({
                error: "Bad Request",
                message: "serverId is required",
            });
        }

        await deleteMessage(channelId, messageId, authorId);

        // Log message deletion
        await addServerLog(serverId, {
            type: "message",
            action: "deleted",
            userId: authorId,
            targetId: messageId,
            metadata: { channelId },
        });

        return res.status(200).json({
            success: true,
            message: "Message deleted successfully",
        });
    } catch (err: unknown) {
        console.error("DELETE /channels/:channelId/messages/:messageId error", err);

        if (err instanceof Error) {
            if (err.message === "Message not found") {
                return res.status(404).json({
                    error: "Not Found",
                    message: err.message,
                });
            }
            if (err.message.includes("Unauthorized")) {
                return res.status(403).json({
                    error: "Forbidden",
                    message: err.message,
                });
            }
        }

        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
});
