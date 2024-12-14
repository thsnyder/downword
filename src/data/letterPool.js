export const letterPool = {
  'A': { count: 9, points: 1 },
  'B': { count: 2, points: 3 },
  'C': { count: 2, points: 3 },
  'D': { count: 4, points: 2 },
  'E': { count: 12, points: 1 },
  'F': { count: 2, points: 4 },
  'G': { count: 3, points: 2 },
  'H': { count: 2, points: 4 },
  'I': { count: 9, points: 1 },
  'J': { count: 1, points: 8 },
  'K': { count: 1, points: 5 },
  'L': { count: 4, points: 1 },
  'M': { count: 2, points: 3 },
  'N': { count: 6, points: 1 },
  'O': { count: 8, points: 1 },
  'P': { count: 2, points: 3 },
  'Q': { count: 1, points: 10 },
  'R': { count: 6, points: 1 },
  'S': { count: 4, points: 1 },
  'T': { count: 6, points: 1 },
  'U': { count: 4, points: 1 },
  'V': { count: 2, points: 4 },
  'W': { count: 2, points: 4 },
  'X': { count: 1, points: 8 },
  'Y': { count: 2, points: 4 },
  'Z': { count: 1, points: 10 }
};

const VOWELS = ['A', 'E', 'I', 'O', 'U'];
const MIN_VOWELS = 5;

// Get a random letter based on frequency distribution
export function getRandomLetter() {
  const letters = [];
  Object.entries(letterPool).forEach(([letter, { count }]) => {
    for (let i = 0; i < count; i++) {
      letters.push(letter);
    }
  });
  
  return letters[Math.floor(Math.random() * letters.length)];
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Get an array of unique random letters with minimum vowels
export function getUniqueRandomLetters(count) {
  // First, ensure we have our minimum vowels
  const selectedVowels = shuffleArray([...VOWELS]).slice(0, MIN_VOWELS);
  const remainingCount = count - MIN_VOWELS;
  
  // Get remaining consonants
  const consonants = Object.keys(letterPool).filter(letter => !VOWELS.includes(letter));
  const selectedConsonants = shuffleArray(consonants).slice(0, remainingCount);
  
  // Combine and shuffle the final selection
  const allLetters = shuffleArray([...selectedVowels, ...selectedConsonants]);
  
  return allLetters;
} 