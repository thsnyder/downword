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
    <div className="card bg-base-100 shadow-lg p-4 mb-4">
      <div className="w-full bg-base-300 rounded-full h-2 sm:h-4">
        <div 
          className="bg-accent h-2 sm:h-4 rounded-full transition-all duration-500 shadow-[0_0_10px] shadow-accent/50"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-xs text-center mt-1 text-accent">{progress}% to goal</div>
    </div>
  );
}

export default ScorePanel; 