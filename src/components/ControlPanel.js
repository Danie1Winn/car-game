import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved, faClock } from '@fortawesome/free-solid-svg-icons';
import '../styles/ControlPanel.scss';

const ControlPanel = ({ isVisible, togglePanel }) => {
  return (
    <div className={`control-panel ${isVisible ? 'visible' : ''}`}>
      <button className="close-button" onClick={togglePanel}>X</button>
      <h2>CONTROLS</h2>
      <ul>
        <li>Move Left: Arrow Left</li>
        <li>Move Right: Arrow Right</li>
        <li>Pause: Space Bar</li>
      </ul>
      <h2>POWER-UP LEGEND</h2>
      <ul>
        <li>
          <FontAwesomeIcon icon={faShieldHalved} />
          <span>Shield: Protects you from one obstacle</span>
        </li>
        <li>
          <FontAwesomeIcon icon={faClock} />
          <span>Slow Down: Slows obstacles for 5 seconds</span>
        </li>
      </ul>
    </div>
  );
};

export default ControlPanel;
