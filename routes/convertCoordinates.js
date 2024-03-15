import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import axios from 'axios';
const router = express.Router();

// Get file route name (Same as file name)
const __filename = fileURLToPath(import.meta.url);
const parsed = path.parse(__filename);

dotenv.config();
const apiKey = process.env.BING_KEY;

router.post(`/${parsed.name}`, async (req, res) => {
  const location = req.body.location;
  if (location == undefined) {
    return res.status(400).json({ error: 'Location is required' });
  }

  const [lat, long] = location;
  try {
    const response = await axios.get(`http://dev.virtualearth.net/REST/v1/Locations/${lat},${long}?key=${apiKey}`);
    res.send(response.data.resourceSets[0].resources[0].address.formattedAddress);
  } catch (e) {
    console.log(e);
  }
});

export default router;