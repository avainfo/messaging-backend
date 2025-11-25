import { db } from "./firebase";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

export type MessageData = {
    id: string;
    channelId: string;
    authorId: string;
    authorName: string;
    authorAvatarUrl: string | null;
    content: string;
    createdAt: Timestamp | null;
};

/**
 * Map Firestore document to MessageData
 * @param {FirebaseFirestore.DocumentSnapshot} doc - Document snapshot
 * @return {MessageData} Mapped message data
 */
function mapMessageDoc(doc: FirebaseFirestore.DocumentSnapshot): MessageData {
    const data = doc.data() as MessageData;
    return {
        id: data.id ?? doc.id,
        channelId: data.channelId,
        authorId: data.authorId,
        authorName: data.authorName,
        authorAvatarUrl: data.authorAvatarUrl ?? null,
        content: data.content,
        createdAt: data.createdAt,
    };
}

/**
 * Retrieves the list of messages for a specific channel.
 * @param {string} channelId - The ID of the channel.
 * @return {Promise<MessageData[]>} Messages array
 */
async function getMessages(channelId: string): Promise<MessageData[]> {
    const messages = await db
        .collection("channels")
        .doc(channelId)
        .collection("messages")
        .orderBy("createdAt", "asc")
        .get();

    return messages.docs.map(mapMessageDoc);
}

/**
 * Creates a new message in a channel.
 * @param {string} channelId - The ID of the channel.
 * @param {object} params - The message parameters.
 * @param {string} params.authorId - The ID of the author.
 * @param {string} params.authorName - The name of the author.
 * @param {string} [params.authorAvatarUrl] - The avatar URL of the author.
 * @param {string} params.content - The content of the message.
 * @return {Promise<MessageData>} The created message data.
 */
async function createMessage(
    channelId: string,
    params: {
        authorId: string;
        authorName: string;
        authorAvatarUrl?: string | null;
        content: string;
    }
): Promise<MessageData> {
    const { authorId, authorName, authorAvatarUrl = null, content } = params;

    const messagesCol = db
        .collection("channels")
        .doc(channelId)
        .collection("messages");
    const docRef = messagesCol.doc();

    const message: MessageData = {
        id: docRef.id,
        channelId,
        authorId,
        authorName,
        authorAvatarUrl,
        content,
        createdAt: null,
    };

    await docRef.set({
        ...message,
        createdAt: FieldValue.serverTimestamp(),
    });

    const saved = await docRef.get();
    const savedData = saved.data() as MessageData;

    return {
        ...message,
        createdAt: savedData.createdAt ?? null,
    };
}

/**
 * Supprime un message d'un channel avec vérification de l'auteur
 * @param {string} channelId - L'ID du channel
 * @param {string} messageId - L'ID du message
 * @param {string} authorId - L'ID de l'auteur (pour vérification)
 * @return {Promise<void>}
 * @throws {Error} Si le message n'existe pas ou si l'authorId ne correspond pas
 */
async function deleteMessage(
    channelId: string,
    messageId: string,
    authorId: string
): Promise<void> {
    const messageRef = db
        .collection("channels")
        .doc(channelId)
        .collection("messages")
        .doc(messageId);

    const messageDoc = await messageRef.get();

    if (!messageDoc.exists) {
        throw new Error("Message not found");
    }

    const messageData = messageDoc.data() as MessageData;

    if (messageData.authorId !== authorId) {
        throw new Error("Unauthorized: You can only delete your own messages");
    }

    await messageRef.delete();
}

export { getMessages, createMessage, deleteMessage };
