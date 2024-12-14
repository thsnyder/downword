import React from 'react';
import { getWordScore } from '../utils/dictionary';

function Modal({ type, score, words = [], onClose }) {
  const getModalContent = () => {
    switch (type) {
      case 'instructions':
        return {
          title: "How to Play DownWord",
          content: (
            <div className="space-y-4">
              <p>Create words to reach the goal!</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Drag letters from the keyboard to the board</li>
                <li>Form words horizontally or vertically</li>
                <li>Words must be at least 2 letters long</li>
                <li>Connect letters from the start square to the goal square</li>
                <li>Click Submit when you've reached the goal</li>
              </ul>
              <p className="font-bold">Scoring:</p>
              <ul className="list-disc list-inside">
                <li>1 point per letter</li>
                <li>+3 bonus for 5+ letter words</li>
                <li>+5 bonus for 7+ letter words</li>
                <li>+8 bonus for 9+ letter words</li>
              </ul>
            </div>
          )
        };
      case 'gameOver':
        // Calculate stats
        const wordLengths = words.map(w => w.length);
        const stats = {
          longest: wordLengths.length ? Math.max(...wordLengths) : 0,
          avgLength: wordLengths.length ? (wordLengths.reduce((a, b) => a + b, 0) / wordLengths.length).toFixed(1) : 0
        };

        return {
          title: "Game Complete!",
          content: (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary mb-2">{score}</p>
                <p className="text-xl opacity-75">Final Score</p>
              </div>
              
              <div className="divider"></div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-secondary">{words.length}</p>
                  <p className="text-sm opacity-75">Words Found</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-secondary">{stats.longest}</p>
                  <p className="text-sm opacity-75">Longest Word</p>
                </div>
              </div>

              <div className="divider">Words</div>
              
              <div className="max-h-48 overflow-y-auto">
                <ul className="space-y-2">
                  {words.map((word, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span className="font-mono">{word}</span>
                      <span className="text-sm opacity-75">{getWordScore(word)} pts</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                className="btn btn-primary w-full"
                onClick={() => window.location.reload()}
              >
                Play Again
              </button>
            </div>
          )
        };
      default:
        return { title: "", content: null };
    }
  };

  const { title, content } = getModalContent();

  return (
    <div className="modal modal-open">
      <div className="modal-box relative">
        <button
          className="btn btn-sm btn-circle absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>
        <h3 className="font-bold text-lg mb-4">{title}</h3>
        {content}
      </div>
    </div>
  );
}

export default Modal; 