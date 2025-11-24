import { Router } from "express";
import { createChannel, getChannels } from "../firebase/channel-utils";

// eslint-disable-next-line new-cap
export const channelsRouter: Router = Router({ mergeParams: true });

/**
 * GET /servers/:serverId/channels
 * Retourne la liste des channels d'un serveur.
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
 * POST /servers/:serverId/channels
 * Body: { name: "General" }
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
