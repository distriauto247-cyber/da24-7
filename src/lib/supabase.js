import { createClient } from '@supabase/supabase-js'

// IMPORTANT : Remplacez ces valeurs par vos propres clés Supabase
// Vous les obtiendrez après avoir créé un projet sur https://supabase.com
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Structure des tables recommandée :
/*
Table: users
- id (uuid, primary key)
- email (text)
- created_at (timestamp)
- role (text) - 'consumer' ou 'owner'

Table: distributors
- id (uuid, primary key)
- name (text)
- address (text)
- city (text)
- postal_code (text)
- latitude (float)
- longitude (float)
- category (text)
- is_cold (boolean)
- has_parking (boolean)
- photo_url (text)
- owner_id (uuid, foreign key to users)
- created_at (timestamp)
- rating (float)

Table: products
- id (uuid, primary key)
- distributor_id (uuid, foreign key)
- name (text)
- category (text)
- available (boolean)

Table: favorites
- id (uuid, primary key)
- user_id (uuid, foreign key)
- distributor_id (uuid, foreign key)
- created_at (timestamp)

Table: reports
- id (uuid, primary key)
- distributor_id (uuid, foreign key)
- user_id (uuid, foreign key)
- type (text)
- description (text)
- photo_url (text)
- created_at (timestamp)
*/
