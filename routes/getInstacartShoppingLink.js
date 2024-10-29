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
const apiKey = process.env.INSTACART_API;

const headers = {
   "Accept": "application/json",
   "Authorization": `Bearer ${apiKey}`,
   "Content-Type": "application/json"
}

router.post(`/${parsed.name}`, async (req, res) => {
   const items = req.body.items;
   if (items == undefined || items.length == 0) {
      return res.status(400).json({ error: 'Items are required' });
   }

   // https://docs.instacart.com/developer_platform_api/api/products/create_shopping_list_page
   const data = {
      "title": "CartX Shopping List",
      "image_url": "https://i.imgur.com/6IUif55.png",  
      "link_type": "shopping_list",
      "expires_in": 1,  
      "instructions": ["This is shopping list is powered by CartX!"],  
      "line_items": items, // [{name:item1}, {name:item2}] quantity, unit, display text also valid
      "landing_page_configuration": {
         "partner_linkback_url": "https://cartx.us/",
         "enable_pantry_items": false
      }
   }


try {
      const response = await axios.post("https://connect.dev.instacart.tools/idp/v1/products/products_link", data, { headers });
      
      if (response.status === 200) {
         const shoppingListUrl = response.data.products_link_url;
         return res.status(200).json({ shoppingListUrl });
      } else {
         return res.status(response.status).json({ error: response.data });
      }
   } catch (error) {
      console.error("Error creating shopping list:", error.message);
      return res.status(500).json({ error: "Failed to create shopping list" });
   }
});

export default router;