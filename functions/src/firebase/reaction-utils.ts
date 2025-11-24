import { db } from "./firebase";
import { FieldValue } from "firebase-admin/firestore";

export type ReactionData = {
    messageId: string;
    userId: string;
    emoji: string;
    createdAt: Date | null;
};

export type ReactionsSummary = {
    [emoji: string]: {
        count: number;
        users: string[];
    };
};

/**
 * Ajoute une réaction à un message
 * @param {string} messageId - ID du message
 * @param {string} userId - ID de l'utilisateur
 * @param {string} emoji - Emoji de la réaction
 * @return {Promise<void>}
 */
async function addReaction(
    messageId: string,
    userId: string,
    emoji: string
): Promise<void> {
    const reactionId = `${userId}_${emoji}`;
    const reactionRef = db
        .collection("reactions")
        .doc(messageId)
        .collection("items")
        .doc(reactionId);

    await reactionRef.set({
        messageId,
        userId,
        emoji,
        createdAt: FieldValue.serverTimestamp(),
    });
}

/**
 * Supprime une réaction d'un message
 * @param {string} messageId - ID du message
 * @param {string} userId - ID de l'utilisateur
 * @param {string} emoji - Emoji de la réaction
 * @return {Promise<void>}
 */
async function removeReaction(
    messageId: string,
    userId: string,
    emoji: string
): Promise<void> {
    const reactionId = `${userId}_${emoji}`;
    const reactionRef = db
        .collection("reactions")
        .doc(messageId)
        .collection("items")
        .doc(reactionId);

    await reactionRef.delete();
}

/**
 * Récupère toutes les réactions d'un message groupées par emoji
 * @param {string} messageId - ID du message
 * @return {Promise<ReactionsSummary>} Résumé des réactions par emoji
 */
async function getReactions(messageId: string): Promise<ReactionsSummary> {
    const reactionsSnapshot = await db
        .collection("reactions")
        .doc(messageId)
        .collection("items")
        .get();

    const summary: ReactionsSummary = {};

    reactionsSnapshot.docs.forEach((doc) => {
        const data = doc.data() as ReactionData;
        const { emoji, userId } = data;

        if (!summary[emoji]) {
            summary[emoji] = {
                count: 0,
                users: [],
            };
        }

        summary[emoji].count++;
        summary[emoji].users.push(userId);
    });

    return summary;
}

export { addReaction, removeReaction, getReactions };
