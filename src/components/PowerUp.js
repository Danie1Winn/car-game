import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStopwatch, faShieldHalved } from '@fortawesome/free-solid-svg-icons'; // Import icons
import '../styles/Game.scss';

const PowerUp = ({ lane, yPos, type }) => {
  const laneWidth = 100 / 5;
  const leftPosition = `${lane * laneWidth + laneWidth / 2}%`;

  let icon;
  let color;

  if (type === 'slow') {
    icon = faStopwatch;
    color = 'blue';
  } else if (type === 'shield') {
    icon = faShieldHalved;
    color = 'green';
  }

  return (
    <div
      className="power-up"
      style={{
        top: `${yPos}px`,
        left: leftPosition,
        transform: 'translateX(-50%)',
      }}
    >
      <FontAwesomeIcon icon={icon} size="2x" color={color} />
    </div>
  );
};

export default PowerUp;
