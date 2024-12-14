import React from 'react';
import { getRandomLetter, getUniqueRandomLetters } from '../data/letterPool';

const KEYBOARD_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

function LetterBank() {
  const [availableLetters] = React.useState(
    getUniqueRandomLetters(16)  // Get 16 unique letters on initial render
  );

  const handleDragStart = (e, letter, index) => {
    if (!availableLetters.includes(letter)) return; // Prevent dragging unavailable letters
    
    e.dataTransfer.setData('text/plain', JSON.stringify({
      letter,
      sourceIndex: index,
      source: 'letterBank'
    }));
  };

  const getLetterClassName = (letter) => {
    let baseClasses = "w-8 h-8 sm:w-12 sm:h-12 text-sm sm:text-base font-bold rounded-lg flex items-center justify-center select-none transition-all bg-base-300 border-2 font-['Source_Serif_4'] tracking-wide";
    
    if (!availableLetters.includes(letter)) {
      baseClasses += " opacity-30 cursor-not-allowed hover:scale-100 active:scale-100 border-base-content/20";
    } else {
      baseClasses += " cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95 shadow-md hover:shadow-lg border-accent text-accent-content bg-accent shadow-accent/30 hover:shadow-accent/50";
    }
    return baseClasses;
  };

  return (
    <div className="card bg-base-100 shadow-lg shadow-base-content/5 mt-4 p-2 sm:p-4">
      <div className="flex flex-col items-center gap-1 sm:gap-2">
        {KEYBOARD_LAYOUT.map((row, rowIndex) => (
          <div 
            key={rowIndex} 
            className="flex gap-0.5 sm:gap-1 justify-center" 
            style={{ paddingLeft: `${rowIndex * 10}px` }}
          >
            {row.map((letter, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={getLetterClassName(letter)}
                draggable={availableLetters.includes(letter)}
                onDragStart={(e) => handleDragStart(e, letter, colIndex)}
              >
                {letter}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LetterBank; 