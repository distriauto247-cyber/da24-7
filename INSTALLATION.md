# 🚀 GUIDE D'INSTALLATION RAPIDE - DA24/7

## ⚡ Installation en 5 minutes

### Étape 1 : Ouvrir le terminal/invite de commandes

**Windows :** 
- Appuyez sur `Windows + R`
- Tapez `cmd` et Entrée

**Mac :**
- Appuyez sur `Cmd + Espace`
- Tapez `terminal` et Entrée

### Étape 2 : Naviguer vers le dossier du projet

```bash
cd chemin/vers/da24-7
```

Remplacez `chemin/vers/da24-7` par l'emplacement réel du dossier.

**Exemple Windows :**
```bash
cd C:\Users\VotreNom\Downloads\da24-7
```

**Exemple Mac/Linux :**
```bash
cd ~/Downloads/da24-7
```

### Étape 3 : Installer les dépendances

```bash
npm install
```

⏱️ Cela prend environ 2-3 minutes.

### Étape 4 : Configurer Supabase (Base de données)

#### 4.1 Créer un compte Supabase (gratuit)

1. Allez sur [supabase.com](https://supabase.com)
2. Cliquez sur "Start your project"
3. Créez un compte (avec Google c'est rapide)

#### 4.2 Créer un nouveau projet

1. Cliquez sur "New Project"
2. Nom du projet : `da24-7`
3. Mot de passe : créez-en un sécurisé (sauvegardez-le)
4. Région : choisissez la plus proche (ex: West EU - Paris)
5. Cliquez sur "Create new project"
6. ⏱️ Attendez 1-2 minutes que le projet soit créé

#### 4.3 Récupérer vos clés

1. Dans votre projet Supabase, cliquez sur l'icône ⚙️ (Settings) en bas à gauche
2. Cliquez sur "API" dans le menu
3. Vous verrez :
   - **Project URL** (ressemble à : `https://xxxxx.supabase.co`)
   - **anon public** (une longue clé qui commence par `eyJ...`)

#### 4.4 Configurer le fichier .env

1. Dans le dossier `da24-7`, dupliquez le fichier `.env.example`
2. Renommez la copie en `.env` (supprimez le `.example`)
3. Ouvrez `.env` avec un éditeur de texte
4. Remplacez :
   ```
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```
   
   Par vos vraies clés :
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

5. Sauvegardez le fichier

#### 4.5 Créer les tables dans Supabase

1. Dans Supabase, cliquez sur l'icône 🗄️ (SQL Editor) dans le menu de gauche
2. Cliquez sur "+ New query"
3. Copiez-collez le SQL suivant :

```sql
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

-- Politiques de sécurité
CREATE POLICY "Public read distributors" ON distributors FOR SELECT USING (true);
CREATE POLICY "Authenticated insert distributors" ON distributors FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users manage favorites" ON favorites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Authenticated create reports" ON reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

4. Cliquez sur "Run" (ou appuyez sur `Ctrl+Enter`)
5. Vous devriez voir "Success. No rows returned"

### Étape 5 : Lancer l'application ! 🎉

Dans le terminal :

```bash
npm run dev
```

Vous devriez voir :

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

### Étape 6 : Ouvrir l'application

1. Ouvrez votre navigateur (Chrome, Firefox, Safari...)
2. Allez sur : **http://localhost:3000**
3. 🎊 Votre application est en ligne !

---

## 🎯 Pour tester l'application

### Créer un compte de test

1. Sur la page d'accueil, cliquez sur la bottom navigation "Paramètres"
2. Cliquez sur "Se connecter"
3. Cliquez sur "Créer un compte"
4. Utilisez un email de test : `test@example.com`
5. Mot de passe : `test123`

### Ajouter un distributeur de test

Pour l'instant, la base de données est vide. Pour tester :

1. Dans Supabase, allez dans "Table Editor"
2. Sélectionnez la table `distributors`
3. Cliquez sur "Insert" → "Insert row"
4. Remplissez :
   - name : `Distributeur Pizza Test`
   - address : `123 Rue de Paris`
   - city : `Paris`
   - postal_code : `75001`
   - latitude : `48.8566`
   - longitude : `2.3522`
   - category : `pizza`
   - is_cold : `false`
   - has_parking : `true`
   - rating : `4.5`
5. Cliquez sur "Save"
6. Rafraîchissez l'app, le distributeur apparaîtra sur la carte !

---

## ❓ Problèmes courants

### "npm n'est pas reconnu..."

→ Node.js n'est pas installé ou le terminal n'a pas été redémarré après l'installation
→ Solution : Installez Node.js et redémarrez votre ordinateur

### "Cannot find module..."

→ Les dépendances ne sont pas installées
→ Solution : Exécutez `npm install`

### La page est blanche

→ Problème de configuration Supabase
→ Solution : Vérifiez que le fichier `.env` contient bien vos vraies clés

### "Failed to fetch"

→ Les tables Supabase ne sont pas créées
→ Solution : Relancez le SQL dans l'éditeur SQL de Supabase

---

## 📞 Besoin d'aide ?

Si vous êtes bloqué, n'hésitez pas à me demander ! Je suis là pour vous aider.

**Fichiers importants à vérifier :**
- `.env` → Vos clés Supabase
- `package.json` → Configuration du projet
- `src/lib/supabase.js` → Configuration de la connexion

---

## 🚀 Prochaines étapes

Une fois que tout fonctionne :

1. Créez la page "Ajouter un distributeur"
2. Ajoutez des vrais distributeurs
3. Testez les favoris
4. Testez la géolocalisation
5. Personnalisez le design
6. Déployez en production !

**Bon développement ! 🎉**
