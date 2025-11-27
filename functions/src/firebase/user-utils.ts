import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "./firebase";

export type UserData = {
    id: string;
    username: string;
    profilePhotoUrl: string | null;
    createdAt: Timestamp | null;
};

export type PublicUserResponse = UserData;

/**
 * Maps a Firestore document to UserData
 */
function mapUserDoc(doc: FirebaseFirestore.DocumentSnapshot): UserData {
    const data = doc.data();
    if (!data) {
        throw new Error("User document is empty");
    }

    return {
        id: doc.id,
        username: data.username || "",
        profilePhotoUrl: data.profilePhotoUrl || null,
        createdAt: data.createdAt || null,
    };
}

/**
 * Create or update a user (upsert)
 */
export async function upsertUser(params: {
    userId: string;
    username: string;
    profilePhotoUrl?: string | null;
}): Promise<UserData> {
    const { userId, username, profilePhotoUrl = null } = params;

    const userRef = db.collection("users").doc(userId);
    const existingUser = await userRef.get();

    if (existingUser.exists) {
        // Update existing user
        await userRef.update({
            username,
            profilePhotoUrl,
        });

        const updated = await userRef.get();
        return mapUserDoc(updated);
    } else {
        // Create new user
        const newUser: Omit<UserData, "createdAt"> & { createdAt: FieldValue } = {
            id: userId,
            username,
            profilePhotoUrl,
            createdAt: FieldValue.serverTimestamp(),
        };

        await userRef.set(newUser);

        const created = await userRef.get();
        return mapUserDoc(created);
    }
}

/**
 * Get a user by ID
 */
export async function getUser(userId: string): Promise<UserData> {
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
        throw new Error("User not found");
    }

    return mapUserDoc(userDoc);
}

/**
 * Get multiple users by IDs
 */
export async function getUsers(userIds: string[]): Promise<UserData[]> {
    if (userIds.length === 0) {
        return [];
    }

    const userDocs = await Promise.all(
        userIds.map((id) => db.collection("users").doc(id).get())
    );

    return userDocs
        .filter((doc) => doc.exists)
        .map(mapUserDoc);
}
