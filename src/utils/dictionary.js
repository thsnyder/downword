// Import the filtered dictionary
import filteredWords from '../data/filtered.json';

// Immediately log the imported data to verify it's loaded correctly
console.log('Raw imported data:', filteredWords);
console.log('Number of words loaded:', filteredWords.length);

// Verify it's an array
if (!Array.isArray(filteredWords)) {
  console.error('Filtered words is not an array:', typeof filteredWords);
  throw new Error('Dictionary failed to load correctly');
}

// Convert the imported words array to a Set for O(1) lookups
const DICTIONARY = new Set(filteredWords.map(word => word.toUpperCase()));

// Debug logging
console.log('Dictionary loaded with', DICTIONARY.size, 'words');
console.log('Sample words:', Array.from(DICTIONARY).slice(0, 10));

export const isValidWord = (word) => {
  if (!word) return false;
  const upperWord = word.toUpperCase();
  const isValid = DICTIONARY.has(upperWord);
  console.log(`Checking word: ${upperWord}, Valid: ${isValid}, Dictionary has word: ${DICTIONARY.has(upperWord)}`);
  return isValid;
};

// Add a helper function to check if dictionary is loaded
export const isDictionaryLoaded = () => {
  return DICTIONARY.size > 0;
};

export const getWordScore = (word) => {
  // Basic scoring: 1 point per letter + bonus for length
  const baseScore = word.length;
  let bonus = 0;
  
  if (word.length >= 5) bonus = 3;
  if (word.length >= 7) bonus = 5;
  if (word.length >= 9) bonus = 8;
  
  return baseScore + bonus;
}; 