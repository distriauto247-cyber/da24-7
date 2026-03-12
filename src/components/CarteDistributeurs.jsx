/**
 * CarteDistributeurs.jsx
 * Composant React affichant les distributeurs sur une carte OpenStreetMap.
 * Utilise : react-leaflet + @supabase/supabase-js
 *
 * Installation : npm install react-leaflet leaflet @supabase/supabase-js
 */

import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { createClient } from '@supabase/supabase-js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ─── CONFIG ────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://muodyewqpxcbwkflwbur.supabase.co';   // ← remplace
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11b2R5ZXdxcHhjYndrZmx3YnVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzOTM0NSwiZXhwIjoyMDg1MjE1MzQ1fQ.22F0buiSksLYnhEceaI1T-QV3VO8BK5yxpOifFX_2mU';           // ← remplace (anon key)
const MAX_MARKERS = 300; // limite pour les perfs
// ───────────────────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Icône personnalisée distributeur
const iconeDA = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3774/3774278.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Corrige le bug d'icônes Leaflet avec Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ─── Chargement dynamique selon la vue de la carte ─────────────────────────
function ChargeurDynamique({ onDistributeursCharges }) {
  const map = useMapEvents({
    moveend: () => chargerZone(),
    zoomend: () => chargerZone(),
  });

  const chargerZone = useCallback(async () => {
    const bounds = map.getBounds();
    const { data, error } = await supabase
      .from('distributeurs')
      .select('*')
      .gte('latitude', bounds.getSouth())
      .lte('latitude', bounds.getNorth())
      .gte('longitude', bounds.getWest())
      .lte('longitude', bounds.getEast())
      .limit(MAX_MARKERS);

    if (!error && data) {
      onDistributeursCharges(data);
    }
  }, [map, onDistributeursCharges]);

  useEffect(() => {
    chargerZone();
  }, []);

  return null;
}

// ─── Composant principal ───────────────────────────────────────────────────
export default function CarteDistributeurs() {
  const [distributeurs, setDistributeurs] = useState([]);
  const [filtre, setFiltre] = useState('tous');
  const [stats, setStats] = useState(null);

  // Charge les stats globales au montage
  useEffect(() => {
    async function chargerStats() {
      const { count } = await supabase
        .from('distributeurs')
        .select('*', { count: 'exact', head: true });
      setStats(count);
    }
    chargerStats();
  }, []);

  const distributeursAffiches = distributeurs.filter(d => {
    if (filtre === 'tous') return true;
    return d.type_produit?.toLowerCase().includes(filtre);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

      {/* ── Barre de filtres ── */}
      <div style={{
        padding: '10px 16px',
        background: '#1a1a2e',
        color: 'white',
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <strong>DA24.7</strong>
        {stats && <span style={{ fontSize: 12, opacity: 0.7 }}>· {stats.toLocaleString()} DA en France</span>}
        <span style={{ marginLeft: 'auto', fontSize: 13 }}>Filtrer :</span>
        {['tous', 'food', 'drinks', 'cigarettes', 'tickets', 'condoms'].map(f => (
          <button
            key={f}
            onClick={() => setFiltre(f)}
            style={{
              padding: '4px 10px',
              borderRadius: 20,
              border: 'none',
              cursor: 'pointer',
              background: filtre === f ? '#e94560' : '#16213e',
              color: 'white',
              fontSize: 12,
            }}
          >
            {f === 'tous' ? '🗺️ Tous' :
             f === 'food' ? '🍔 Alimentaire' :
             f === 'drinks' ? '🥤 Boissons' :
             f === 'cigarettes' ? '🚬 Tabac' :
             f === 'tickets' ? '🎫 Tickets' : '💊 Autres'}
          </button>
        ))}
        <span style={{ fontSize: 12, opacity: 0.7, marginLeft: 8 }}>
          {distributeursAffiches.length} affichés
        </span>
      </div>

      {/* ── Carte ── */}
      <MapContainer
        center={[46.603354, 1.888334]} // Centre France
        zoom={6}
        style={{ flex: 1 }}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ChargeurDynamique onDistributeursCharges={setDistributeurs} />

        {distributeursAffiches.map(da => (
          <Marker
            key={da.id || da.osm_id}
            position={[da.latitude, da.longitude]}
            icon={iconeDA}
          >
            <Popup>
              <div style={{ minWidth: 180 }}>
                <strong>{da.nom}</strong><br />
                {da.type_produit && <span>📦 {da.type_produit}<br /></span>}
                {da.operateur && <span>🏢 {da.operateur}<br /></span>}
                {da.adresse && <span>📍 {da.adresse}{da.ville ? `, ${da.ville}` : ''}<br /></span>}
                {da.ouverture && <span>🕐 {da.ouverture}<br /></span>}
                <div style={{ marginTop: 6, fontSize: 12, color: '#666' }}>
                  {da.paiement_cb && '💳 CB '}
                  {da.paiement_especes && '💶 Espèces'}
                </div>
                {da.source === 'osm' && (
                  <div style={{ marginTop: 4, fontSize: 11, color: '#aaa' }}>
                    Source : OpenStreetMap
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
