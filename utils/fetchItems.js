export async function fetchItems(items, stores, db) {
   // Validate
   if(!items || !stores || !db){
      return {}
   }

   let results = {};
   const storePromises = stores.map(async (store) => {
      results[store] = {};

      try {
         // Generate item queries
         const queries = items.map(async (item) => {
         const query = `SELECT * FROM ${store} WHERE product_name LIKE '%${item}%'`;
         let response = await db.query(query);
         return [item, response[0]]; 
         });

         // Wait for all item queries to resolve
         const allResults = await Promise.all(queries);

         // Store in result
         allResults.forEach(([item, response]) => {
         results[store][item] = response;
         });

      // Could not connect to SQL or table does not exist
      } catch (error) {
         console.error(`Error querying store ${store}: ${error.message}`);
      }
   });

   // Wait for all store processes to resolve
   await Promise.all(storePromises);


   return results
 }