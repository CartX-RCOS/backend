import { ratio } from 'fuzzball';

export function findMostSimilar(baseItem, items) {
  let highestScore = 0;
  let mostSimilarItem = null;

  items.forEach(item => {
    const score = ratio(baseItem, item.name);
    if (score > highestScore) {
      highestScore = score;
      mostSimilarItem = item;
    }
  });

  return mostSimilarItem;
}
