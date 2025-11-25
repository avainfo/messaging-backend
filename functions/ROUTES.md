# Routes API Disponibles

## 📡 Liste Complète des Routes

### 1. Health Check
- **GET `/health`**
  - Description : Vérifie l'état de l'API et des services Firebase
  - Paramètres : Aucun
  - Réponse : Statut de Firebase Admin, Firestore et timestamp

### 2. Servers (Serveurs)
- **GET `/servers`**
  - Description : Liste les serveurs d'un utilisateur
  - Query params : 
    - `userId` (required) : ID de l'utilisateur
    - `orderBy` (optional) : "createdAt" ou "name"
    - `descending` (optional) : "true" ou "false"
  - Réponse : Liste des serveurs

- **POST `/servers`**
  - Description : Crée un nouveau serveur
  - Body : `{name, ownerId, imageUrl?, memberIds?}`
  - Réponse : Serveur créé (201)

- **POST `/servers/:serverId/invite`**
  - Description : Génère un lien d'invitation pour un serveur
  - Path params : `serverId`
  - Body : `{inviterId}`
  - Réponse : `{hash, serverId, inviterId, inviteLink}` (200)

- **POST `/servers/join`**
  - Description : Rejoint un serveur via invitation
  - Body : `{userId, serverId, inviterId?, hash}`
  - Réponse : Confirmation (200)

### 3. Channels
- **GET `/servers/:serverId/channels`**
  - Description : Liste les channels d'un serveur
  - Path params : `serverId`
  - Réponse : Liste des channels

- **POST `/servers/:serverId/channels`**
  - Description : Crée un nouveau channel
  - Path params : `serverId`
  - Body : `{name}`
  - Réponse : Channel créé (201)

### 4. Messages
- **GET `/channels/:channelId/messages`**
  - Description : Liste les messages d'un channel
  - Path params : `channelId`
  - Réponse : Liste des messages

- **POST `/channels/:channelId/messages`**
  - Description : Envoie un nouveau message
  - Path params : `channelId`
  - Body : `{authorId, authorName, authorAvatarUrl?, content}`
  - Réponse : Message créé (201)

- **DELETE `/channels/:channelId/messages/:messageId`**
  - Description : Supprime un message
  - Path params : `channelId`, `messageId`
  - Body : `{authorId}` (pour vérification)
  - Réponse : Confirmation (200)


### 5. Reactions
- **GET `/messages/:messageId/reactions`**
  - Description : Liste les réactions d'un message groupées par emoji
  - Path params : `messageId`
  - Réponse : Objet avec emojis comme clés et {count, users[]} comme valeurs

- **POST `/messages/:messageId/reactions`**
  - Description : Ajoute une réaction à un message
  - Path params : `messageId`
  - Body : `{userId, emoji}`
  - Réponse : Confirmation (201)

- **DELETE `/messages/:messageId/reactions`**
  - Description : Supprime une réaction d'un message
  - Path params : `messageId`
  - Body : `{userId, emoji}`
  - Réponse : Confirmation (200)

---

**Total : 13 routes (1 health + 4 servers + 2 channels + 3 messages + 3 reactions)**
