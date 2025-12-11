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
  const [soundEnabled, setSoundEnabled] = useState(true);

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
    // Play placement sound if enabled
    if (soundEnabled) {
      // Simple beep using Web Audio API (lightweight)
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      } catch (e) {
        // Silently fail if audio context not available
      }
    }
    
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
    <div className="min-h-screen p-2 sm:p-4 bg-base-200">
      <header className="navbar bg-base-100 rounded-xl shadow-md border border-base-300 mb-4 sm:mb-6 flex-col sm:flex-row gap-2 sm:gap-0 p-3 sm:p-4">
        <div className="flex w-full sm:w-auto justify-between sm:flex-1 items-center">
          <img 
            src={logo} 
            alt="DownWord" 
            className="h-8 sm:h-10 w-auto"
          />
          
          <div className="flex items-center gap-2 sm:hidden">
            <button 
              className="btn btn-circle btn-ghost btn-sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              aria-label="Toggle sound"
            >
              {soundEnabled ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              )}
            </button>
            <button 
              className="btn btn-circle btn-ghost btn-sm"
              onClick={() => setShowModal('instructions')}
              aria-label="How to play"
            >
              <span className="text-lg font-bold">?</span>
            </button>
          </div>
        </div>
        
        {/* Title - shown on all screens */}
        <div className="flex-1 flex justify-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-['Source_Serif_4'] font-bold tracking-wide text-primary">
            DownWord
          </h1>
        </div>
        
        <div className="hidden sm:flex flex-1 justify-end items-center gap-2">
          <button 
            className="btn btn-circle btn-ghost btn-sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-label="Toggle sound"
          >
            {soundEnabled ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
          </button>
          <button 
            className="btn btn-ghost btn-sm"
            onClick={() => setShowModal('instructions')}
          >
            <span className="font-medium text-sm">How to Play</span>
          </button>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-1 sm:px-2 md:px-4 w-full space-y-4">
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
        <LetterBank 
          selectedCell={selectedCell}
          onLetterPlaced={handleLetterPlaced}
        />
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