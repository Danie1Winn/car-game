import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar } from '@fortawesome/free-solid-svg-icons';

const Obstacle = ({ lane, yPos, speedMultiplier }) => {
  const [color, setColor] = useState('#000');
  const [obstacleSpeed, setObstacleSpeed] = useState(0);

  useEffect(() => {
    const generateRandomColor = () => {
      const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      setColor(randomColor);
    };

    const generateRandomSpeed = () => {
      const randomSpeed = speedMultiplier * (0.75 + Math.random() * 0.5);
      setObstacleSpeed(randomSpeed);
    };

    generateRandomColor();
    generateRandomSpeed();
  }, [speedMultiplier]);

  const laneWidth = 100 / 5;
  const leftPosition = `${lane * laneWidth + laneWidth / 2}%`;

  return (
    <div
      className="obstacle"
      style={{
        top: `${yPos}px`,
        left: leftPosition,
        transform: 'translateX(-50%)',
        transition: `top ${obstacleSpeed}s linear`,
      }}
    >
      <FontAwesomeIcon
        icon={faCar}
        size="5x"
        color={color}
        style={{
          textShadow: '0 0 3px #fff, 0 0 5px #fff',
        }}
      />
    </div>
  );
};

export default Obstacle;
