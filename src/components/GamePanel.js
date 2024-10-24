import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import '../styles/GamePanel.scss';

const GamePanel = ({ timer, score, highScore, isPaused, clearHighScore, togglePause }) => {
  return (
    <div className="game-panel">
      <div className="game-buttons">
        <button className="clear-high-score" onClick={clearHighScore}>
          Clear High Score
        </button>
        <button className="pause-button" onClick={togglePause}>
          {isPaused ? <FontAwesomeIcon icon={faPlay} /> : <FontAwesomeIcon icon={faPause} />}
        </button>
      </div>
      <p>
        <span>TIME: </span>
        <span>{timer}</span>
      </p>
      <p>
        <span>SCORE: </span>
        <span>{score}</span>
      </p>
      <p>
        <span>HIGH SCORE: </span>
        <span>{highScore}</span>
      </p>
    </div>
  );
};

export default GamePanel;
