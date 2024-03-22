export async function fetchItems(db, searchQuery, stores) {
   const words = searchQuery.split(/\s+/); // Split the search query into words
   const regexParts = words.map(word => {
      // Escape regex characters in word and add an optional 's' at the end for plurals
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return `(?:${escapedWord}s?)`;
   });

   // Join the parts with '.*' to match documents that contain all words in any order
   const regexPattern = regexParts.join('.*');
   const _regex = new RegExp(regexPattern, 'i');

   const storeData = {}
   for (const store of stores) {
      const foundItems = await db.collection(store).find({
         name: { $regex: _regex }
      }).toArray();
   
      storeData[store] = foundItems;
   }

   return storeData
 }