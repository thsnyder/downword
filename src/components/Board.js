import React, { useState, useEffect, useRef } from 'react';

const BOARD_SIZE = 10;
const LONG_PRESS_DURATION = 500; // milliseconds

function Board({ board, highlightedCells = [], onLetterPlaced, onLetterRemoved, startPosition, goalPosition, selectedCell, setSelectedCell, validationFeedback = null }) {
  const [showHints, setShowHints] = useState(true);
  const [justPlaced, setJustPlaced] = useState(null);
  const longPressTimerRef = useRef(null);
  const longPressCellRef = useRef(null);
  const longPressFiredRef = useRef(false);

  // Check if any letters have been placed
  useEffect(() => {
    if (showHints) {
      const hasLetters = board.some(row => 
        row.some(cell => cell !== null)
      );
      if (hasLetters) {
        setShowHints(false);
      }
    }
  }, [board, showHints]);

  const getCellClassName = (rowIndex, colIndex) => {
    // Mobile-first: aspect-square ensures cells stay square, responsive text sizes
    let baseClasses = "aspect-square flex items-center justify-center text-xs sm:text-sm md:text-base font-bold rounded-md select-none transition-all duration-150 font-['Source_Serif_4'] cursor-pointer min-w-[44px] min-h-[44px]";
    
    // Validation feedback takes priority (temporary green/red highlights)
    if (validationFeedback) {
      const isValidCell = validationFeedback.validCells?.some(c => c.row === rowIndex && c.col === colIndex);
      const isInvalidCell = validationFeedback.invalidCells?.some(c => c.row === rowIndex && c.col === colIndex);
      
      if (isValidCell && validationFeedback.valid) {
        // Valid word cells - green highlight
        return `${baseClasses} bg-green-100 dark:bg-green-900/30 border-2 border-green-500 text-green-700 dark:text-green-300 shadow-md ring-2 ring-green-400/50 active:scale-95`;
      } else if (isInvalidCell) {
        // Invalid word cells - red highlight with shake animation
        return `${baseClasses} bg-red-100 dark:bg-red-900/30 border-2 border-red-500 text-red-700 dark:text-red-300 shadow-md animate-shake ring-2 ring-red-400/50 active:scale-95`;
      }
    }
    
    // Add selected cell highlighting - clean and clear
    if (selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex) {
      return `${baseClasses} bg-primary text-primary-content border-2 border-primary shadow-lg ring-2 ring-primary/50 active:scale-95`;
    }
    
    // Start position - distinct blue
    if (rowIndex === startPosition.row && colIndex === startPosition.col) {
      return `${baseClasses} bg-blue-500 text-white border-2 border-blue-600 shadow-md font-extrabold active:scale-95`;
    }
    
    // Goal position - distinct green
    if (rowIndex === goalPosition.row && colIndex === goalPosition.col) {
      return `${baseClasses} bg-green-500 text-white border-2 border-green-600 shadow-md font-extrabold active:scale-95`;
    }
    
    // Get cell content
    const cell = board[rowIndex][colIndex];
    
    // Invalid word cells - clear error state (from submit errors)
    if (highlightedCells.some(c => c.row === rowIndex && c.col === colIndex)) {
      return `${baseClasses} bg-red-100 dark:bg-red-900/30 border-2 border-red-400 text-red-700 dark:text-red-300 shadow-sm animate-pulse active:scale-95`;
    }
    
    // Empty cell - clean, subtle, tappable
    if (!cell) {
      return `${baseClasses} bg-base-100 border border-base-300 text-base-content/30 hover:bg-base-200 active:scale-95 active:bg-base-200`;
    } else {
      // Cell with letter - elevated card with high contrast
      const wasJustPlaced = justPlaced === `${rowIndex}-${colIndex}`;
      return `${baseClasses} bg-white dark:bg-base-100 border border-base-300 text-base-content shadow-sm hover:shadow-md active:scale-95 font-extrabold ${
        wasJustPlaced ? 'animate-pulse scale-105' : ''
      }`;
    }
  };

  const getCellContent = (cell) => {
    if (!cell) return '';
    if (typeof cell === 'object' && cell.letter) return cell.letter;
    return cell;
  };

  const handleCellClick = (rowIndex, colIndex, wasLongPress = false) => {
    const cell = board[rowIndex][colIndex];
    
    // Check if cell is locked - locked cells should not be selectable or editable
    // Note: typeof null === 'object' is true in JavaScript, so we must check cell !== null first
    const isLocked = cell !== null && typeof cell === 'object' && cell.locked;
    if (isLocked) {
      return; // Do nothing for locked cells
    }
    
    // If this was a long press on a filled cell, clear it
    if (wasLongPress && cell) {
      onLetterRemoved(rowIndex, colIndex);
      setSelectedCell(null);
      return;
    }
    
    if (cell) {
      // If cell has a letter and is not locked, select it (don't clear)
      if (selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex) {
        // Deselect if clicking the same selected cell
        setSelectedCell(null);
      } else {
        // Select the cell (letter remains)
        setSelectedCell({ row: rowIndex, col: colIndex });
      }
    } else {
      // If cell is empty, toggle selection
      if (selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex) {
        // Deselect if clicking the same cell
        setSelectedCell(null);
      } else {
        // Select the cell
        setSelectedCell({ row: rowIndex, col: colIndex });
      }
    }
  };

  const handleTouchStart = (rowIndex, colIndex) => {
    const cell = board[rowIndex][colIndex];
    // Note: typeof null === 'object' is true in JavaScript, so we must check cell !== null first
    const isLocked = cell !== null && typeof cell === 'object' && cell.locked;
    
    // Reset long press flag
    longPressFiredRef.current = false;
    
    // Only start long-press timer for non-locked cells with letters
    if (cell && !isLocked) {
      longPressCellRef.current = { row: rowIndex, col: colIndex };
      longPressTimerRef.current = setTimeout(() => {
        // Long press detected - clear the letter
        if (longPressCellRef.current && 
            longPressCellRef.current.row === rowIndex && 
            longPressCellRef.current.col === colIndex) {
          longPressFiredRef.current = true;
          handleCellClick(rowIndex, colIndex, true);
          longPressCellRef.current = null;
        }
      }, LONG_PRESS_DURATION);
    }
  };

  const handleTouchEnd = (rowIndex, colIndex) => {
    // Clear long-press timer if it exists (meaning it wasn't a long press)
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    // Only trigger normal click if it wasn't a long press
    if (!longPressFiredRef.current) {
      // Check if this was the same cell we were tracking
      if (longPressCellRef.current && 
          longPressCellRef.current.row === rowIndex && 
          longPressCellRef.current.col === colIndex) {
        // Normal tap - trigger selection
        handleCellClick(rowIndex, colIndex, false);
      } else if (!longPressCellRef.current) {
        // No long press was being tracked (empty cell or locked cell)
        handleCellClick(rowIndex, colIndex, false);
      }
    }
    
    longPressCellRef.current = null;
    longPressFiredRef.current = false;
  };

  const handleTouchCancel = () => {
    // Clear long-press timer on touch cancel
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressCellRef.current = null;
    longPressFiredRef.current = false;
  };

  // Watch for new letter placements to trigger animation
  useEffect(() => {
    if (selectedCell && board[selectedCell.row] && board[selectedCell.row][selectedCell.col]) {
      setJustPlaced(`${selectedCell.row}-${selectedCell.col}`);
      setTimeout(() => setJustPlaced(null), 300);
    }
  }, [board, selectedCell]);

  return (
    <section className="flex justify-center">
      <div className="grid grid-cols-10 gap-1 sm:gap-1.5 bg-base-300 p-2 sm:p-3 rounded-xl shadow-md w-full max-w-xs sm:max-w-sm md:max-w-md">
        {board.map((row, rowIndex) => 
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={getCellClassName(rowIndex, colIndex)}
              onClick={(e) => {
                e.preventDefault();
                handleCellClick(rowIndex, colIndex, false);
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                handleTouchStart(rowIndex, colIndex);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleTouchEnd(rowIndex, colIndex);
              }}
              onTouchCancel={handleTouchCancel}
              data-cell="true"
              data-row={rowIndex}
              data-col={colIndex}
            >
              {getCellContent(cell)}
            </button>
          ))
        )}
      </div>
    </section>
  );
}

export default Board; 