# API Testing Guide

> **Pour mes étudiants** : Ce guide vous permet de tester l'API que je vous fournis avant de l'intégrer dans votre application Flutter. Utilisez ces exemples pour comprendre le format des requêtes et des réponses.

Ce guide fournit des exemples de requêtes pour tester tous les endpoints de l'API messaging-backend.

## Prérequis

**URL de l'API :** `https://us-central1-messaging-backend-m2i.cloudfunctions.net/api`

**Documentation Swagger :** `https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/docs`

---

## 🔧 Commandes par OS

### Windows (PowerShell)
Utilisez `Invoke-WebRequest` ou `curl` (disponible depuis Windows 10)

### macOS / Linux
Utilisez `curl`

---

## 📡 Endpoints de Test

### 1. Health Check

**✅ Requête valide**

<details>
<summary>Windows (PowerShell)</summary>

```powershell
Invoke-WebRequest -Uri "https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/health" -Method GET | Select-Object -Expand Content
```
</details>

<details>
<summary>macOS / Linux / Windows (curl)</summary>

```bash
curl https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/health
```
</details>

**Réponse attendue :**
```json
{
  "status": "started",
  "firebaseStatus": "ok",
  "firestoreStatus": "ok",
  "time": "2025-11-24T20:00:00.000Z"
}
```

---

### 2. Servers Routes

#### GET /servers

**✅ Requête valide**

<details>
<summary>Windows (PowerShell)</summary>

```powershell
Invoke-WebRequest -Uri "https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/servers?userId=user123" -Method GET | Select-Object -Expand Content
```
</details>

<details>
<summary>macOS / Linux / Windows (curl)</summary>

```bash
curl "https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/servers?userId=user123"
```
</details>

**❌ Requête invalide (userId manquant)**

<details>
<summary>Windows (PowerShell)</summary>

```powershell
Invoke-WebRequest -Uri "https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/servers" -Method GET
```
</details>

<details>
<summary>macOS / Linux / Windows (curl)</summary>

```bash
curl "https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/servers"
```
</details>

**Réponse attendue (400) :**
```json
{
  "error": "userId is required"
}
```

#### POST /servers

**✅ Requête valide**

<details>
<summary>Windows (PowerShell)</summary>

```powershell
$body = @{
    name = "Mon Super Serveur"
    ownerId = "user123"
    imageUrl = "https://example.com/image.png"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/servers" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body | Select-Object -Expand Content
```
</details>

<details>
<summary>macOS / Linux / Windows (curl)</summary>

```bash
curl -X POST https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/servers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mon Super Serveur",
    "ownerId": "user123",
    "imageUrl": "https://example.com/image.png"
  }'
```
</details>

**Réponse attendue (201) :**
```json
{
  "id": "abc123",
  "name": "Mon Super Serveur",
  "ownerId": "user123",
  "imageUrl": "https://example.com/image.png",
  "memberIds": ["user123"],
  "createdAt": {...}
}
```

**❌ Requête invalide (name manquant)**

<details>
<summary>Windows (PowerShell)</summary>

```powershell
$body = @{
    ownerId = "user123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/servers" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```
</details>

<details>
<summary>macOS / Linux / Windows (curl)</summary>

```bash
curl -X POST https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/servers \
  -H "Content-Type: application/json" \
  -d '{"ownerId": "user123"}'
```
</details>

**Réponse attendue (400) :**
```json
{
  "error": "Bad Request",
  "message": "name is required"
}
```

---

### 3. Channels Routes

#### GET /servers/:serverId/channels

**✅ Requête valide**

<details>
<summary>Windows (PowerShell)</summary>

```powershell
Invoke-WebRequest -Uri "https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/servers/abc123/channels" -Method GET | Select-Object -Expand Content
```
</details>

<details>
<summary>macOS / Linux / Windows (curl)</summary>

```bash
curl https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/servers/abc123/channels
```
</details>

**❌ Requête avec serverId inexistant**

<details>
<summary>Windows (PowerShell)</summary>

```powershell
Invoke-WebRequest -Uri "https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/servers/serveur-inexistant/channels" -Method GET | Select-Object -Expand Content
```
</details>

<details>
<summary>macOS / Linux / Windows (curl)</summary>

```bash
curl https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/servers/serveur-inexistant/channels
```
</details>

**Réponse attendue :**
```json
[]
```

#### POST /servers/:serverId/channels

**✅ Requête valide**

<details>
<summary>Windows (PowerShell)</summary>

```powershell
$body = @{
    name = "general"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/servers/abc123/channels" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body | Select-Object -Expand Content
```
</details>

<details>
<summary>macOS / Linux / Windows (curl)</summary>

```bash
curl -X POST https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/servers/abc123/channels \
  -H "Content-Type: application/json" \
  -d '{"name": "general"}'
```
</details>

**Réponse attendue (201) :**
```json
{
  "id": "channel123",
  "serverId": "abc123",
  "name": "general",
  "type": "text",
  "createdAt": {...}
}
```

**❌ Requête invalide (name manquant)**

<details>
<summary>Windows (PowerShell)</summary>

```powershell
$body = @{} | ConvertTo-Json

Invoke-WebRequest -Uri "https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/servers/abc123/channels" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```
</details>

<details>
<summary>macOS / Linux / Windows (curl)</summary>

```bash
curl -X POST https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/servers/abc123/channels \
  -H "Content-Type: application/json" \
  -d '{}'
```
</details>

**Réponse attendue (400) :**
```json
{
  "error": "Bad Request",
  "message": "name is required"
}
```

---

### 4. Messages Routes

#### GET /channels/:channelId/messages

**✅ Requête valide**

<details>
<summary>Windows (PowerShell)</summary>

```powershell
Invoke-WebRequest -Uri "https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/channels/channel123/messages" -Method GET | Select-Object -Expand Content
```
</details>

<details>
<summary>macOS / Linux / Windows (curl)</summary>

```bash
curl https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/channels/channel123/messages
```
</details>

**❌ Requête avec channelId inexistant**

<details>
<summary>Windows (PowerShell)</summary>

```powershell
Invoke-WebRequest -Uri "https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/channels/channel-inexistant/messages" -Method GET | Select-Object -Expand Content
```
</details>

<details>
<summary>macOS / Linux / Windows (curl)</summary>

```bash
curl https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/channels/channel-inexistant/messages
```
</details>

**Réponse attendue :**
```json
[]
```

#### POST /channels/:channelId/messages

**✅ Requête valide**

<details>
<summary>Windows (PowerShell)</summary>

```powershell
$body = @{
    authorId = "user123"
    authorName = "Alice"
    authorAvatarUrl = "https://example.com/avatar.png"
    content = "Bonjour tout le monde !"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/channels/channel123/messages" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body | Select-Object -Expand Content
```
</details>

<details>
<summary>macOS / Linux / Windows (curl)</summary>

```bash
curl -X POST https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/channels/channel123/messages \
  -H "Content-Type: application/json" \
  -d '{
    "authorId": "user123",
    "authorName": "Alice",
    "authorAvatarUrl": "https://example.com/avatar.png",
    "content": "Bonjour tout le monde !"
  }'
```
</details>

**Réponse attendue (201) :**
```json
{
  "id": "msg123",
  "channelId": "channel123",
  "authorId": "user123",
  "authorName": "Alice",
  "authorAvatarUrl": "https://example.com/avatar.png",
  "content": "Bonjour tout le monde !",
  "createdAt": {...}
}
```

**❌ Requête invalide (content manquant)**

<details>
<summary>Windows (PowerShell)</summary>

```powershell
$body = @{
    authorId = "user123"
    authorName = "Alice"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/channels/channel123/messages" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```
</details>

<details>
<summary>macOS / Linux / Windows (curl)</summary>

```bash
curl -X POST https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/channels/channel123/messages \
  -H "Content-Type: application/json" \
  -d '{
    "authorId": "user123",
    "authorName": "Alice"
  }'
```
</details>

**Réponse attendue (400) :**
```json
{
  "error": "Bad Request",
  "message": "content is required"
}
```

---

### 5. Reactions Routes

#### GET /messages/:messageId/reactions

**✅ Requête valide**

<details>
<summary>Windows (PowerShell)</summary>

```powershell
Invoke-WebRequest -Uri "https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/messages/msg123/reactions" -Method GET | Select-Object -Expand Content
```
</details>

<details>
<summary>macOS / Linux / Windows (curl)</summary>

```bash
curl https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/messages/msg123/reactions
```
</details>

**Réponse attendue :**
```json
{
  "👍": {
    "count": 2,
    "users": ["user1", "user2"]
  },
  "❤️": {
    "count": 1,
    "users": ["user3"]
  }
}
```

#### POST /messages/:messageId/reactions

**✅ Requête valide**

<details>
<summary>Windows (PowerShell)</summary>

```powershell
$body = @{
    userId = "user123"
    emoji = "👍"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/messages/msg123/reactions" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body | Select-Object -Expand Content
```
</details>

<details>
<summary>macOS / Linux / Windows (curl)</summary>

```bash
curl -X POST https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/messages/msg123/reactions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "emoji": "👍"
  }'
```
</details>

**Réponse attendue (201) :**
```json
{
  "success": true,
  "message": "Reaction added successfully"
}
```

**❌ Requête invalide (emoji manquant)**

<details>
<summary>Windows (PowerShell)</summary>

```powershell
$body = @{
    userId = "user123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/messages/msg123/reactions" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```
</details>

<details>
<summary>macOS / Linux / Windows (curl)</summary>

```bash
curl -X POST https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/messages/msg123/reactions \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123"}'
```
</details>

**Réponse attendue (400) :**
```json
{
  "error": "Bad Request",
  "message": "emoji is required"
}
```

#### DELETE /messages/:messageId/reactions

**✅ Requête valide**

<details>
<summary>Windows (PowerShell)</summary>

```powershell
$body = @{
    userId = "user123"
    emoji = "👍"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/messages/msg123/reactions" `
  -Method DELETE `
  -ContentType "application/json" `
  -Body $body | Select-Object -Expand Content
```
</details>

<details>
<summary>macOS / Linux / Windows (curl)</summary>

```bash
curl -X DELETE https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/messages/msg123/reactions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "emoji": "👍"
  }'
```
</details>

**Réponse attendue (200) :**
```json
{
  "success": true,
  "message": "Reaction removed successfully"
}
```

**❌ Requête invalide (userId manquant)**

<details>
<summary>Windows (PowerShell)</summary>

```powershell
$body = @{
    emoji = "👍"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/messages/msg123/reactions" `
  -Method DELETE `
  -ContentType "application/json" `
  -Body $body
```
</details>

<details>
<summary>macOS / Linux / Windows (curl)</summary>

```bash
curl -X DELETE https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/messages/msg123/reactions \
  -H "Content-Type: application/json" \
  -d '{"emoji": "👍"}'
```
</details>

**Réponse attendue (400) :**
```json
{
  "error": "Bad Request",
  "message": "userId is required"
}
```

---

## 🧪 Scénario de Test Complet

### Étape 1 : Créer un serveur

```bash
# Créer un serveur
curl -X POST https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/servers \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Server", "ownerId": "testUser"}'

# Récupérer l'ID du serveur dans la réponse (ex: "abc123")
```

### Étape 2 : Créer un channel

```bash
# Utiliser l'ID du serveur de l'étape 1
curl -X POST https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/servers/abc123/channels \
  -H "Content-Type: application/json" \
  -d '{"name": "general"}'

# Récupérer l'ID du channel dans la réponse (ex: "channel123")
```

### Étape 3 : Envoyer un message

```bash
# Utiliser l'ID du channel de l'étape 2
curl -X POST https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/channels/channel123/messages \
  -H "Content-Type: application/json" \
  -d '{
    "authorId": "testUser",
    "authorName": "Test User",
    "content": "Premier message !"
  }'

# Récupérer l'ID du message dans la réponse (ex: "msg123")
```

### Étape 4 : Ajouter une réaction

```bash
# Utiliser l'ID du message de l'étape 3
curl -X POST https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/messages/msg123/reactions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "testUser",
    "emoji": "👍"
  }'
```

### Étape 5 : Récupérer les réactions

```bash
curl https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/messages/msg123/reactions
```

### Étape 6 : Supprimer une réaction

```bash
curl -X DELETE https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/messages/msg123/reactions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "testUser",
    "emoji": "👍"
  }'
```

---

## 📋 Codes de Statut HTTP

| Code | Signification | Exemple |
|------|---------------|---------|
| 200 | OK | Requête GET réussie |
| 201 | Created | Ressource créée avec succès (POST) |
| 400 | Bad Request | Paramètres manquants ou invalides |
| 500 | Internal Server Error | Erreur serveur |

---

## 🔍 Tips

- **Formatter la sortie JSON** : Ajoutez `| jq` à vos commandes curl (nécessite l'installation de `jq`)
  ```bash
  curl https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/health | jq
  ```

- **Voir les headers HTTP** : Ajoutez `-i` ou `-v` à vos commandes curl
  ```bash
  curl -i https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/health
  ```

- **PowerShell : Formatter la sortie JSON** :
  ```powershell
  Invoke-WebRequest -Uri "https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/health" | Select-Object -Expand Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
  ```
