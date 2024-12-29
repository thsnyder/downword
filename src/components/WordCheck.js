import React, { useEffect, useState } from 'react';
import { isValidWord, getWordScore } from '../utils/dictionary';

function WordCheck({ board, onWordSubmit, goalPosition, startPosition, isConnected }) {
  const [canSubmit, setCanSubmit] = useState(false);
  const [invalidCells, setLocalInvalidCells] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isGameComplete, setIsGameComplete] = useState(false);

  // Get the path cells from start to goal
  const getPathCells = (board) => {
    const visited = new Set();
    const queue = [[startPosition.row, startPosition.col]];
    const pathCells = [];
    visited.add(`${startPosition.row},${startPosition.col}`);

    while (queue.length > 0) {
      const [currentRow, currentCol] = queue.shift();
      pathCells.push({ row: currentRow, col: currentCol });
      
      // Check if we've reached the goal
      if (currentRow === goalPosition.row && currentCol === goalPosition.col) {
        return pathCells;
      }
      
      // Check all adjacent cells (including diagonals)
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;
          
          const newRow = currentRow + dx;
          const newCol = currentCol + dy;
          const key = `${newRow},${newCol}`;
          
          // Skip if out of bounds or already visited
          if (newRow < 0 || newRow >= board.length || 
              newCol < 0 || newCol >= board[0].length ||
              visited.has(key)) {
            continue;
          }
          
          // If there's a letter in this cell, add it to the queue
          const cell = board[newRow][newCol];
          if (cell) {
            visited.add(key);
            queue.push([newRow, newCol]);
          }
        }
      }
    }
    
    return null; // No path found
  };

  // Check if there's a path from start to goal
  const hasPathToGoal = (board) => {
    const path = getPathCells(board);
    return path !== null;
  };

  // Check if cells are connected to each other
  const areCellsConnected = (cells) => {
    if (cells.length === 0) return false;
    
    // Create a set of visited cells
    const visited = new Set();
    const queue = [cells[0]];
    visited.add(`${cells[0].row},${cells[0].col}`);

    while (queue.length > 0) {
      const current = queue.shift();
      
      // Check all adjacent cells (including diagonals)
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;
          
          const newRow = current.row + dx;
          const newCol = current.col + dy;
          const key = `${newRow},${newCol}`;
          
          // If this adjacent position is in our cells array and hasn't been visited
          if (cells.some(cell => cell.row === newRow && cell.col === newCol) && !visited.has(key)) {
            visited.add(key);
            queue.push({ row: newRow, col: newCol });
          }
        }
      }
    }

    // All cells should be visited if they're connected
    return visited.size === cells.length;
  };

  const findWords = (board, pathCells) => {
    const words = new Set();

    const isHorizontalLine = (cell1, cell2) => {
      return cell1.row === cell2.row && Math.abs(cell1.col - cell2.col) === 1;
    };

    const isVerticalLine = (cell1, cell2) => {
      return cell1.col === cell2.col && Math.abs(cell1.row - cell2.row) === 1;
    };

    const rowGroups = new Map();
    const colGroups = new Map();

    pathCells.forEach(cell => {
      if (!rowGroups.has(cell.row)) {
        rowGroups.set(cell.row, []);
      }
      rowGroups.get(cell.row).push(cell);

      if (!colGroups.has(cell.col)) {
        colGroups.set(cell.col, []);
      }
      colGroups.get(cell.col).push(cell);
    });

    const processSequence = (sequence) => {
      const word = sequence.map(cell => {
        const letter = board[cell.row][cell.col];
        return typeof letter === 'object' ? letter.letter : letter;
      }).join('');

      if (isValidWord(word)) {
        words.add(JSON.stringify({ 
          word, 
          cells: [...sequence],
          score: getWordScore(word)
        }));
      }
    };

    rowGroups.forEach(cells => {
      cells.sort((a, b) => a.col - b.col);
      let sequence = [cells[0]];

      for (let i = 1; i < cells.length; i++) {
        if (isHorizontalLine(cells[i-1], cells[i])) {
          sequence.push(cells[i]);
        } else {
          if (sequence.length >= 2) {
            processSequence(sequence);
          }
          sequence = [cells[i]];
        }
      }
      if (sequence.length >= 2) {
        processSequence(sequence);
      }
    });

    colGroups.forEach(cells => {
      cells.sort((a, b) => a.row - b.row);
      let sequence = [cells[0]];

      for (let i = 1; i < cells.length; i++) {
        if (isVerticalLine(cells[i-1], cells[i])) {
          sequence.push(cells[i]);
        } else {
          if (sequence.length >= 2) {
            processSequence(sequence);
          }
          sequence = [cells[i]];
        }
      }
      if (sequence.length >= 2) {
        processSequence(sequence);
      }
    });

    return Array.from(words).map(w => JSON.parse(w));
  };

  // Check if all path cells are part of valid words
  const validatePath = (board, pathCells) => {
    const foundWords = findWords(board, pathCells);
    const validCells = new Set();
    const invalidSequences = [];
    
    // Group cells by rows and columns
    const rowGroups = new Map(); // row -> cells
    const colGroups = new Map(); // col -> cells

    // Sort cells into row and column groups
    pathCells.forEach(cell => {
      if (!rowGroups.has(cell.row)) {
        rowGroups.set(cell.row, []);
      }
      rowGroups.get(cell.row).push(cell);

      if (!colGroups.has(cell.col)) {
        colGroups.set(cell.col, []);
      }
      colGroups.get(cell.col).push(cell);
    });

    // Check horizontal sequences
    rowGroups.forEach(cells => {
      cells.sort((a, b) => a.col - b.col);
      let sequence = [cells[0]];
      
      for (let i = 1; i < cells.length; i++) {
        if (Math.abs(cells[i].col - cells[i-1].col) === 1) {
          sequence.push(cells[i]);
        } else {
          // Process current sequence if it's long enough
          if (sequence.length >= 2) {
            const word = sequence.map(cell => {
              const letter = board[cell.row][cell.col];
              return typeof letter === 'object' ? letter.letter : letter;
            }).join('');
            
            if (isValidWord(word)) {
              sequence.forEach(cell => validCells.add(`${cell.row},${cell.col}`));
            } else {
              invalidSequences.push({
                word,
                cells: sequence
              });
            }
          }
          sequence = [cells[i]];
        }
      }
      
      // Process the last sequence
      if (sequence.length >= 2) {
        const word = sequence.map(cell => {
          const letter = board[cell.row][cell.col];
          return typeof letter === 'object' ? letter.letter : letter;
        }).join('');
        
        if (isValidWord(word)) {
          sequence.forEach(cell => validCells.add(`${cell.row},${cell.col}`));
        } else {
          invalidSequences.push({
            word,
            cells: sequence
          });
        }
      }
    });

    // Check vertical sequences
    colGroups.forEach(cells => {
      cells.sort((a, b) => a.row - b.row);
      let sequence = [cells[0]];
      
      for (let i = 1; i < cells.length; i++) {
        if (Math.abs(cells[i].row - cells[i-1].row) === 1) {
          sequence.push(cells[i]);
        } else {
          // Process current sequence if it's long enough
          if (sequence.length >= 2) {
            const word = sequence.map(cell => {
              const letter = board[cell.row][cell.col];
              return typeof letter === 'object' ? letter.letter : letter;
            }).join('');
            
            if (isValidWord(word)) {
              sequence.forEach(cell => validCells.add(`${cell.row},${cell.col}`));
            } else {
              invalidSequences.push({
                word,
                cells: sequence
              });
            }
          }
          sequence = [cells[i]];
        }
      }
      
      // Process the last sequence
      if (sequence.length >= 2) {
        const word = sequence.map(cell => {
          const letter = board[cell.row][cell.col];
          return typeof letter === 'object' ? letter.letter : letter;
        }).join('');
        
        if (isValidWord(word)) {
          sequence.forEach(cell => validCells.add(`${cell.row},${cell.col}`));
        } else {
          invalidSequences.push({
            word,
            cells: sequence
          });
        }
      }
    });

    // Get all cells that form invalid words
    const invalidCells = invalidSequences.flatMap(seq => seq.cells);
    const invalidWords = invalidSequences.map(seq => seq.word);

    return {
      invalidCells: invalidCells.map(cell => ({ row: cell.row, col: cell.col })),
      invalidWords
    };
  };

  // Helper function to check if two cells are adjacent (including diagonally)
  const areAdjacent = (cell1, cell2) => {
    const rowDiff = Math.abs(cell1.row - cell2.row);
    const colDiff = Math.abs(cell1.col - cell2.col);
    return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
  };

  const handleSubmit = () => {
    const pathCells = getPathCells(board);
    if (!pathCells) return;

    const foundWords = findWords(board, pathCells);
    if (foundWords.length === 0) {
      const invalidCellsToHighlight = pathCells.map(cell => ({
        row: cell.row,
        col: cell.col
      }));
      setLocalInvalidCells(invalidCellsToHighlight);
      setErrorMessage("No valid words found in path");
      return;
    }

    const { invalidCells, invalidWords } = validatePath(board, pathCells);
    if (invalidCells.length > 0) {
      const invalidCellsToHighlight = invalidCells.map(cell => ({
        row: cell.row,
        col: cell.col
      }));
      setLocalInvalidCells(invalidCellsToHighlight);
      setErrorMessage(`Invalid word${invalidWords.length > 1 ? 's' : ''}: ${invalidWords.join(', ')}`);
      return;
    }

    const totalScore = foundWords.reduce((sum, { score }) => sum + score, 0);
    setLocalInvalidCells([]);
    setErrorMessage('');
    setIsGameComplete(true);
    onWordSubmit('', totalScore, [], foundWords);
  };

  const handlePlayAgain = () => {
    window.location.reload();
  };

  useEffect(() => {
    // Check if there's a path from start to goal
    setCanSubmit(hasPathToGoal(board));
    // Clear invalid cells when board changes
    setLocalInvalidCells([]);
    // Reset game complete state when board changes
    setIsGameComplete(false);
  }, [board, goalPosition, startPosition]);

  return (
    <div className="card bg-base-100 shadow-lg mt-4 p-4">
      <div className="flex justify-between items-center gap-4">
        <div className="flex-grow min-w-0">
          {invalidCells.length > 0 && (
            <div className="text-error text-sm">
              {errorMessage || "Some letters in your path don't form valid words"}
            </div>
          )}
        </div>
        <div className="flex-shrink-0 ml-auto flex gap-2">
          <button 
            className={`btn ${canSubmit ? 'btn-success' : 'btn-disabled'}`}
            onClick={handleSubmit}
            disabled={!canSubmit || isGameComplete}
          >
            Submit {canSubmit ? '✓' : ''}
          </button>
          {isGameComplete && (
            <button 
              className="btn btn-primary"
              onClick={handlePlayAgain}
            >
              Play Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default WordCheck; 