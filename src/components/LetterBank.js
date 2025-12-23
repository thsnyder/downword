import React from 'react';
import { getUniqueRandomLetters } from '../data/letterPool';

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
    <section className="mt-2">
      <div className="rounded-xl bg-base-100 shadow-md px-3 py-3 flex flex-wrap justify-center gap-2">
        {KEYBOARD_LAYOUT.map((row, rowIndex) => (
          row.map((letter) => {
            const isAvailable = availableLetters.includes(letter);
            const canPlace = isAvailable && selectedCell !== null;
            const wasJustPlaced = justPlaced === letter;
            
            return (
              <button
                key={letter}
                className={`btn btn-sm sm:btn-md btn-outline rounded-full px-3 sm:px-4 min-w-[44px] min-h-[44px] flex items-center justify-center text-base sm:text-lg font-bold transition-all duration-150 ${
                  !isAvailable 
                    ? 'opacity-25 cursor-not-allowed' 
                    : canPlace
                    ? wasJustPlaced
                      ? 'btn-primary shadow-lg scale-110 animate-pulse'
                      : 'btn-primary shadow-md hover:shadow-lg active:scale-95'
                    : wasJustPlaced
                      ? 'shadow-md scale-110'
                      : 'hover:shadow-md active:scale-95'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleLetterClick(letter);
                }}
                disabled={!isAvailable || !selectedCell}
                aria-label={`Place letter ${letter}`}
              >
                {letter}
              </button>
            );
          })
        ))}
      </div>
      {!selectedCell && (
        <p className="text-xs sm:text-sm text-base-content/60 mt-2 text-center font-medium">
          Tap a board cell, then tap a letter to place it
        </p>
      )}
      {selectedCell && (
        <p className="text-xs sm:text-sm text-primary font-semibold mt-2 text-center bg-primary/10 px-4 py-2 rounded-lg">
          Cell selected — choose a letter
        </p>
      )}
    </section>
  );
}

export default LetterBank;
