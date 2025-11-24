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
 * @return {Promise<MessageData[]>} A promise that resolves to an array of messages.
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

export { getMessages, createMessage };
