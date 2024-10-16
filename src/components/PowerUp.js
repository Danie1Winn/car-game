import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStopwatch } from '@fortawesome/free-solid-svg-icons'; // Import faStopwatch icon
import '../styles/Game.scss';

const PowerUp = ({ lane, yPos }) => {
  // Calculate the left position based on the lane
  const laneWidth = 100 / 5; // 5 lanes, each 20% of the width
  const leftPosition = `${lane * laneWidth + laneWidth / 2}%`; // Add half lane width to center the power-up

  return (
    <div
      className="power-up"
      style={{
        top: `${yPos}px`, // Set vertical position
        left: leftPosition, // Set horizontal position
        transform: 'translateX(-50%)', // Center the power-up
      }}
    >
      <FontAwesomeIcon icon={faStopwatch} size="2x" color="blue" /> {/* Render the icon */}
    </div>
  );
};

export default PowerUp;
