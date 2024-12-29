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
  const [draggedLetter, setDraggedLetter] = React.useState(null);

  // Use ref to store button elements
  const buttonRefs = React.useRef({});

  React.useEffect(() => {
    // Add non-passive touch event listeners to all letter buttons
    Object.values(buttonRefs.current).forEach(button => {
      if (button) {
        button.addEventListener('touchstart', handleTouchStart, { passive: false });
        button.addEventListener('touchmove', handleTouchMove, { passive: false });
        button.addEventListener('touchend', handleTouchEnd);
      }
    });

    // Cleanup
    return () => {
      Object.values(buttonRefs.current).forEach(button => {
        if (button) {
          button.removeEventListener('touchstart', handleTouchStart);
          button.removeEventListener('touchmove', handleTouchMove);
          button.removeEventListener('touchend', handleTouchEnd);
        }
      });
    };
  }, []); // Empty dependency array since we only need to set up once

  const handleDragStart = (e, letter, index) => {
    if (!availableLetters.includes(letter)) return; // Prevent dragging unavailable letters
    
    e.dataTransfer.setData('text/plain', JSON.stringify({
      letter,
      sourceIndex: index,
      source: 'letterBank'
    }));
  };

  const handleTouchStart = (e) => {
    const button = e.currentTarget;
    const letter = button.dataset.letter;
    const index = parseInt(button.dataset.index);

    if (!availableLetters.includes(letter)) return;
    
    e.preventDefault();
    document.body.classList.add('touch-dragging');
    setDraggedLetter({ letter, index });
  };

  const handleTouchMove = (e) => {
    if (!draggedLetter) return;
    e.preventDefault();
    
    // Get touch coordinates
    const touch = e.touches[0];
    
    // Find the element under the touch point
    const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Add visual feedback if needed
    if (elemBelow) {
      elemBelow.style.opacity = '0.7';
    }
  };

  const handleTouchEnd = (e) => {
    if (!draggedLetter) return;
    
    const touch = e.changedTouches[0];
    const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Find the closest board cell
    const boardCell = elemBelow?.closest('[data-cell]');
    
    if (boardCell) {
      const row = parseInt(boardCell.dataset.row);
      const col = parseInt(boardCell.dataset.col);
      
      // Simulate drop event
      const dropEvent = new Event('drop');
      dropEvent.dataTransfer = {
        getData: () => JSON.stringify({
          letter: draggedLetter.letter,
          sourceIndex: draggedLetter.index,
          source: 'letterBank'
        })
      };
      
      boardCell.dispatchEvent(dropEvent);
    }
    
    document.body.classList.remove('touch-dragging');
    setDraggedLetter(null);
  };

  const handleLetterClick = (letter, index) => {
    if (!availableLetters.includes(letter)) return;
    
    if (selectedCell) {
      onLetterPlaced(selectedCell.row, selectedCell.col, letter);
    }
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
                ref={el => buttonRefs.current[`${rowIndex}-${colIndex}`] = el}
                className={getLetterClassName(letter)}
                draggable={availableLetters.includes(letter)}
                onDragStart={(e) => handleDragStart(e, letter, colIndex)}
                onClick={() => handleLetterClick(letter, colIndex)}
                data-letter={letter}
                data-index={colIndex}
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