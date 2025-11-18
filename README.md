# 📘 **Cahier des charges - Projet Fil Rouge Flutter & API**

## 🎯 **Objectif**

Développer une **application Flutter de messagerie** connectée à un backend commun (fourni par le formateur).
Votre rôle : créer une **UI complète**, gérer **Firebase Auth**, et consommer les **routes REST** ci-dessous.

**Important :**

* Vous utilisez **votre propre Firebase** uniquement pour l’authentification.
* Le backend gère **serveurs**, **channels**, **messages**.
* Vous ne modifiez **pas** le backend et **pas** Firestore directement.

---

# 🧭 **Fonctionnalités à implémenter**

## ✔️ 1. Authentification (Firebase Auth – votre projet)

Votre app doit permettre :

* inscription (email + mot de passe)
* connexion
* déconnexion
* gestion du `displayName`
* récupération du `uid` Firebase
  → utilisé comme `authorId` dans l’API

---

## ✔️ 2. Navigation principale

Votre application doit contenir les écrans suivants :

### 🔹 Page d'accueil (serveurs)

* affiche la liste des serveurs récupérés depuis :
  **GET /servers**
* permet de créer un serveur via :
  **POST /servers**

### 🔹 Page channels d’un serveur

* affiche les channels d’un serveur via :
  **GET /servers/:serverId/channels**
* permet de créer un channel via :
  **POST /servers/:serverId/channels**

### 🔹 Page chat d’un channel

* affiche les messages du channel via :
  **GET /channels/:channelId/messages**
* permet d’envoyer un message via :
  **POST /channels/:channelId/messages**

### 🔹 Page profil

* affiche le profil Firebase
* permet de modifier le nom & avatar (local)
* permet de se déconnecter

---

# 📡 **API REST à consommer**

Voici les routes que vous devez appeler depuis Flutter :

| Méthode + Route                          | Action                              | Ce que votre app doit faire                                  |
| ---------------------------------------- | ----------------------------------- | ------------------------------------------------------------ |
| **GET `/health`**                        | Ping API                            | Appeler une fois pour tester la connexion                    |
| **GET `/servers`**                       | Liste des serveurs                  | Récupérer et afficher les serveurs                           |
| **POST `/servers`**                      | Création d’un serveur               | Envoyer `{ name, ownerId }`                                  |
| **GET `/servers/:serverId/channels`**    | Liste des channels                  | Afficher les channels d’un serveur                           |
| **POST `/servers/:serverId/channels`**   | Création d’un channel               | Envoyer `{ name, type }`                                     |
| **GET `/channels/:channelId/messages`**  | Récupérer les messages d’un channel | Afficher l’historique + pagination si nécessaire             |
| **POST `/channels/:channelId/messages`** | Envoyer un message                  | Envoyer `{ authorId, authorName, authorAvatarUrl, content }` |

**Note :**
Aucun token Firebase n’est nécessaire → vos requêtes sont **simples**, avec un body JSON uniquement.

---

# 🗄️ **Structure Firestore du backend (référence)**

*(Vous n’y accédez pas directement — cette structure vous est donnée pour comprendre l’API.)*

```
firestore-root
│
├── servers (collection)
│     └── {serverId} (document)
│           ├── id: string
│           ├── name: string
│           ├── ownerId: string
│           ├── memberIds: string[]
│           ├── imageUrl: string | null
│           ├── createdAt: Timestamp
│           │
│           └── channels (subcollection)
│                 └── {channelId} (document)
│                       ├── id: string
│                       ├── serverId: string
│                       ├── name: string
│                       ├── type: "text"
│                       ├── authorizedUserIds: string[]
│                       └── createdAt: Timestamp
│
└── channels (collection)
      └── {channelId} (document)
            └── messages (subcollection)
                  └── {messageId} (document)
                        ├── id: string
                        ├── channelId: string
                        ├── authorId: string
                        ├── authorName: string
                        ├── authorAvatarUrl: string | null
                        ├── content: string
                        └── createdAt: Timestamp
```

---

# 🎨 **Exigences UI/UX**

Votre application doit être :

* fonctionnelle
* claire et lisible
* responsive
* structurée (pas tout dans un seul fichier)
* agréable à utiliser :

  * auto-scroll
  * loaders
  * messages bien formatés

---

# 🧱 **Contraintes techniques**

* Flutter 3.x minimum
* Null-safety obligatoire
* Gestion d’état : Provider, Riverpod ou Bloc
* Appels API dans un **service** dédié (pas dans les Widgets)
* Modèles propres (`Server`, `Channel`, `Message`)
* Architecture recommandée :

  ```
  /models
  /services
  /providers
  /screens
  /widgets
  ```

---

# 🧪 **Livrables**

Votre application doit contenir **au minimum** :

- Auth Firebase (login / signup)
- Liste des serveurs
- Création serveur
- Liste des channels
- Création channel
- Chat (send / display messages)
- Profil utilisateur
- Gestion état propre
- Code organisé + README

---

# ⭐ Bonus facultatifs (valorisés)

* thèmes clair / sombre
* édition / suppression de messages
* réactions emoji
* avatars personnalisés
* pagination infinie dans le chat
* animations (fade-in, slide, etc.)
* version Flutter Web
* liste des membres du serveur
