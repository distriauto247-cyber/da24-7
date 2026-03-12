// src/lib/distributorService.js

/**
 * Récupère un distributeur par son ID
 */
export const getDistributorById = (id) => {
  const distributors = JSON.parse(localStorage.getItem('distributors') || '[]');
  return distributors.find(distributor => distributor.id === id);
};

/**
 * Récupère tous les distributeurs
 */
export const getAllDistributors = () => {
  return JSON.parse(localStorage.getItem('distributors') || '[]');
};

/**
 * Vérifie si un distributeur est dans les favoris
 */
export const isFavorite = (distributorId) => {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  return favorites.includes(distributorId);
};

/**
 * Ajoute un distributeur aux favoris
 */
export const addFavorite = (distributorId) => {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  
  if (!favorites.includes(distributorId)) {
    favorites.push(distributorId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
  
  return favorites;
};

/**
 * Retire un distributeur des favoris
 */
export const removeFavorite = (distributorId) => {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  const index = favorites.indexOf(distributorId);
  
  if (index > -1) {
    favorites.splice(index, 1);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
  
  return favorites;
};

/**
 * Ajoute ou retire un distributeur des favoris
 */
export const toggleFavorite = (distributorId) => {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  const index = favorites.indexOf(distributorId);
  
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(distributorId);
  }
  
  localStorage.setItem('favorites', JSON.stringify(favorites));
  return favorites;
};

/**
 * Calcule la distance entre deux points GPS (formule de Haversine)
 * Retourne la distance en kilomètres
 */
export const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Convertit les degrés en radians
 */
const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Récupère tous les favoris
 */
export const getFavorites = () => {
  return JSON.parse(localStorage.getItem('favorites') || '[]');
};