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

  // Randomize positions when game starts
  useEffect(() => {
    setStartPosition({ row: 0, col: getRandomColumn() });
    setGoalPosition({ row: BOARD_SIZE - 1, col: getRandomColumn() });
  }, []);

  useEffect(() => {
    console.log('Dictionary loaded:', isDictionaryLoaded());
  }, []);

  const handleLetterPlaced = (letter, sourceIndex, rowIndex, colIndex) => {
    setGameState(prev => {
      const newBoard = prev.board.map(row => [...row]);
      newBoard[rowIndex][colIndex] = letter;
      return {
        ...prev,
        board: newBoard
      };
    });
  };

  const handleLetterRemoved = (rowIndex, colIndex) => {
    setGameState(prev => {
      const cell = prev.board[rowIndex][colIndex];
      // Only remove if cell exists
      if (cell) {
        const newBoard = prev.board.map(row => [...row]);
        newBoard[rowIndex][colIndex] = null;
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

  return (
    <div className="min-h-screen p-4">
      <header className="navbar bg-base-100 rounded-box shadow-lg mb-8">
        <div className="flex-1">
          <img 
            src={logo} 
            alt="DownWord" 
            className="h-10 sm:h-12 w-auto"
          />
        </div>
        
        {/* Center title - desktop only */}
        <div className="flex-1 hidden sm:flex justify-center">
          <h1 className="text-4xl font-['Source_Serif_4'] font-bold tracking-wide text-primary">
            DownWord
          </h1>
        </div>
        
        <div className="flex-1 flex justify-end">
          <button 
            className="btn btn-ghost"
            onClick={() => setShowModal('instructions')}
          >
            How to Play
          </button>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto">
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
        />
        <LetterBank />
        <WordCheck 
          board={gameState.board}
          onWordSubmit={handleWordSubmit}
          goalPosition={goalPosition}
          startPosition={startPosition}
        />
      </main>

      {showModal && (
        <Modal 
          type={showModal} 
          score={gameState.score}
          words={gameState.words}
          onClose={() => setShowModal(null)}
        />
      )}
    </div>
  );
}

export default App; 