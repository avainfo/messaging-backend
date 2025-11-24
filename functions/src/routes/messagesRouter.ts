import { Router } from "express";
import { createMessage, getMessages } from "../firebase/message-utils";

// eslint-disable-next-line new-cap
export const messagesRouter: Router = Router({ mergeParams: true });

/**
 * GET /channels/:channelId/messages
 * Retourne la liste des messages d'un channel.
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
 * POST /channels/:channelId/messages
 * Body: { authorId, authorName, authorAvatarUrl, content }
 */
messagesRouter.post("/", async (req, res) => {
    try {
        const { channelId } = req.params as { channelId: string };
        const { authorId, authorName, authorAvatarUrl, content } = req.body ?? {};

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

        const message = await createMessage(channelId, {
            authorId,
            authorName,
            authorAvatarUrl: authorAvatarUrl ?? null,
            content: content.trim(),
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
