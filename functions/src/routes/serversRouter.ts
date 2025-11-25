import { Router } from "express";
import {
  createServer,
  getServers,
  getServersOrderBy,
  generateInviteHash,
  addMemberToServer,
  addServerLog,
  getServerLogs,
} from "../firebase/server-utils";

export const serversRouter: Router = Router();

/**
 * @swagger
 * /servers:
 *   get:
 *     summary: Liste des serveurs d'un utilisateur
 *     tags: [Servers]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *       - in: query
 *         name: orderBy
 *         required: false
 *         schema:
 *           type: string
 *           enum: [createdAt, name]
 *         description: Champ de tri
 *       - in: query
 *         name: descending
 *         required: false
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Tri décroissant
 *     responses:
 *       200:
 *         description: Liste des serveurs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 orderBy:
 *                   type: string
 *                 descending:
 *                   type: boolean
 *                 servers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       ownerId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       imageUrl:
 *                         type: string
 *                         nullable: true
 *       400:
 *         description: Paramètre userId manquant
 *       500:
 *         description: Erreur serveur
 */
serversRouter.get("/", async (req, res) => {
  try {
    const userId = req.query["userId"];
    const orderBy = req.query["orderBy"];

    if (!userId || typeof userId !== "string") {
      res.status(400).json({
        error: "userId is required",
      });
      return;
    }

    let servers;
    let descending: boolean | undefined;

    if (
      orderBy &&
      ["createdat", "name"].includes(orderBy.toString().toLowerCase())
    ) {
      const descendingParam = req.query["descending"];
      const descending =
        typeof descendingParam === "string" ?
          descendingParam.toLowerCase() === "true" :
          false;

      servers = await getServersOrderBy(
        userId.toString(),
        orderBy.toString().toLowerCase() === "createdat" ? "createdAt" : "name",
        descending
      );
    } else {
      servers = await getServers(userId.toString());
    }

    res.json({
      userId,
      orderBy,
      descending,
      servers,
    });
  } catch (err) {
    console.error("GET /servers error", err);
    res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
});

/**
 * @swagger
 * /servers:
 *   post:
 *     summary: Créer un nouveau serveur
 *     tags: [Servers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - ownerId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom du serveur
 *               ownerId:
 *                 type: string
 *                 description: ID du propriétaire
 *               imageUrl:
 *                 type: string
 *                 nullable: true
 *                 description: URL de l'image du serveur
 *               memberIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs des membres (ownerId ajouté automatiquement)
 *     responses:
 *       201:
 *         description: Serveur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 ownerId:
 *                   type: string
 *                 memberIds:
 *                   type: array
 *                   items:
 *                     type: string
 *                 imageUrl:
 *                   type: string
 *                   nullable: true
 *                 createdAt:
 *                   type: object
 *       400:
 *         description: Paramètres manquants ou invalides
 *       500:
 *         description: Erreur serveur
 */
serversRouter.post("/", async (req, res) => {
  try {
    const { name, ownerId, imageUrl, memberIds } = req.body ?? {};

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({
        error: "Bad Request",
        message: "name is required",
      });
    }

    if (!ownerId || typeof ownerId !== "string") {
      return res.status(400).json({
        error: "Bad Request",
        message: "ownerId is required",
      });
    }

    const server = await createServer({
      name: name.trim(),
      ownerId,
      imageUrl: imageUrl ?? null,
      memberIds: Array.isArray(memberIds) ?
        Array.from(new Set([ownerId, ...memberIds])) :
        [ownerId],
    });

    // Log server creation
    await addServerLog(server.id, {
      type: "server",
      action: "created",
      userId: ownerId,
      metadata: { serverName: name.trim() },
    });

    return res.status(201).json(server);
  } catch (err) {
    console.error("POST /servers error", err);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
});

/**
 *  @swagger
 * /servers/{serverId}/invite:
 *   post:
 *     summary: Générer un lien d'invitation
 *     tags: [Servers]
 *     parameters:
 *       - in: path
 *         name: serverId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inviterId
 *             properties:
 *               inviterId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lien généré
 *       404:
 *         description: Serveur non trouvé
 */
serversRouter.post("/:serverId/invite", async (req, res) => {
  try {
    const { serverId } = req.params as { serverId: string };
    const { inviterId } = req.body ?? {};

    if (!serverId || !inviterId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "serverId and inviterId are required",
      });
    }

    const serverRef = await getServers(inviterId);
    const server = serverRef.find((s) => s.id === serverId);

    if (!server) {
      return res.status(404).json({
        error: "Not Found",
        message: "Server not found",
      });
    }

    const hash = generateInviteHash(server.ownerId, serverId);
    const inviteLink = `${hash}${serverId}${inviterId}`;

    // Log invitation creation
    await addServerLog(serverId, {
      type: "invitation",
      action: "invited",
      userId: inviterId,
      metadata: { hash },
    });

    return res.status(200).json({ hash, serverId, inviterId, inviteLink });
  } catch (err) {
    console.error("POST /servers/:serverId/invite error", err);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
});

/**
 * @swagger
 * /servers/join:
 *   post:
 *     summary: Rejoindre un serveur via invitation
 *     tags: [Servers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - serverId
 *               - hash
 *             properties:
 *               userId:
 *                 type: string
 *               serverId:
 *                 type: string
 *               inviterId:
 *                 type: string
 *               hash:
 *                 type: string
 *     responses:
 *       200:
 *         description: Utilisateur ajouté
 *       403:
 *         description: Hash invalide
 */
serversRouter.post("/join", async (req, res) => {
  try {
    const { userId, serverId, inviterId, hash } = req.body ?? {};

    if (!userId || !serverId || !hash) {
      return res.status(400).json({
        error: "Bad Request",
        message: "userId, serverId, and hash are required",
      });
    }

    const { db } = require("../firebase/firebase");
    const serverDoc = await db.collection("servers").doc(serverId).get();

    if (!serverDoc.exists) {
      return res.status(404).json({
        error: "Not Found",
        message: "Server not found",
      });
    }

    const serverData = serverDoc.data();
    const { verifyInviteHash } = require("../firebase/server-utils");

    if (!verifyInviteHash(hash, serverData.ownerId, serverId)) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Invalid invitation hash",
      });
    }

    await addMemberToServer(serverId, userId);

    // Log user joined
    await addServerLog(serverId, {
      type: "invitation",
      action: "joined",
      userId,
      metadata: { inviterId },
    });

    return res.status(200).json({
      success: true,
      message: "Successfully joined server",
      serverId,
      inviterId,
    });
  } catch (err) {
    console.error("POST /servers/join error", err);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
});

/**
 * @swagger
 * /servers/{serverId}/logs:
 *   get:
 *     summary: Récupérer les logs d'un serveur
 *     tags: [Servers]
 *     parameters:
 *       - in: path
 *         name: serverId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [server, channel, message, invitation]
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *     responses:
 *       200:
 *         description: Logs récupérés
 *       404:
 *         description: Serveur non trouvé
 */
serversRouter.get("/:serverId/logs", async (req, res) => {
  try {
    const { serverId } = req.params as { serverId: string };
    const { type, userId, limit } = req.query;

    const logs = await getServerLogs(serverId, {
      type: type as string | undefined,
      userId: userId as string | undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    return res.status(200).json({
      serverId,
      count: logs.length,
      logs,
    });
  } catch (err: unknown) {
    console.error("GET /servers/:serverId/logs error", err);

    if (err instanceof Error && err.message === "Server not found") {
      return res.status(404).json({
        error: "Not Found",
        message: err.message,
      });
    }

    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
});
