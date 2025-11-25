# 📘 Messaging Backend - Projet Pédagogique Flutter

## 🎯 Contexte du Projet

Ce projet est un **backend de messagerie inspiré de Discord**, conçu dans un cadre pédagogique pour l'apprentissage du développement mobile avec Flutter.

### 🔵 Architecture du Projet

Le projet est divisé en deux parties distinctes :

#### **Backend (que je fournis)**
- API REST complète basée sur Firebase Cloud Functions
- Base de données Firestore structurée
- Gestion des serveurs, channels et messages
- Déploiement centralisé : **un seul backend pour tous mes étudiants**

#### **Frontend Flutter (à développer par mes étudiants)**
- Application mobile complète
- Authentification Firebase (projet Firebase personnel de chaque étudiant)
- Interface utilisateur et navigation
- Consommation de l'API REST que je fournis
- Gestion d'état et architecture propre

---

## 🎓 Pour les Étudiants

Vous devez développer une application Flutter qui communique avec ce backend.

### 📚 Documentation à Consulter

1. **[SPECIFICATIONS.md](SPECIFICATIONS.md)** : Cahier des charges complet avec :
   - Les fonctionnalités à implémenter
   - La structure de données Firestore
   - Les endpoints de l'API à consommer
   - Les contraintes techniques

2. **[TESTING.md](TESTING.md)** : Guide de test de l'API avec :
   - Exemples de requêtes pour tous les endpoints
   - Cas de succès et d'erreur
   - Commandes curl et PowerShell prêtes à l'emploi

### 🚀 URL de l'API

**Base URL :** `https://us-central1-messaging-backend-m2i.cloudfunctions.net/api`

**Documentation Swagger :** `https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/docs`

### 📡 Endpoints Disponibles

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/health` | GET | Vérification du statut de l'API |
| `/servers` | GET | Liste des serveurs (param: `userId`) |
| `/servers` | POST | Créer un serveur |
| `/servers/:serverId/invite` | POST | Générer un lien d'invitation |
| `/servers/join` | POST | Rejoindre via invitation |
| `/servers/:serverId/logs` | GET | Récupérer les logs d'un serveur |
| `/servers/:serverId/channels` | GET | Liste des channels d'un serveur |
| `/servers/:serverId/channels` | POST | Créer un channel |
| `/channels/:channelId/messages` | GET | Liste des messages d'un channel |
| `/channels/:channelId/messages` | POST | Envoyer un message |
| `/channels/:channelId/messages/:messageId` | DELETE | Supprimer un message |
| `/messages/:messageId/reactions` | GET | Liste des réactions d'un message |
| `/messages/:messageId/reactions` | POST | Ajouter une réaction |
| `/messages/:messageId/reactions` | DELETE | Supprimer une réaction |

### 💡 Ce que Vous Devez Faire

- ✅ Mettre en place Firebase Authentication (votre propre projet Firebase)
- ✅ Créer les modèles de données (`Server`, `Channel`, `Message`)
- ✅ Implémenter un service API pour consommer les endpoints
- ✅ Développer les écrans : serveurs, channels, chat, profil
- ✅ Gérer la navigation entre les écrans
- ✅ Utiliser une solution de gestion d'état (Provider, Riverpod, Bloc...)
- ✅ Créer une interface utilisateur agréable et responsive

### 🔐 Authentification

- Utilisez Firebase Auth avec **votre propre projet Firebase**
- Récupérez le `uid` de l'utilisateur connecté
- Utilisez ce `uid` comme `authorId` ou `ownerId` dans vos requêtes API
- **Aucun token n'est requis** pour les appels API du backend

---

## 👨‍🏫 Notes Techniques (Formateur)

### 🛠️ Technologies Utilisées

- **Runtime** : Node.js 18
- **Framework** : Express.js
- **Cloud** : Firebase Cloud Functions
- **Base de données** : Firestore
- **Documentation API** : Swagger UI (disponible sur `/docs`)
- **Tests** : Jest + Supertest

### 📦 Installation Locale

```bash
# Installer les dépendances
cd functions
npm install

# Lancer l'émulateur local
npm run start

# Lancer les tests
npm test

# Linter le code
npm run lint
```

### 🚀 Déploiement

```bash
# Build du projet
cd functions
npm run build

# Déploiement sur Firebase
firebase deploy --only functions
```

### 📊 Structure du Projet

```
messaging-backend/
├── functions/
│   ├── src/
│   │   ├── app.ts                    # Configuration Express
│   │   ├── index.ts                  # Entry point Cloud Functions
│   │   ├── config/                   # Configuration (Swagger, env)
│   │   ├── firebase/                 #Utils Firestore
│   │   │   ├── firebase.ts          # Initialisation Firebase Admin
│   │   │   ├── server-utils.ts      # CRUD serveurs
│   │   │   ├── channel-utils.ts     # CRUD channels
│   │   │   └── message-utils.ts     # CRUD messages
│   │   ├── middlewares/              # Error handler
│   │   ├── routes/                   # Routers Express
│   │   │   ├── index.ts             # Router principal
│   │   │   ├── serversRouter.ts     # Routes /servers
│   │   │   ├── channelsRouter.ts    # Routes /channels
│   │   │   └── messagesRouter.ts    # Routes /messages
│   │   └── tests/                    # Tests unitaires
│   ├── package.json
│   └── tsconfig.json
├── SPECIFICATIONS.md                  # Cahier des charges étudiants
├── TESTING.md                         # Guide de test de l'API
└── README.md                          # Ce fichier
```

### 🗄️ Structure Firestore

```
firestore-root
│
├── servers (collection)
│   └── {serverId} (document)
│       ├── id: string
│       ├── name: string
│       ├── ownerId: string
│       ├── memberIds: string[]
│       ├── imageUrl: string | null
│       └── createdAt: Timestamp
│
├── channels (collection)
│   └── {channelId} (document)
│       ├── id: string
│       ├── serverId: string
│       ├── name: string
│       ├── type: "text"
│       └── createdAt: Timestamp
│
└── channels/{channelId}/messages (subcollection)
    └── {messageId} (document)
        ├── id: string
        ├── channelId: string
        ├── authorId: string
        ├── authorName: string
        ├── authorAvatarUrl: string | null
        ├── content: string
        └── createdAt: Timestamp
```

### 🧪 Tests

Le projet inclut des tests unitaires pour tous les endpoints :

```bash
npm test
```

**Couverture actuelle :**
- ✅ 31 tests / 31 passés
- ✅ Serveurs : GET, POST + cas d'erreur
- ✅ Channels : GET, POST + cas d'erreur
- ✅ Messages : GET, POST, DELETE + cas d'erreur
- ✅ Reactions : GET, POST, DELETE + cas d'erreur

### 📚 Documentation API

Une fois déployé, l'API Swagger est disponible sur :
```
https://[BASE_URL]/docs
```

---

## 🎯 Objectifs Pédagogiques

Ce projet permet aux étudiants de :

- 📱 Développer une application Flutter complète de A à Z
- 🔌 Consommer une API REST réelle
- 🔐 Intégrer Firebase Authentication
- 🏗️ Structurer proprement une application mobile
- 🎨 Créer une interface utilisateur moderne
- 📊 Gérer l'état de l'application
- 🧪 Tester leurs requêtes HTTP
- 🚀 Travailler dans un contexte proche de la réalité professionnelle

---

## 📄 Licence

Projet pédagogique - Usage éducatif uniquement
