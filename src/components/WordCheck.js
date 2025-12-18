import React, { useEffect, useState, useCallback } from 'react';
import { isValidWord, getWordScore } from '../utils/dictionary';

function WordCheck({ board, onWordSubmit, goalPosition, startPosition, isConnected, onValidationFeedback }) {
  const [canSubmit, setCanSubmit] = useState(false);
  const [invalidCells, setLocalInvalidCells] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [checkMessage, setCheckMessage] = useState('');
  const [checkMessageType, setCheckMessageType] = useState(null); // 'success' or 'error'

  // Get the path cells from start to goal
  const getPathCells = useCallback((board) => {
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
  }, [startPosition, goalPosition]);

  // Check if there's a path from start to goal
  const hasPathToGoal = useCallback((board) => {
    const path = getPathCells(board);
    return path !== null;
  }, [getPathCells]);


  const findWords = useCallback((board, pathCells) => {
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
  }, []);

  // Check if all path cells are part of valid words
  const validatePath = useCallback((board, pathCells) => {
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
  }, []);

  // Shared validation function used by both "Check Word" and "Submit"
  // Returns validation result without modifying state or submitting
  const validateCurrentPath = useCallback((board) => {
    const pathCells = getPathCells(board);
    if (!pathCells) {
      return {
        valid: false,
        word: '',
        cells: [],
        reason: 'No path found from start to goal',
        foundWords: [],
        invalidCells: [],
        invalidWords: []
      };
    }

    const foundWords = findWords(board, pathCells);
    if (foundWords.length === 0) {
      return {
        valid: false,
        word: '',
        cells: pathCells,
        reason: 'No valid words found in path',
        foundWords: [],
        invalidCells: pathCells.map(cell => ({ row: cell.row, col: cell.col })),
        invalidWords: []
      };
    }

    const { invalidCells, invalidWords } = validatePath(board, pathCells);
    if (invalidCells.length > 0) {
      return {
        valid: false,
        word: '',
        cells: pathCells,
        reason: `Invalid word${invalidWords.length > 1 ? 's' : ''}: ${invalidWords.join(', ')}`,
        foundWords: [],
        invalidCells: invalidCells,
        invalidWords: invalidWords
      };
    }

    // All valid - calculate score
    const totalScore = foundWords.reduce((sum, { score }) => sum + score, 0);
    const allPathCells = pathCells.map(cell => ({ row: cell.row, col: cell.col }));
    
    return {
      valid: true,
      word: foundWords.map(w => w.word).join(', '),
      cells: allPathCells,
      reason: `Valid path! Found ${foundWords.length} word${foundWords.length > 1 ? 's' : ''}: ${foundWords.map(w => w.word).join(', ')}`,
      foundWords: foundWords,
      invalidCells: [],
      invalidWords: [],
      score: totalScore
    };
  }, [getPathCells, findWords, validatePath]);

  // Handle "Check Word" - validates without submitting
  const handleCheckWord = () => {
    const result = validateCurrentPath(board);
    
    // Clear previous check message
    setCheckMessage('');
    setCheckMessageType(null);
    
    // Provide visual feedback via callback
    if (onValidationFeedback) {
      onValidationFeedback({
        valid: result.valid,
        validCells: result.valid ? result.cells : [],
        invalidCells: result.invalidCells
      });
    }
    
    // Show message
    if (result.valid) {
      setCheckMessageType('success');
      setCheckMessage(result.reason);
    } else {
      setCheckMessageType('error');
      setCheckMessage(result.reason);
    }
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setCheckMessage('');
      setCheckMessageType(null);
      if (onValidationFeedback) {
        onValidationFeedback(null); // Clear highlights
      }
    }, 3000);
  };

  const handleSubmit = () => {
    const result = validateCurrentPath(board);
    
    if (!result.valid) {
      // Show error state
      setLocalInvalidCells(result.invalidCells);
      setErrorMessage(result.reason);
      return;
    }

    // Valid - submit the word
    const totalScore = result.score || result.foundWords.reduce((sum, { score }) => sum + score, 0);
    setLocalInvalidCells([]);
    setErrorMessage('');
    setIsGameComplete(true);
    onWordSubmit('', totalScore, [], result.foundWords);
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
  }, [board, goalPosition, startPosition, hasPathToGoal]);

  return (
    <div className="card bg-base-100 shadow-lg border border-base-300 mt-4 p-4 sm:p-5 rounded-2xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex-grow min-w-0 w-full sm:w-auto space-y-2">
          {/* Error message from submit */}
          {invalidCells.length > 0 && (
            <div className="text-error text-sm font-medium bg-error/10 px-3 py-2 rounded-lg border border-error/20 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{errorMessage || "Some letters in your path don't form valid words"}</span>
            </div>
          )}
          {/* Check word feedback message */}
          {checkMessage && (
            <div className={`text-sm font-medium px-3 py-2 rounded-lg border flex items-center gap-2 transition-all duration-300 ${
              checkMessageType === 'success'
                ? 'text-success bg-success/10 border-success/20'
                : 'text-error bg-error/10 border-error/20'
            }`}>
              {checkMessageType === 'success' ? (
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span>{checkMessage}</span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 ml-auto flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Check Word button */}
          <button 
            className={`btn btn-outline btn-info w-full sm:w-auto min-h-[44px] text-base font-semibold rounded-lg transition-all duration-150 ${
              canSubmit && !isGameComplete
                ? 'shadow-sm hover:shadow-md active:scale-95' 
                : 'btn-disabled opacity-50'
            }`}
            onClick={(e) => {
              e.preventDefault();
              if (canSubmit && !isGameComplete) {
                handleCheckWord();
              }
            }}
            disabled={!canSubmit || isGameComplete}
          >
            <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Check Word
          </button>
          {/* Submit button */}
          <button 
            className={`btn w-full sm:w-auto min-h-[44px] text-base font-semibold rounded-lg transition-all duration-150 ${
              canSubmit 
                ? 'btn-success text-white shadow-md hover:shadow-lg active:scale-95' 
                : 'btn-disabled opacity-50'
            }`}
            onClick={(e) => {
              e.preventDefault();
              if (canSubmit && !isGameComplete) {
                handleSubmit();
              }
            }}
            disabled={!canSubmit || isGameComplete}
          >
            {canSubmit ? (
              <>
                <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Submit
              </>
            ) : (
              'Submit'
            )}
          </button>
          {isGameComplete && (
            <button 
              className="btn btn-primary w-full sm:w-auto min-h-[44px] text-base font-semibold rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all duration-150"
              onClick={(e) => {
                e.preventDefault();
                handlePlayAgain();
              }}
            >
              <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Play Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default WordCheck; 