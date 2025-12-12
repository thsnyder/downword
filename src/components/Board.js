import React, { useState, useEffect } from 'react';

const BOARD_SIZE = 10;

function Board({ board, highlightedCells = [], onLetterPlaced, onLetterRemoved, startPosition, goalPosition, selectedCell, setSelectedCell }) {
  const [showHints, setShowHints] = useState(true);
  const [justPlaced, setJustPlaced] = useState(null);

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
    
    // Invalid word cells - clear error state
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

  const handleCellClick = (rowIndex, colIndex) => {
    const cell = board[rowIndex][colIndex];
    
    if (cell) {
      // If cell has a letter, remove it
      if (typeof cell !== 'object' || !cell.locked) {
        onLetterRemoved(rowIndex, colIndex);
      }
      setSelectedCell(null);
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
                  handleCellClick(rowIndex, colIndex);
                }}
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