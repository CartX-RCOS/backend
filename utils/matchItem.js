import { getSimilarityScore } from './getSimilarityScore.js';

export function matchItem (baseItem, items) {
   let mostSimilarScore = -1;
   let mostSimilarItem = "";

   items.forEach(item => {
      const comparisonScore = getSimilarityScore(baseItem, item.name);
      if (comparisonScore > mostSimilarScore) {
         mostSimilarScore = comparisonScore;
         mostSimilarItem = item;
      }
   })

   return ([mostSimilarItem, mostSimilarScore])
}