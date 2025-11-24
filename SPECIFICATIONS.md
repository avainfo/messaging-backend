# 📘 Cahier des Charges - Application Flutter de Messagerie

> **Note pour mes étudiants** : Ce document décrit les fonctionnalités que vous devez implémenter dans votre application Flutter. Le backend est déjà fourni et déployé par moi. Votre mission est de créer l'application mobile qui consomme cette API.

---

## 🎯 Objectif

Développer une **application Flutter de messagerie** connectée au backend que je vous fournis.

Votre rôle : créer une **UI complète**, gérer **Firebase Auth** (votre propre projet Firebase), et consommer les **routes REST** ci-dessous.

**Important :**

* Vous utilisez **votre propre Firebase** uniquement pour l'authentification.
* Le backend gère **serveurs**, **channels**, **messages** (fourni et déployé par moi).
* Vous ne modifiez **pas** le backend et **pas** Firestore directement.
* Toute la classe utilise le **même backend centralisé**.

---

## 🔗 Accès à l'API

**Base URL de l'API :** `https://us-central1-messaging-backend-m2i.cloudfunctions.net/api`

**Documentation Swagger :** `https://us-central1-messaging-backend-m2i.cloudfunctions.net/api/docs`

**Guide de test :** Consultez [TESTING.md](TESTING.md) pour des exemples de requêtes.

---

## 🧭 Fonctionnalités à Implémenter

### ✔️ 1. Authentification (Firebase Auth – votre projet)

Votre app doit permettre :

* inscription (email + mot de passe)
* connexion
* déconnexion
* gestion du `displayName`
* récupération du `uid` Firebase
  → utilisé comme `authorId` dans l'API

---

### ✔️ 2. Navigation Principale

Votre application doit contenir les écrans suivants :

#### 🔹 Page d'Accueil (Serveurs)

* affiche la liste des serveurs récupérés depuis :
  **GET /servers**
* permet de créer un serveur via :
  **POST /servers**

#### 🔹 Page Channels d'un Serveur

* affiche les channels d'un serveur via :
  **GET /servers/:serverId/channels**
* permet de créer un channel via :
  **POST /servers/:serverId/channels**

#### 🔹 Page Chat d'un Channel

* affiche les messages du channel via :
  **GET /channels/:channelId/messages**
* permet d'envoyer un message via :
  **POST /channels/:channelId/messages**

#### 🔹 Page Profil

* affiche le profil Firebase
* permet de modifier le nom & avatar (local)
* permet de se déconnecter

---

## 📡 API REST à Consommer

Voici les routes que vous devez appeler depuis Flutter :

| Méthode + Route                          | Action                              | Ce que votre app doit faire                                  |
| ---------------------------------------- | ----------------------------------- | ------------------------------------------------------------ |
| **GET `/health`**                        | Ping API                            | Appeler une fois pour tester la connexion                    |
| **GET `/servers`**                       | Liste des serveurs                  | Récupérer et afficher les serveurs                           |
| **POST `/servers`**                      | Création d'un serveur               | Envoyer `{ name, ownerId }`                                  |
| **GET `/servers/:serverId/channels`**    | Liste des channels                  | Afficher les channels d'un serveur                           |
| **POST `/servers/:serverId/channels`**   | Création d'un channel               | Envoyer `{ name }`                                     |
| **GET `/channels/:channelId/messages`**  | Récupérer les messages d'un channel | Afficher l'historique + pagination si nécessaire             |
| **POST `/channels/:channelId/messages`** | Envoyer un message                  | Envoyer `{ authorId, authorName, authorAvatarUrl, content }` |

**Note :**
Aucun token Firebase n'est nécessaire → vos requêtes sont **simples**, avec un body JSON uniquement.

---

## 🗄️ Structure Firestore du Backend (Référence)

*(Vous n'y accédez pas directement — cette structure vous est donnée pour comprendre l'API.)*

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
│           └── createdAt: Timestamp
│
├── channels (collection)
│     └── {channelId} (document)
│           ├── id: string
│           ├── serverId: string
│           ├── name: string
│           ├── type: "text"
│           └── createdAt: Timestamp
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

---

## 🎨 Exigences UI/UX

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

## 🧱 Contraintes Techniques

* Flutter 3.x minimum
* Null-safety obligatoire
* Gestion d'état : Provider, Riverpod ou Bloc
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

## 🧪 Livrables

Votre application doit contenir **au minimum** :

- ✅ Auth Firebase (login / signup)
- ✅ Liste des serveurs
- ✅ Création serveur
- ✅ Liste des channels
- ✅ Création channel
- ✅ Chat (send / display messages)
- ✅ Profil utilisateur
- ✅ Gestion état propre
- ✅ Code organisé + README

---

## ⭐ Bonus Facultatifs (Valorisés)

* thèmes clair / sombre
* édition / suppression de messages
* réactions emoji
* avatars personnalisés
* pagination infinie dans le chat
* animations (fade-in, slide, etc.)
* version Flutter Web
* liste des membres du serveur

---

## 💡 Conseils

1. **Commencez par tester l'API** avec les exemples du fichier [TESTING.md](TESTING.md)
2. **Créez vos modèles de données** avant de faire les appels API
3. **Implémentez l'authentification en premier** pour avoir un `userId` à utiliser
4. **Testez chaque endpoint** individuellement avant de les intégrer dans l'UI
5. **Structurez votre code dès le début** pour faciliter la maintenance

---

## 📚 Ressources Utiles

- [Documentation Flutter](https://flutter.dev/docs)
- [Firebase Auth pour Flutter](https://firebase.google.com/docs/auth/flutter/start)
- [Package HTTP pour Flutter](https://pub.dev/packages/http)
- [TESTING.md](TESTING.md) - Guide de test de l'API

---

Bon courage dans votre développement ! 🚀
