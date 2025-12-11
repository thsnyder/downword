import React from 'react';
import { getWordScore } from '../utils/dictionary';

function Modal({ type, score, words = [], onClose, onShare }) {
  const getModalContent = () => {
    switch (type) {
      case 'instructions':
        return {
          title: "How to Play DownWord",
          content: (
            <div className="space-y-5">
              <p className="text-lg font-semibold text-base-content/80">Create words to reach the goal! 🎯</p>
              <ul className="list-none space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-primary text-xl">✨</span>
                  <span>Tap an empty cell on the board to select it</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary text-xl">✨</span>
                  <span>Tap a letter from the keyboard to place it in the selected cell</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary text-xl">✨</span>
                  <span>Form words horizontally or vertically</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary text-xl">✨</span>
                  <span>Words must be at least 2 letters long</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary text-xl">✨</span>
                  <span>Connect letters from the start square to the goal square</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary text-xl">✨</span>
                  <span>Tap Submit when you've reached the goal</span>
                </li>
              </ul>
              <div className="divider"></div>
              <p className="font-extrabold text-lg bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">Scoring:</p>
              <ul className="list-none space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>1 point per letter</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>+3 bonus for 5+ letter words</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>+5 bonus for 7+ letter words</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>+8 bonus for 9+ letter words</span>
                </li>
              </ul>
              <div className="modal-action">
                <button 
                  className="btn btn-primary w-full min-h-[44px] text-base font-semibold rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all duration-150"
                  onClick={(e) => {
                    e.preventDefault();
                    onClose();
                  }}
                >
                  Let's Play!
                </button>
              </div>
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
                <p className="text-5xl sm:text-6xl font-bold text-primary mb-2">
                  {score}
                </p>
                <p className="text-lg font-medium text-base-content/70">Final Score</p>
              </div>
              
              <div className="divider"></div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-base-200 p-4 rounded-lg border border-base-300">
                  <p className="text-3xl font-bold text-secondary">{words.length}</p>
                  <p className="text-sm font-medium text-base-content/70 mt-1">Words Found</p>
                </div>
                <div className="bg-base-200 p-4 rounded-lg border border-base-300">
                  <p className="text-3xl font-bold text-accent">{stats.longest}</p>
                  <p className="text-sm font-medium text-base-content/70 mt-1">Longest Word</p>
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

              <div className="modal-action">
                <div className="w-full grid grid-cols-2 gap-3">
                  <button 
                    className="btn btn-primary min-h-[44px] text-base font-semibold rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all duration-150"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.reload();
                    }}
                  >
                    Play Again
                  </button>
                  <button 
                    className="btn btn-outline min-h-[44px] text-base font-semibold rounded-lg"
                    onClick={(e) => {
                      e.preventDefault();
                      onShare();
                    }}
                  >
                    Share
                  </button>
                </div>
              </div>
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
      <div className="modal-box relative max-w-[95vw] sm:max-w-md mx-2 sm:mx-auto bg-base-100 shadow-xl border border-base-300 rounded-2xl">
        {type !== 'instructions' && (
          <button 
            className="btn btn-sm btn-circle absolute right-3 top-3 min-w-[36px] min-h-[36px] bg-base-200 hover:bg-error hover:text-error-content transition-all duration-200 hover:scale-110 active:scale-95 shadow-md"
            onClick={(e) => {
              e.preventDefault();
              onClose();
            }}
            aria-label="Close"
          >
            ✕
          </button>
        )}
        
        <h3 className="font-bold text-2xl mb-4 pr-8 text-primary">
          {title}
        </h3>
        {content}
      </div>
    </div>
  );
}

export default Modal; 