import React from 'react';

function ScorePanel({ board, startPosition, goalPosition }) {
  // Calculate progress based on the lowest letter's position
  const calculateProgress = () => {
    if (!board) return 0;
    
    let lowestRow = startPosition.row;
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const cell = board[row][col];
        if (cell) {
          lowestRow = Math.max(lowestRow, row);
        }
      }
    }

    const totalDistance = goalPosition.row - startPosition.row;
    const currentProgress = lowestRow - startPosition.row;
    return Math.round((currentProgress / totalDistance) * 100);
  };

  const progress = calculateProgress();

  return (
    <div className="card bg-base-100 shadow-lg border border-base-300 p-4 sm:p-5 mb-3 sm:mb-4 rounded-2xl">
      <div className="w-full bg-base-200 rounded-full h-3 sm:h-4 overflow-hidden">
        <div 
          className="bg-primary h-3 sm:h-4 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-sm text-center mt-3 font-semibold text-base-content/70">
        {progress}% to goal
      </div>
    </div>
  );
}

export default ScorePanel; 