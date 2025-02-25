# 📚 Backend Bibliothèque Personnelle (Node.js + TypeScript + MongoDB)

Ce projet est le **backend d'une bibliothèque personnelle** permettant aux utilisateurs d'**ajouter, gérer et supprimer des livres** sous forme de fichiers PDF.  
Il est construit avec **Node.js, Express, TypeScript et MongoDB** et prend en charge **l'upload de fichiers**.

---

## 🚀 Fonctionnalités

- 📖 **Gestion des livres** : Ajouter, lister, modifier et supprimer des livres.
- 📂 **Upload de fichiers** : Enregistrer des livres en format PDF.
- 🔒 **Validation des données** avant enregistrement.
- 📄 **Documentation API avec Swagger**.
- 🐳 **Support Docker** pour un déploiement simplifié.
- ✅ **Tests unitaires** avec Jest & Supertest.
- 🛡 **Husky & Prettier** pour un code propre et formaté.

---

## 🏗 **Technologies Utilisées**

- **Backend** : Node.js, Express, TypeScript
- **Base de données** : MongoDB (Mongoose)
- **Upload de fichiers** : Multer
- **Tests** : Jest, Supertest
- **Qualité du code** : ESLint, Prettier, Husky
- **Containerisation** : Docker, Docker Compose
- **Documentation** : Swagger (OpenAPI)

---

## 🔧 **Installation et Configuration**

### 1️⃣ **Cloner le projet**

```sh
git clone https://github.com/votre-utilisateur/backendbook.git
cd backendbook
```

### 2️⃣ **Installer les dépendances**

```sh
pnpm install
```

### 3️⃣ **Configurer les variables d'environnement**

Créer un fichier .env à la racine et y ajouter :

.env

```sh
MONGODB_URI="mongodb+srv://"
PORT=5000
JWT_SECRET="define jwt secret"
```

### 4️⃣ **Lancer le projet**

#### 🛠 Mode Développement

```sh
pnpm dev
```

#### 🚀 Mode Production

```sh
pnpm build
pnpm start
```

---

## 🐳 **Exécution avec Docker**

Assurez-vous que **Docker** est installé, puis exécutez :

```sh
docker-compose up --build
```

✅ Cette commande va :

- Lancer **l’API backend** sur `http://localhost:5000`
- Démarrer un **conteneur MongoDB**.

---

## 🔥 Endpoints de l’API

### Utilisateurs

| Méthode  | Endpoint                      | Description                                     |
| -------- | ----------------------------- | ----------------------------------------------- |
| `POST`   | `/api/users/register`         | Enregistrer un nouvel utilisateur               |
| `POST`   | `/api/users/login`            | Connexion d'un utilisateur                      |
| `POST`   | `/api/users/favorites/add`    | Ajouter un livre aux favoris de l'utilisateur   |
| `DELETE` | `/api/users/favorites/remove` | Supprimer un livre des favoris de l'utilisateur |
| `GET`    | `/api/users/favorites`        | Récupérer les livres favoris de l'utilisateur   |
|          |

### Livres

| Méthode  | Endpoint                | Description                                |
| -------- | ----------------------- | ------------------------------------------ |
| `GET`    | `/api/books`            | Récupérer tous les livres de l'utilisateur |
| `GET`    | `/api/books/:id`        | Récupérer un livre spécifique              |
| `POST`   | `/api/books/add`        | Ajouter un livre (PDF)                     |
| `PUT`    | `/api/books/update/:id` | Mettre à jour un livre                     |
| `DELETE` | `/api/books/delete/:id` | Supprimer un livre                         |

🛠 **Documentation complète disponible sur :**

bash
http://localhost:5000/api/docs
(utilise **Swagger UI**)

---

## ✅ **Exécution des tests**

Lancer les tests unitaires avec :

```sh

pnpm test
```

---

## 🛡 **Husky - Vérification avant Commit**

Ce projet utilise **Husky** pour garantir un code propre :

- **Prettier & ESLint** s'exécutent avant chaque commit.
- **Les tests doivent réussir** avant de pouvoir pousser du code.

Exécuter manuellement :

---

## 🛡 **Husky - Vérification avant Commit**

Ce projet utilise **Husky** pour garantir un code propre :

- **Prettier & ESLint** s'exécutent avant chaque commit.
- **Les tests doivent réussir** avant de pouvoir pousser du code.

Exécuter manuellement :

```sh

pnpm lint
pnpm prettier:check
```
