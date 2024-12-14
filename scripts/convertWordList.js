const fs = require('fs');

// Read the word list file
const words = fs.readFileSync('words_alpha.txt', 'utf8')
  .split('\n')
  .map(word => word.trim())
  .filter(word => {
    // Filter criteria:
    // 1. Word length between 2 and 10 characters
    // 2. Only letters (no numbers or special characters)
    // 3. Remove empty strings
    return word.length >= 2 && 
           word.length <= 10 && 
           /^[a-zA-Z]+$/.test(word) &&
           word.length > 0;
  });

// Convert to JSON and write to file
fs.writeFileSync(
  'src/data/filtered.json',
  JSON.stringify(words, null, 2)
);

console.log(`Converted ${words.length} words to JSON format`); 