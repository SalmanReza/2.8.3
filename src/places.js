/* Nearest town and area from coordinates, entirely on device.
   Data: src/places-data.js (GeoNames, CC BY 4.0). No network. */
import { PLACES } from './places-data.js';

let buckets = null;
const banglaByName = new Map();

function ensureIndex() {
  if (buckets) return;
  buckets = new Map();
  for (const row of PLACES) {
    const key = `${Math.floor(row[0])}:${Math.floor(row[1])}`;
    const list = buckets.get(key);
    if (list) list.push(row);
    else buckets.set(key, [row]);
    if (row[5]) banglaByName.set(row[3], row[5]);
  }
}

function kmBetween(lat1, lon1, lat2, lon2) {
  const dLat = (lat1 - lat2) * 110.574;
  const dLon = (lon1 - lon2) * 111.32 * Math.cos(((lat1 + lat2) * 0.5) * Math.PI / 180);
  return Math.hypot(dLat, dLon);
}

function banglaName(english) {
  return banglaByName.get(english) || '';
}

/** "Savar, Dhaka" (or Bangla, when lang is bn). Empty when no town is within range. */
export function localPlace(lat, lon, lang = 'en') {
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return '';
  ensureIndex();
  const lat0 = Math.floor(lat);
  const lon0 = Math.floor(lon);
  let nearest = null;
  let town = null;
  for (let ring = 0; ring <= 5; ring++) {
    for (let dy = -ring; dy <= ring; dy++) {
      for (let dx = -ring; dx <= ring; dx++) {
        if (ring && Math.max(Math.abs(dx), Math.abs(dy)) !== ring) continue;
        const list = buckets.get(`${lat0 + dy}:${lon0 + dx}`);
        if (!list) continue;
        for (const row of list) {
          const dist = kmBetween(lat, lon, row[0], row[1]);
          if (dist > 500) continue;
          if (!nearest || dist < nearest.dist) nearest = { dist, row };
          if (row[2] >= 25 && dist <= 40 && (!town || dist < town.dist)) town = { dist, row };
        }
      }
    }
    if (town) break;
    if (nearest && nearest.dist <= Math.max(40, ring * 70)) break;
  }
  const hit = town || nearest;
  if (!hit) return '';
  const name = hit.row[3];
  const area = hit.row[4] || '';
  const bn = lang === 'bn';
  const townName = bn ? (hit.row[5] || banglaName(name) || name) : name;
  const areaName = !area ? '' : (bn ? (banglaName(area) || area) : area);
  if (areaName && areaName.toLowerCase() !== townName.toLowerCase()) return `${townName}, ${areaName}`;
  return townName;
}
