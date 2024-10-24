import React from 'react';
import '../styles/GameOver.scss';

const GameOver = ({ resetGame }) => {
  return (
    <div className="game-over">
      <h1>Game Over</h1>
      <button className="game-over-button" onClick={resetGame}>
        Try Again
      </button>
    </div>
  );
};

export default GameOver;
