import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const parsed = path.parse(__filename);

router.post(`/${parsed.name}`, async (req, res) => { 
   const cart = req.body.cart;
   if (!cart || cart.length === 0) {
      return res.status(400).json({ error: 'Non Empty cart is required' });
   }

   const storeUrls = {
      "market 32": "https://www.market32.com",
      "aldi": "https://www.aldi.us",
      "price rite": "https://www.priceritesupermarkets.com",
      "shoprite": "https://www.shoprite.com",
      "walgreens": "https://www.walgreens.com/",
      "cvs": "https://www.cvs.com/",
      "price chopper": "https://www.pricechopper.com",
      "hannaford": "https://www.hannaford.com",
      "tops markets": "https://www.topsmarkets.com",
      "market bistro": "https://www.marketbistro.com",
      "restaurant depot": "https://www.restaurantdepot.com",
      "target": "https://www.target.com",
      "kinney drugs": "https://www.kinneydrugs.com"
   };

   const storeData = {};
   const storePrices = {}; 

   cart.forEach(item => {
      if (!item.matches || Object.keys(item.matches).length === 0) {
         console.warn(`Item "${item.name}" has no matches.`);
         return;
      }

      for (const [store, matchData] of Object.entries(item.matches)) {
         if (!storeData[store]) {
            storeData[store] = {
               name: store,
               distance: Math.random() * 10, // Dummy distance
               price: 0,
               items: [],
               priceComparison: 0, 
               itemAvailability: 0, 
               savings: 0, 
               bestChoice: false,
               comparisonString: "", 
               url: storeUrls[store] || "https://example.com" 
            };
         }

         const itemPrice = parseFloat(matchData.price) || 5.00;
         console.log(matchData, itemPrice);
         storeData[store].price += itemPrice;

         storeData[store].items.push({
            name: item.name,
            contains: matchData.matched,
            price: itemPrice,
            url: matchData.product_url || ""
         });

         // Track prices for comparison
         if (!storePrices[item.name]) {
            storePrices[item.name] = [];
         }
         storePrices[item.name].push(itemPrice);
      }
   });

   // Calculate itemAvailability and savings
   for (const store in storeData) {
      const storeItems = storeData[store].items;
      let availableCount = 0;

      storeItems.forEach(item => {
         if (item.contains) availableCount++;

         // Find min price for each item across stores
         const minPrice = Math.min(...storePrices[item.name]);
         storeData[store].savings += item.price ? item.price - minPrice : 0;
      });

      storeData[store].itemAvailability = Math.round((availableCount / storeItems.length) * 100);
   }

   // Calculate priceComparison
   const allPrices = Object.values(storeData).map(store => store.price);
   const minPrice = Math.min(...allPrices);
   const maxPrice = Math.max(...allPrices);

   Object.values(storeData).forEach(store => {
      console.log(`Store: ${store.name}`);
      console.log(`  Total Price: $${store.price.toFixed(2)}`);
      console.log(`  Item Availability: ${store.itemAvailability}%`);
      console.log(`  Savings: $${store.savings.toFixed(2)}`);
      const availabilityFactor = store.itemAvailability / 100;
      if (maxPrice === minPrice) {
         store.priceComparison = 100 * availabilityFactor; // All stores have the same price
      } else {
         console.log(store.name, store.price, minPrice, maxPrice);
         store.priceComparison = Math.round(
            (100 - ((store.price - minPrice) / (maxPrice - minPrice)) * 100) * availabilityFactor);
      }

      store.comparisonString = `${100 - store.priceComparison}% cheaper than the most expensive store.`;
   });

   // Determine Best Choice
   const lowestPriceStore = Object.values(storeData).sort((a, b) => a.price - b.price)[0];
   lowestPriceStore.bestChoice = true;
   

   return res.status(200).json(storeData);
});


export default router;
