# DA24/7 - Distributeurs Automatiques 24h/24, 7j/7

Application mobile collaborative pour localiser les distributeurs automatiques en France.

## 🚀 Démarrage rapide

### Prérequis

- Node.js v20+ installé
- npm ou yarn

### Installation

1. **Installer les dépendances**
```bash
npm install
```

2. **Configurer Supabase**

   a. Créez un compte gratuit sur [supabase.com](https://supabase.com)
   
   b. Créez un nouveau projet
   
   c. Copiez le fichier `.env.example` en `.env`
   ```bash
   cp .env.example .env
   ```
   
   d. Remplissez vos clés Supabase dans le fichier `.env`
   
   e. Créez les tables dans Supabase en exécutant ce SQL :
   
   ```sql
   -- Table utilisateurs (automatiquement créée par Supabase Auth)
   
   -- Table distributeurs
   CREATE TABLE distributors (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     name TEXT NOT NULL,
     address TEXT NOT NULL,
     city TEXT NOT NULL,
     postal_code TEXT NOT NULL,
     latitude FLOAT,
     longitude FLOAT,
     category TEXT NOT NULL,
     is_cold BOOLEAN DEFAULT false,
     has_parking BOOLEAN DEFAULT false,
     photo_url TEXT,
     owner_id UUID REFERENCES auth.users(id),
     owner_name TEXT,
     rating FLOAT DEFAULT 0,
     created_at TIMESTAMP DEFAULT NOW()
   );
   
   -- Table produits
   CREATE TABLE products (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     distributor_id UUID REFERENCES distributors(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     category TEXT,
     icon TEXT,
     available BOOLEAN DEFAULT true,
     created_at TIMESTAMP DEFAULT NOW()
   );
   
   -- Table favoris
   CREATE TABLE favorites (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     distributor_id UUID REFERENCES distributors(id) ON DELETE CASCADE,
     created_at TIMESTAMP DEFAULT NOW(),
     UNIQUE(user_id, distributor_id)
   );
   
   -- Table signalements
   CREATE TABLE reports (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     distributor_id UUID REFERENCES distributors(id) ON DELETE CASCADE,
     user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
     type TEXT NOT NULL,
     description TEXT NOT NULL,
     photo_url TEXT,
     status TEXT DEFAULT 'pending',
     created_at TIMESTAMP DEFAULT NOW()
   );
   
   -- Activer Row Level Security
   ALTER TABLE distributors ENABLE ROW LEVEL SECURITY;
   ALTER TABLE products ENABLE ROW LEVEL SECURITY;
   ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
   ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
   
   -- Politiques RLS (Row Level Security)
   -- Lecture publique pour distributors
   CREATE POLICY "Distributors are viewable by everyone" 
     ON distributors FOR SELECT 
     USING (true);
   
   -- Insertion authentifiée pour distributors
   CREATE POLICY "Authenticated users can insert distributors" 
     ON distributors FOR INSERT 
     WITH CHECK (auth.role() = 'authenticated');
   
   -- Les utilisateurs peuvent gérer leurs favoris
   CREATE POLICY "Users can manage their own favorites" 
     ON favorites FOR ALL 
     USING (auth.uid() = user_id);
   
   -- Les utilisateurs peuvent créer des signalements
   CREATE POLICY "Authenticated users can create reports" 
     ON reports FOR INSERT 
     WITH CHECK (auth.role() = 'authenticated');
   ```

3. **Configurer l'authentification Google/Apple (optionnel)**
   
   Dans Supabase Dashboard :
   - Allez dans Authentication > Providers
   - Activez Google et/ou Apple
   - Configurez les OAuth credentials

### Lancement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 📱 Build pour production

```bash
npm run build
```

Les fichiers optimisés seront dans le dossier `dist/`

## 🔧 Technologies utilisées

- **React 18** - Framework UI
- **Vite** - Build tool ultra-rapide
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Supabase** - Backend as a Service (Auth + Database)
- **React Leaflet** - Cartes interactives (OpenStreetMap)
- **Lucide React** - Icônes modernes
- **Vite PWA** - Progressive Web App

## 📂 Structure du projet

```
da24-7/
├── public/              # Fichiers statiques
├── src/
│   ├── components/      # Composants réutilisables
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Logo.jsx
│   │   └── DistributorCard.jsx
│   ├── layouts/         # Layouts de pages
│   │   └── MainLayout.jsx
│   ├── pages/           # Pages de l'application
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── MapView.jsx
│   │   ├── DistributorDetail.jsx
│   │   ├── Favorites.jsx
│   │   ├── Settings.jsx
│   │   └── ...
│   ├── lib/            # Utilitaires
│   │   └── supabase.js
│   ├── App.jsx         # Composant principal
│   ├── main.jsx        # Point d'entrée
│   └── index.css       # Styles globaux
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎨 Pages disponibles

✅ Authentification complète (Login, Signup, Reset Password)
✅ Page d'accueil avec recherche et catégories
✅ Carte interactive avec géolocalisation
✅ Détail d'un distributeur
✅ Liste des distributeurs d'un commerçant
✅ Page des favoris
✅ Paramètres complets
✅ Signalement de problème
✅ Versions de l'application

## 🔐 Authentification

L'application supporte :
- Email/Password
- Google OAuth
- Apple OAuth
- Mode invité (sans sauvegarde des favoris)

## 🗺️ Carte interactive

- Utilise OpenStreetMap (gratuit, pas de clé API nécessaire)
- Géolocalisation de l'utilisateur
- Marqueurs personnalisés par catégorie
- Recherche par ville/adresse

## 📦 Base de données

Tables Supabase :
- `distributors` - Informations des distributeurs
- `products` - Produits disponibles par distributeur
- `favorites` - Favoris des utilisateurs
- `reports` - Signalements de problèmes

## 🚧 Fonctionnalités à ajouter

- [ ] Page "Ajouter un distributeur"
- [ ] Upload de photos réel
- [ ] Notifications push
- [ ] Système de notation/avis
- [ ] Filtres avancés
- [ ] Mode hors ligne
- [ ] Partage sur réseaux sociaux
- [ ] Statistiques pour propriétaires

## 🐛 Débogage

Si vous rencontrez des problèmes :

1. Vérifiez que Node.js est bien installé : `node --version`
2. Vérifiez les variables d'environnement dans `.env`
3. Vérifiez que les tables Supabase sont créées
4. Consultez la console du navigateur pour les erreurs

## 📄 Licence

Application créée pour DA24/7 - Tous droits réservés

## 👨‍💻 Support

Pour toute question : distriauto24.7@gmail.com
