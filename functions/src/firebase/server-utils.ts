import {db} from "./firebase";
import {firestore} from "firebase-admin";
import {FieldValue, Timestamp} from "firebase-admin/firestore";
import FieldPath = firestore.FieldPath;


export type ServerData = {
  id: string;
  name: string;
  ownerId: string;
  memberIds: string[];
  imageUrl: string | null;
  createdAt: Timestamp | null;
};

export type PublicServerResponse = {
  id: string;
  ownerId: string;
  name: string;
  imageUrl: string | null;
};

/**
 * Simplifie le document Firestore pour exposer moins de champs.
 * @param {FirebaseFirestore.DocumentSnapshot} doc - Le document Firestore
 * à mapper.
 * @return {PublicServerResponse} La réponse serveur simplifiée.
 */
function mapServerDoc(
  doc: FirebaseFirestore.DocumentSnapshot
): PublicServerResponse {
  const data = doc.data() as ServerData;
  return {
    id: data.id ?? doc.id,
    ownerId: data.ownerId,
    name: data.name,
    imageUrl: data.imageUrl ?? null,
  };
}

/**
 * Retrieves the list of servers where the specified user is a member
 * Returns a simplified version of the server objects (id, ownerId, name,
 * imageUrl)
 * @param {string} userId - The unique identifier of the user
 * @return {Promise<PublicServerResponse[]>} A promise that resolves to an
 * array of simplified server objects
 */
async function getServers(userId: string): Promise<PublicServerResponse[]> {
  const servers = await db
    .collection("servers")
    .where("memberIds", "array-contains", userId)
    .get();

  return servers.docs.map(mapServerDoc);
}

/**
 * Retrieves the list of servers where the user is a member, ordered by a
 * specific field
 * Returns a simplified version of the server objects (id, ownerId, name,
 * imageUrl)
 * @param {string} userId - The unique identifier of the user
 * @param {string | FieldPath} orderBy - The field path to sort the results
 * by ('createdAt' | 'name')
 * @param {boolean} descending - Whether to sort the results in descending
 * order (true | default: false)
 * @return {Promise<PublicServerResponse[]>} A promise that resolves to the
 * simplified server objects
 */
async function getServersOrderBy(
  userId: string,
  orderBy: string | FieldPath,
  descending: boolean = false
): Promise<PublicServerResponse[]> {
  const servers = await db
    .collection("servers")
    .where("memberIds", "array-contains", userId)
    .orderBy(orderBy, descending ? "desc" : "asc")
    .get();

  return servers.docs.map(mapServerDoc);
}

/**
 * Creates a new server document in Firestore.
 * @param {object} params - The parameters for creating a server.
 * @param {string} params.name - The name of the server.
 * @param {string} params.ownerId - The ID of the owner.
 * @param {string} [params.imageUrl] - The URL of the server image (optional).
 * @param {string[]} [params.memberIds] - The IDs of the members (optional).
 * @return {Promise<ServerData>} The created server data.
 */
async function createServer(params: {
  name: string;
  ownerId: string;
  imageUrl?: string | null;
  memberIds?: string[];
}): Promise<ServerData> {
  const {name, ownerId, imageUrl = null, memberIds = [ownerId]} = params;

  const serversCol = db.collection("servers");
  const docRef = serversCol.doc();

  const server: ServerData = {
    id: docRef.id,
    name,
    ownerId,
    memberIds: Array.from(new Set(memberIds)),
    imageUrl,
    createdAt: null,
  };

  await docRef.set({
    ...server,
    createdAt: FieldValue.serverTimestamp(),
  });

  const saved = await docRef.get();
  const savedData = saved.data() as ServerData;

  return {
    ...server,
    createdAt: savedData.createdAt ?? null,
  };
}

/**
 * Génère un hash SHA-256 à partir de l'ownerId et du serverId
 * @param {string} ownerId - L'ID du propriétaire
 * @param {string} serverId - L'ID du serveur
 * @return {string} Le hash en hexadécimal
 */
function generateInviteHash(ownerId: string, serverId: string): string {
  const crypto = require("crypto");
  const data = `${ownerId}${serverId}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Vérifie qu'un hash correspond à l'ownerId et serverId
 * @param {string} hash - Le hash à vérifier
 * @param {string} ownerId - L'ID du propriétaire
 * @param {string} serverId - L'ID du serveur
 * @return {boolean} True si le hash est valide
 */
function verifyInviteHash(
  hash: string,
  ownerId: string,
  serverId: string
): boolean {
  const expectedHash = generateInviteHash(ownerId, serverId);
  return hash === expectedHash;
}

/**
 * Ajoute un utilisateur aux membres d'un serveur
 * @param {string} serverId - L'ID du serveur
 * @param {string} userId - L'ID de l'utilisateur à ajouter
 * @return {Promise<void>}
 * @throws {Error} Si le serveur n'existe pas
 */
async function addMemberToServer(
  serverId: string,
  userId: string
): Promise<void> {
  const serverRef = db.collection("servers").doc(serverId);
  const serverDoc = await serverRef.get();

  if (!serverDoc.exists) {
    throw new Error("Server not found");
  }

  const serverData = serverDoc.data() as ServerData;
  const currentMembers = serverData.memberIds || [];

  // Vérifier si l'utilisateur est déjà membre
  if (currentMembers.includes(userId)) {
    return; // Déjà membre, ne rien faire
  }

  // Ajouter le nouveau membre
  await serverRef.update({
    memberIds: [...currentMembers, userId],
  });
}

export {
  getServers,
  getServersOrderBy,
  createServer,
  generateInviteHash,
  verifyInviteHash,
  addMemberToServer,
};
