import { ratio } from 'fuzzball';

export function getSimilarityScore(baseString, comparisonString) {
   const baseWords = baseString.split(" ")
   const comparisonWords = comparisonString.split(" ")

   let totalSimilarityScore = 0;
   baseWords.forEach(baseWord => {
      let bestSimilarityScore = 0;
      comparisonWords.forEach(comparisonWord => {
         const similarityScore = ratio(baseWord, comparisonWord)
         bestSimilarityScore = Math.max(bestSimilarityScore, similarityScore)
      })

      totalSimilarityScore += bestSimilarityScore
   });

   return totalSimilarityScore
}