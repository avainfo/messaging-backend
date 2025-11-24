import { db } from "./firebase";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

export type ChannelData = {
    id: string;
    serverId: string;
    name: string;
    type: "text";
    createdAt: Timestamp | null;
};

export type PublicChannelResponse = {
    id: string;
    serverId: string;
    name: string;
    type: "text";
    createdAt: Timestamp | null;
};

function mapChannelDoc(doc: FirebaseFirestore.DocumentSnapshot): PublicChannelResponse {
    const data = doc.data() as ChannelData;
    return {
        id: data.id ?? doc.id,
        serverId: data.serverId,
        name: data.name,
        type: data.type,
        createdAt: data.createdAt,
    };
}

/**
 * Retrieves the list of channels for a specific server.
 * @param {string} serverId - The ID of the server.
 * @return {Promise<PublicChannelResponse[]>} A promise that resolves to an array of channels.
 */
async function getChannels(serverId: string): Promise<PublicChannelResponse[]> {
    const channels = await db
        .collection("channels")
        .where("serverId", "==", serverId)
        .orderBy("createdAt", "asc")
        .get();

    return channels.docs.map(mapChannelDoc);
}

/**
 * Creates a new channel in a server.
 * @param {string} serverId - The ID of the server.
 * @param {string} name - The name of the channel.
 * @return {Promise<ChannelData>} The created channel data.
 */
async function createChannel(serverId: string, name: string): Promise<ChannelData> {
    const channelsCol = db.collection("channels");
    const docRef = channelsCol.doc();

    const channel: ChannelData = {
        id: docRef.id,
        serverId,
        name,
        type: "text",
        createdAt: null,
    };

    await docRef.set({
        ...channel,
        createdAt: FieldValue.serverTimestamp(),
    });

    const saved = await docRef.get();
    const savedData = saved.data() as ChannelData;

    return {
        ...channel,
        createdAt: savedData.createdAt ?? null,
    };
}

export { getChannels, createChannel };
