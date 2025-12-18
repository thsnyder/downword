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
    // Clean card-like tile base - mobile-first sizing (min 44px for touch)
    let baseClasses = "w-11 h-11 sm:w-10 sm:h-10 md:w-12 md:h-12 text-lg sm:text-xl md:text-2xl font-bold rounded-xl flex items-center justify-center select-none transition-all duration-150 font-['Source_Serif_4'] cursor-pointer";
    
    // Validation feedback takes priority (temporary green/red highlights)
    if (validationFeedback) {
      const isValidCell = validationFeedback.validCells?.some(c => c.row === rowIndex && c.col === colIndex);
      const isInvalidCell = validationFeedback.invalidCells?.some(c => c.row === rowIndex && c.col === colIndex);
      
      if (isValidCell && validationFeedback.valid) {
        // Valid word cells - green highlight
        return `${baseClasses} bg-green-100 dark:bg-green-900/30 border-4 border-green-500 text-green-700 dark:text-green-300 shadow-md ring-2 ring-green-400/50`;
      } else if (isInvalidCell) {
        // Invalid word cells - red highlight with shake animation
        return `${baseClasses} bg-red-100 dark:bg-red-900/30 border-4 border-red-500 text-red-700 dark:text-red-300 shadow-md animate-shake ring-2 ring-red-400/50`;
      }
    }
    
    // Add selected cell highlighting - clean and clear
    if (selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex) {
      return `${baseClasses} bg-primary text-primary-content border-2 border-primary shadow-lg shadow-primary/30 ring-2 ring-primary/20 scale-105`;
    }
    
    // Start position - distinct blue
    if (rowIndex === startPosition.row && colIndex === startPosition.col) {
      return `${baseClasses} bg-blue-500 text-white border-2 border-blue-600 shadow-md font-extrabold`;
    }
    
    // Goal position - distinct green
    if (rowIndex === goalPosition.row && colIndex === goalPosition.col) {
      return `${baseClasses} bg-green-500 text-white border-2 border-green-600 shadow-md font-extrabold`;
    }
    
    // Get cell content
    const cell = board[rowIndex][colIndex];
    
    // Invalid word cells - clear error state (from submit errors)
    if (highlightedCells.some(c => c.row === rowIndex && c.col === colIndex)) {
      return `${baseClasses} bg-red-100 dark:bg-red-900/30 border-2 border-red-400 text-red-700 dark:text-red-300 shadow-sm animate-pulse`;
    }
    
    // Empty cell - clean, subtle, tappable
    if (!cell) {
      return `${baseClasses} bg-base-200 dark:bg-base-300 border-2 border-base-300 dark:border-base-400 text-base-content/30 hover:bg-base-300 dark:hover:bg-base-400 hover:border-primary/30 active:scale-95`;
    } else {
      // Cell with letter - elevated card with high contrast
      const wasJustPlaced = justPlaced === `${rowIndex}-${colIndex}`;
      return `${baseClasses} bg-white dark:bg-base-100 border-2 border-base-300 dark:border-base-400 text-base-content shadow-md hover:shadow-lg active:scale-95 font-extrabold ${
        wasJustPlaced ? 'animate-pulse scale-110' : ''
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
    <div className="card bg-base-100 shadow-lg border border-base-300 p-4 sm:p-5 md:p-6 rounded-2xl">
      <div className="mx-auto w-full max-w-[100vw] sm:max-w-md md:max-w-lg">
        <div className="grid gap-1.5 sm:gap-2 relative" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))` }}>
          {/* Start hint toast */}
          {showHints && (
            <>
              <div 
                className="absolute text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg shadow-md font-semibold"
                style={{ 
                  left: `${startPosition.col * (100/BOARD_SIZE)}%`, 
                  bottom: '100%',
                  transform: 'translateX(-25%)',
                  marginBottom: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                Start ↓
              </div>
              
              {/* Goal hint toast */}
              <div 
                className="absolute text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg shadow-md font-semibold"
                style={{ 
                  left: `${goalPosition.col * (100/BOARD_SIZE)}%`, 
                  top: '100%',
                  transform: 'translateX(-25%)',
                  marginTop: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                ↑ Goal
              </div>
            </>
          )}
          
          {board.map((row, rowIndex) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}

export default Board; 