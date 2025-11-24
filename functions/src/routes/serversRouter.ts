import { Router } from "express";
import {
  createServer,
  getServers,
  getServersOrderBy,
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

    return res.status(201).json(server);
  } catch (err) {
    console.error("POST /servers error", err);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
});
