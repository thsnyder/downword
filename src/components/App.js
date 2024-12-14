import React, { useState } from 'react';
import Header from './Header';
import Board from './Board';
import LetterBank from './LetterBank';
import WordCheck from './WordCheck';
import Modal from './Modal';
import { getRandomLetters } from '../data/letterPool';

const BOARD_SIZE = 15;

function createEmptyBoard() {
  return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
}

function App() {
  const [board, setBoard] = useState(createEmptyBoard());
  const [startPosition] = useState({ row: 0, col: 0 });
  const [goalPosition] = useState({ row: BOARD_SIZE - 1, col: BOARD_SIZE - 1 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStats, setGameStats] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [invalidCells, setInvalidCells] = useState([]);
  const [availableLetters, setAvailableLetters] = useState(getRandomLetters());

  const handleLetterPlaced = (row, col, letter) => {
    const newBoard = [...board];
    newBoard[row][col] = letter;
    setBoard(newBoard);
  };

  const handleLetterRemoved = (row, col) => {
    const newBoard = [...board];
    newBoard[row][col] = null;
    setBoard(newBoard);
  };

  const handleLetterDragged = (letter) => {
    setAvailableLetters(prev => prev.filter(l => l !== letter));
  };

  const handleLetterDropped = (letter) => {
    setAvailableLetters(prev => [...prev, letter]);
  };

  const handleWordSubmit = (word, score, cells, foundWords) => {
    setGameStats({
      score,
      foundWords
    });
    setIsGameOver(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Header />
      <div className="space-y-4">
        <Board
          board={board}
          onLetterPlaced={handleLetterPlaced}
          onLetterRemoved={handleLetterRemoved}
          startPosition={startPosition}
          goalPosition={goalPosition}
          highlightedCells={invalidCells}
        />
        <LetterBank
          letters={availableLetters}
          onLetterDragged={handleLetterDragged}
          onLetterDropped={handleLetterDropped}
        />
        <WordCheck
          board={board}
          onWordSubmit={handleWordSubmit}
          goalPosition={goalPosition}
          startPosition={startPosition}
          onInvalidCells={setInvalidCells}
        />
      </div>

      {showInstructions && (
        <Modal
          title="How to Play"
          onClose={() => setShowInstructions(false)}
          showCloseButton={true}
        >
          <div className="space-y-4">
            <p>Create a path of words from START to GOAL:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Drag letters from the bank to create words on the board</li>
              <li>Words must be at least 2 letters long</li>
              <li>Letters must connect (including diagonally)</li>
              <li>Every letter in your path must be part of a valid word</li>
              <li>Click Submit when you've created a valid path!</li>
            </ol>
          </div>
        </Modal>
      )}

      {isGameOver && gameStats && (
        <Modal
          title="Game Complete!"
          onClose={() => setIsGameOver(false)}
          showCloseButton={false}
        >
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Final Score: {gameStats.score}</h3>
            <div className="space-y-2">
              <h4 className="font-semibold">Words Found:</h4>
              <ul className="list-disc list-inside">
                {gameStats.foundWords.map(({ word, score }, index) => (
                  <li key={index}>
                    {word} ({score} points)
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default App; 