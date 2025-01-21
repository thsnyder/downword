import React, { useState, useEffect } from 'react';
import Board from './components/Board';
import LetterBank from './components/LetterBank';
import WordCheck from './components/WordCheck';
import ScorePanel from './components/ScorePanel';
import Modal from './components/Modal';
import { isValidWord, isDictionaryLoaded } from './utils/dictionary';
import logo from './images/downword-logo.png';

const BOARD_SIZE = 10;
const getRandomColumn = () => Math.floor(Math.random() * BOARD_SIZE);

function App() {
  const [startPosition, setStartPosition] = useState({ row: 0, col: getRandomColumn() });
  const [goalPosition, setGoalPosition] = useState({ row: BOARD_SIZE - 1, col: getRandomColumn() });
  const [gameState, setGameState] = useState({
    score: 0,
    currentWord: '',
    isGameOver: false,
    board: Array(10).fill().map(() => Array(10).fill(null)),
    selectedCells: [],
    words: [],
    highlightedCells: [],
    reachedGoal: false
  });
  const [showModal, setShowModal] = useState('instructions');
  const [selectedCell, setSelectedCell] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Randomize positions when game starts
  useEffect(() => {
    setStartPosition({ row: 0, col: getRandomColumn() });
    setGoalPosition({ row: BOARD_SIZE - 1, col: getRandomColumn() });
  }, []);

  useEffect(() => {
    console.log('Dictionary loaded:', isDictionaryLoaded());
  }, []);

  const checkConnection = (board, start, goal) => {
    // Implement logic to check if there's a valid path from start to goal
    // This is a placeholder function; you'll need to implement the actual pathfinding logic
    return false; // Replace with actual logic
  };

  const handleLetterPlaced = (letter, sourceIndex, rowIndex, colIndex) => {
    setGameState(prev => {
      const newBoard = prev.board.map(row => [...row]);
      newBoard[rowIndex][colIndex] = letter;
      const connectionStatus = checkConnection(newBoard, startPosition, goalPosition);
      setIsConnected(connectionStatus);
      return {
        ...prev,
        board: newBoard
      };
    });
  };

  const handleLetterRemoved = (rowIndex, colIndex) => {
    setGameState(prev => {
      const cell = prev.board[rowIndex][colIndex];
      if (cell) {
        const newBoard = prev.board.map(row => [...row]);
        newBoard[rowIndex][colIndex] = null;
        const connectionStatus = checkConnection(newBoard, startPosition, goalPosition);
        setIsConnected(connectionStatus);
        return {
          ...prev,
          board: newBoard
        };
      }
      return prev;
    });
  };

  const handleWordSubmit = (word, score, cells, foundWords) => {
    setGameState(prev => ({
      ...prev,
      score: score,
      words: foundWords.map(w => w.word),
      isGameOver: true
    }));
    setShowModal('gameOver');
  };

  const handleShare = () => {
    // Create a board representation with emojis
    const boardEmoji = gameState.board.map(row =>
      row.map(cell => cell ? '⬛' : '⬜').join('')
    ).join('\n');

    const message = `DownWord Score: ${gameState.score}\n\n${boardEmoji}\n\nPlay at: https://thsnyder.github.io/downword/`;

    if (navigator.share) {
      navigator.share({
        title: 'DownWord Puzzle',
        text: message
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(message)
        .then(() => alert('Result copied to clipboard!'))
        .catch(console.error);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <header className="navbar bg-base-100 rounded-box shadow-lg mb-8 flex-col sm:flex-row gap-2 sm:gap-0 p-4">
        <div className="flex w-full sm:w-auto justify-between sm:flex-1">
          <img 
            src={logo} 
            alt="DownWord" 
            className="h-8 sm:h-12 w-auto"
          />
          
          <button 
            className="btn btn-ghost btn-sm sm:hidden"
            onClick={() => setShowModal('instructions')}
          >
            ?
          </button>
        </div>
        
        {/* Title - shown on all screens */}
        <div className="flex-1 flex justify-center">
          <h1 className="text-3xl sm:text-4xl font-['Source_Serif_4'] font-bold tracking-wide text-primary">
            DownWord
          </h1>
        </div>
        
        <div className="hidden sm:flex flex-1 justify-end">
          <button 
            className="btn btn-ghost"
            onClick={() => setShowModal('instructions')}
          >
            How to Play
          </button>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-2 sm:px-4">
        <ScorePanel 
          board={gameState.board}
          startPosition={startPosition}
          goalPosition={goalPosition}
        />
        <Board 
          board={gameState.board}
          highlightedCells={gameState.highlightedCells}
          onLetterPlaced={handleLetterPlaced}
          onLetterRemoved={handleLetterRemoved}
          startPosition={startPosition}
          goalPosition={goalPosition}
          selectedCell={selectedCell}
          setSelectedCell={setSelectedCell}
        />
        <LetterBank />
        <WordCheck 
          board={gameState.board}
          onWordSubmit={handleWordSubmit}
          goalPosition={goalPosition}
          startPosition={startPosition}
          isConnected={isConnected}
        />
      </main>

      {showModal && (
        <Modal 
          type={showModal} 
          score={gameState.score}
          words={gameState.words}
          onClose={() => setShowModal(null)}
          onShare={handleShare}
        />
      )}
    </div>
  );
}

export default App; 