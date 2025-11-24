import {Router} from "express";
import {
  createServer,
  getServers,
  getServersOrderBy,
} from "../firebase/server-utils";

export const serversRouter: Router = Router();

/**
 * GET /servers?userId=...&orderBy=createdAt|name&descending=true|false
 * Retourne la liste des serveurs dont l'utilisateur est membre.
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
 * POST /servers
 * Body:
 * {
 *   "name": "42 Porto",
 *   "ownerId": "uid123",
 *   "imageUrl": "https://...",
 *   "memberIds": ["uid123", "uid456"] // optionnel, par défaut [ownerId]
 * }
 */
serversRouter.post("/", async (req, res) => {
  try {
    const {name, ownerId, imageUrl, memberIds} = req.body ?? {};

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
