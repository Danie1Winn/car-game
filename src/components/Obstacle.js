import React from 'react';
import '../styles/Game.scss';

const Obstacle = ({ lane, yPos }) => {
  // Calculate the left position based on the lane
  const laneWidth = 100 / 5; // 5 lanes, each 20% of the width
  const leftPosition = `${lane * laneWidth + laneWidth / 2}%`; // Add half lane width to center the obstacle

  return (
    <div
      className="obstacle"
      style={{
        top: `${yPos}px`, // Set vertical position
        left: leftPosition, // Set horizontal position
        transform: 'translateX(-50%)', // Center the obstacle
      }}
    ></div>
  );
};

export default Obstacle;
