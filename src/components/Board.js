import React, { useState, useEffect } from 'react';

const BOARD_SIZE = 10;

// Function to get random column position
const getRandomColumn = () => Math.floor(Math.random() * BOARD_SIZE);

function Board({ board, highlightedCells = [], onLetterPlaced, onLetterRemoved, startPosition, goalPosition, selectedCell, setSelectedCell }) {
  const [selectedCells, setSelectedCells] = useState([]);
  const [showHints, setShowHints] = useState(true);

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

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, rowIndex, colIndex) => {
    e.preventDefault();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      
      if (data.source === 'letterBank' && !board[rowIndex][colIndex]) {
        onLetterPlaced(data.letter, data.sourceIndex, rowIndex, colIndex);
      } else if (data.source === 'board') {
        onLetterPlaced(data.letter, data.sourceIndex, rowIndex, colIndex);
        onLetterRemoved(data.sourceRow, data.sourceCol);
      }
    } catch (error) {
      console.error('Error dropping letter:', error);
    }
  };

  const handleDragStart = (e, rowIndex, colIndex) => {
    const cell = board[rowIndex][colIndex];
    if (cell && typeof cell !== 'object') {
      e.dataTransfer.setData('text/plain', JSON.stringify({
        letter: cell,
        sourceIndex: null,
        source: 'board',
        sourceRow: rowIndex,
        sourceCol: colIndex
      }));
    }
  };

  const getCellClassName = (rowIndex, colIndex) => {
    let baseClasses = "w-7 h-7 sm:w-8 sm:h-8 text-sm sm:text-base font-bold rounded flex items-center justify-center select-none transition-all border-2 bg-base-300 hover:bg-base-200 font-['Source_Serif_4'] tracking-wide";
    
    // Add selected cell highlighting
    if (selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex) {
      baseClasses += " border-primary border-2 bg-primary/10 animate-pulse";
    }
    
    // Start position (neon green)
    if (rowIndex === startPosition.row && colIndex === startPosition.col) {
      return `${baseClasses} bg-success/20 border-success text-success-content shadow-lg shadow-success/50`;
    }
    
    // Goal position (neon pink)
    if (rowIndex === goalPosition.row && colIndex === goalPosition.col) {
      return `${baseClasses} bg-secondary/20 border-secondary text-secondary-content shadow-lg shadow-secondary/50`;
    }
    
    // Get cell content
    const cell = board[rowIndex][colIndex];
    
    // Invalid word cells (red)
    if (highlightedCells.some(c => c.row === rowIndex && c.col === colIndex)) {
      return `${baseClasses} bg-error/30 border-error text-error-content shadow-lg shadow-error/50 border-2 animate-pulse`;
    }
    
    // Empty cell hover effect
    if (!cell) {
      baseClasses += " border-base-content/20 hover:border-base-content/40";
    } else {
      baseClasses += " border-base-content/40 shadow-sm";
    }
    
    return baseClasses;
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
      // If cell is empty, select it
      setSelectedCell({ row: rowIndex, col: colIndex });
    }
  };

  return (
    <div className="card bg-base-100 shadow-lg shadow-base-content/5 p-2 sm:p-4">
      <div className="mx-auto max-w-[400px]">
        <div className="grid gap-0.5 sm:gap-1 relative" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))` }}>
          {/* Start hint toast */}
          {showHints && (
            <>
              <div 
                className="absolute text-xs bg-success text-success-content px-2 py-1 rounded shadow-lg shadow-success/20 font-semibold"
                style={{ 
                  left: `${startPosition.col * (100/BOARD_SIZE)}%`, 
                  bottom: '100%',
                  transform: 'translateX(-25%)',
                  marginBottom: '4px',
                  whiteSpace: 'nowrap'
                }}
              >
                Start here ↓
              </div>
              
              {/* Goal hint toast */}
              <div 
                className="absolute text-xs bg-secondary text-secondary-content px-2 py-1 rounded shadow-lg shadow-secondary/20 font-semibold"
                style={{ 
                  left: `${goalPosition.col * (100/BOARD_SIZE)}%`, 
                  top: '100%',
                  transform: 'translateX(-25%)',
                  marginTop: '4px',
                  whiteSpace: 'nowrap'
                }}
              >
                ↑ Get to here
              </div>
            </>
          )}
          
          {board.map((row, rowIndex) => (
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={getCellClassName(rowIndex, colIndex)}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
                draggable={cell && typeof cell !== 'object'}
                onDragStart={(e) => handleDragStart(e, rowIndex, colIndex)}
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