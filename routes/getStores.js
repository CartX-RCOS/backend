import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
const router = express.Router();

// Get file route name (Same as file name)
const __filename = fileURLToPath(import.meta.url);
const parsed = path.parse(__filename);

dotenv.config();
const apiKey = process.env.BING_KEY;

// Returns an array of size 2 with the latitute and longtitude of the given address
async function fetchCoordinates(address) {
  let response;

  // Try to make call to BingMaps API
  try {
    response = await fetch(`http://dev.virtualearth.net/REST/v1/Locations?addressLine=${address}&key=${apiKey}`);
  } catch(e) {
    console.error("Error: ", e);
  }

  if (!response.ok) {
    throw new Error(`Network response was not ok (${response.status})`);
  }

  const data = await response.json();
  return data.resourceSets[0].resources[0].point.coordinates;
}


//Uses BingMaps API to fetch the distance 
async function fetchDistance(startCoords, endCoords) {
  let response;

  // BingMaps API calculates the distance between the user location and the given store location
  try {
    response = await fetch(`https://dev.virtualearth.net/REST/v1/Routes/DistanceMatrix?origins=${startCoords}&destinations=${endCoords}&travelMode=driving&key=${apiKey}&distanceUnit=mi`)
  } catch(e) {
    console.error('Error:', error);
  }

  if (!response.ok) {
    throw new Error(`Network response was not ok (${response.status})`);
  }

  const distance = await response.json();
  
  const dist = distance.resourceSets[0].resources[0].results[0].travelDistance;
  const time = distance.resourceSets[0].resources[0].results[0].travelDuration;
  return [dist, time];
  
}


router.get(`/${parsed.name}`, async (req, res) => {
  const location = "1761 15th St, Troy, NY 12180";
  const coordinates = fetchCoordinates(location);
  
  const sampleStores = [
    'shoprite',
    'target',
    'cvs'
  ];

  res.json({ stores: sampleStores });
});

export default router;
