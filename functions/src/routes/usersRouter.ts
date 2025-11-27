import { Router } from "express";
import { upsertUser, getUser } from "../firebase/user-utils";

export const usersRouter: Router = Router();

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Créer ou mettre à jour un utilisateur
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - username
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID de l'utilisateur (Firebase Auth UID)
 *               username:
 *                 type: string
 *                 description: Nom d'affichage de l'utilisateur
 *               profilePhotoUrl:
 *                 type: string
 *                 nullable: true
 *                 description: URL de la photo de profil (optionnel)
 *     responses:
 *       200:
 *         description: Utilisateur créé ou mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 profilePhotoUrl:
 *                   type: string
 *                   nullable: true
 *                 createdAt:
 *                   type: object
 *       400:
 *         description: Paramètres manquants ou invalides
 *       500:
 *         description: Erreur serveur
 */
usersRouter.post("/", async (req, res) => {
    try {
        const { userId, username, profilePhotoUrl } = req.body ?? {};

        if (!userId || typeof userId !== "string") {
            return res.status(400).json({
                error: "Bad Request",
                message: "userId is required",
            });
        }

        if (!username || typeof username !== "string" || username.trim().length === 0) {
            return res.status(400).json({
                error: "Bad Request",
                message: "username is required",
            });
        }

        const user = await upsertUser({
            userId,
            username: username.trim(),
            profilePhotoUrl: profilePhotoUrl ?? null,
        });

        return res.status(200).json(user);
    } catch (err) {
        console.error("POST /users error", err);
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
});

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Récupérer un utilisateur par son ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 profilePhotoUrl:
 *                   type: string
 *                   nullable: true
 *                 createdAt:
 *                   type: object
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
usersRouter.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params as { userId: string };

        if (!userId) {
            return res.status(400).json({
                error: "Bad Request",
                message: "userId is required",
            });
        }

        const user = await getUser(userId);
        return res.status(200).json(user);
    } catch (err: unknown) {
        console.error("GET /users/:userId error", err);

        if (err instanceof Error && err.message === "User not found") {
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
