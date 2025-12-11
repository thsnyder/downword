import React from 'react';
import { getRandomLetter, getUniqueRandomLetters } from '../data/letterPool';

const KEYBOARD_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

function LetterBank({ selectedCell, onLetterPlaced }) {
  const [availableLetters] = React.useState(
    getUniqueRandomLetters(16)
  );
  const [justPlaced, setJustPlaced] = React.useState(null);

  const handleLetterClick = (letter) => {
    // Only allow placing if a cell is selected and letter is available
    if (!selectedCell) return;
    if (!availableLetters.includes(letter)) return;

    // Place the letter in the selected cell
    onLetterPlaced(letter, null, selectedCell.row, selectedCell.col);
    
    // Trigger placement animation
    setJustPlaced(letter);
    setTimeout(() => setJustPlaced(null), 300);
  };

  return (
    <div className="card bg-base-100 shadow-lg border border-base-300 p-4 sm:p-5 mt-4 rounded-2xl">
      <div className="flex flex-col gap-2.5 sm:gap-3 items-center">
        {KEYBOARD_LAYOUT.map((row, rowIndex) => (
          <div 
            key={rowIndex} 
            className="flex gap-2 sm:gap-2.5 justify-center"
            style={{ paddingLeft: rowIndex > 0 ? `${rowIndex * 12}px` : '0' }}
          >
            {row.map((letter) => {
              const isAvailable = availableLetters.includes(letter);
              const canPlace = isAvailable && selectedCell !== null;
              const wasJustPlaced = justPlaced === letter;
              
              return (
                <button
                  key={letter}
                  className={`letter-bank-tile transition-all duration-150 ${
                    !isAvailable 
                      ? 'opacity-25 cursor-not-allowed bg-base-200 text-base-content/30' 
                      : canPlace
                      ? wasJustPlaced
                        ? 'bg-primary text-primary-content shadow-lg scale-110 animate-pulse'
                        : 'bg-primary text-primary-content shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
                      : wasJustPlaced
                        ? 'bg-base-300 text-base-content shadow-md scale-110'
                        : 'bg-base-200 text-base-content shadow-sm hover:bg-base-300 hover:shadow-md active:scale-95'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLetterClick(letter);
                  }}
                  disabled={!isAvailable || !selectedCell}
                  aria-label={`Place letter ${letter}`}
                >
                  <span className="font-bold text-lg sm:text-xl">{letter}</span>
                </button>
              );
            })}
          </div>
        ))}
        {!selectedCell && (
          <p className="text-xs sm:text-sm text-base-content/60 mt-3 text-center font-medium px-4 py-2">
            Tap a board cell, then tap a letter to place it
          </p>
        )}
        {selectedCell && (
          <p className="text-xs sm:text-sm text-primary font-semibold mt-2 text-center bg-primary/10 px-4 py-2 rounded-lg">
            Cell selected — choose a letter
          </p>
        )}
      </div>
    </div>
  );
}

export default LetterBank;
