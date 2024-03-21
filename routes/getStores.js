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

//Based on given store, performs API call to find its nearest locations within set radius
async function fetchNearbyStores(store, userLocation) {
  let response;
  try {
    response = await fetch(`https://dev.virtualearth.net/REST/v1/LocalSearch/?query=${store}&userLocation=${userLocation[0]}
    ,${userLocation[1]}&maxResults=1&key=${apiKey}`);
  } catch(e) {
    console.log("Error: ", e);
  }

  if (!response.ok) {
    console.log(store);
    throw new Error(`Network response was not ok (${response.status})`);
  }

  const data = await response.json();
  return data;
}

// Iterates and finds all approved stores in parallel
async function searchNearbyStores(userLocation, stores) {
  let storeArray = [];
  const promises = stores.map(async (query, index) => {
    const result = await fetchNearbyStores(query, userLocation);
    const foundStores = result.resourceSets[0].resources;

    const storePromises = foundStores.map(async foundStore => {
      const name = foundStore.name || 'Unknown';
      const address = foundStore.Address.formattedAddress;
      const coordinates = foundStore.geocodePoints[0].coordinates;
      const distTime = await fetchDistance(userLocation, coordinates);
      return {
        name: name,
        address: address,
        distance: distTime[0],
        travelTime: distTime[1],
      };
    });

    const storeResults = await Promise.all(storePromises);
    storeArray = storeArray.concat(storeResults);
  });

  await Promise.all(promises);

  storeArray.sort((a, b) => {
    return a.distance - b.distance;
  });

  return storeArray;
}



router.put(`/${parsed.name}`, async (req, res) => {
  const location = req.body.location;
  if (location == undefined || location.length == 0) {
    return res.status(400).json({ error: 'Location is required' });
  }

  let stores = ['Target', 'Hannaford', 'CVS', 'ShopRite'];
  const coordinates = await fetchCoordinates(location);
  
  let storeArray = await searchNearbyStores(coordinates, stores);

  res.json(storeArray);
});

export default router;
