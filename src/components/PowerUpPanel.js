import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved, faClock } from '@fortawesome/free-solid-svg-icons';
import '../styles/PowerUpPanel.scss';

const PowerUpPanel = ({ shields, maxShields, slowdownActive }) => {
  return (
    <div className="power-up-panel">
      {/* Slow-down Status */}
      <div className="slowdown-status">
        <FontAwesomeIcon 
          icon={faClock} 
          size="2x" 
          color={slowdownActive ? 'blue' : 'gray'} // Blue if active, gray if not
        />
      </div>

      {/* Shield Status */}
      <div className="shield-status">
        {Array.from({ length: maxShields }, (_, i) => (
          <FontAwesomeIcon
            key={i}
            icon={faShieldHalved}
            size="2x"
            color={i < shields ? 'green' : 'gray'} // Green for active shields, gray for inactive
          />
        ))}
      </div>
    </div>
  );
};

export default PowerUpPanel;
