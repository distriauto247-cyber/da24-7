/**
 * importOSM.js
 * Script à exécuter UNE SEULE FOIS (ou périodiquement) pour importer
 * les distributeurs automatiques OSM dans ta table Supabase.
 *
 * Usage : node importOSM.js
 * Prérequis : npm install @supabase/supabase-js node-fetch
 */

import { createClient } from '@supabase/supabase-js';
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

// ─── CONFIG ────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://muodyewqpxcbwkflwbur.supabase.co';       // ← remplace
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11b2R5ZXdxcHhjYndrZmx3YnVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzOTM0NSwiZXhwIjoyMDg1MjE1MzQ1fQ.22F0buiSksLYnhEceaI1T-QV3VO8BK5yxpOifFX_2mU';            // ← remplace (service_role key)
const BATCH_SIZE = 500; // nb d'inserts par batch
// ───────────────────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Requête Overpass : tous les vending_machine en France
const OVERPASS_QUERY = `
[out:json][timeout:120];
area["ISO3166-1"="FR"]["admin_level"="2"]->.fr;
(
  node["amenity"="vending_machine"](area.fr);
  node["amenity"="vending_machine"]["vending"](area.fr);
);
out body;
`;

async function fetchOSMData() {
  console.log('📡 Requête Overpass API en cours (peut prendre 30-60s)...');
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: OVERPASS_QUERY,
    headers: { 'Content-Type': 'text/plain' },
  });

  if (!res.ok) throw new Error(`Overpass error: ${res.status}`);
  const data = await res.json();
  console.log(`✅ ${data.elements.length} distributeurs trouvés sur OSM`);
  return data.elements;
}

function mapOSMToRow(node) {
  const t = node.tags || {};
  return {
    osm_id: node.id,
    latitude: node.lat,
    longitude: node.lon,
    nom: t.name || t.operator || 'Distributeur automatique',
    type_produit: t.vending || t['vending:product'] || 'inconnu',
    operateur: t.operator || null,
    marque: t.brand || null,
    adresse: t['addr:street']
      ? `${t['addr:housenumber'] || ''} ${t['addr:street']}`.trim()
      : null,
    ville: t['addr:city'] || null,
    code_postal: t['addr:postcode'] || null,
    acces: t.access || 'yes',
    ouverture: t.opening_hours || null,
    paiement_cb: t['payment:credit_cards'] === 'yes' || t['payment:debit_cards'] === 'yes',
    paiement_especes: t['payment:cash'] !== 'no',
    source: 'osm',
    osm_updated_at: new Date().toISOString(),
  };
}

async function insertBatch(rows) {
  const { error } = await supabase
    .from('distributeurs')
    .upsert(rows, { onConflict: 'osm_id', ignoreDuplicates: false });

  if (error) {
    console.error('❌ Erreur insert batch:', error.message);
    throw error;
  }
}

async function main() {
  try {
    const elements = await fetchOSMData();
    const rows = elements.map(mapOSMToRow);

    console.log(`📦 Import en cours par batches de ${BATCH_SIZE}...`);
    let imported = 0;

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      await insertBatch(batch);
      imported += batch.length;
      console.log(`  → ${imported} / ${rows.length}`);
    }

    console.log(`\n🎉 Import terminé ! ${imported} distributeurs dans Supabase.`);
  } catch (err) {
    console.error('💥 Erreur fatale:', err.message);
    process.exit(1);
  }
}

main();
