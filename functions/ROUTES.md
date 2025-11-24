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

---

**Total : 7 routes (1 health + 2 servers + 2 channels + 2 messages)**
