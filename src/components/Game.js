import React, { useState, useEffect } from 'react';
import Car from './Car';
import Obstacle from './Obstacle';
import '../styles/Game.scss';

const Game = () => {
  const [carPosition, setCarPosition] = useState(2); // Car starts in the middle lane
  const [obstacles, setObstacles] = useState([]);
  const [speed, setSpeed] = useState(15); // Initial movement speed (pixels moved per tick)
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  // Car movement with arrow keys
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      setCarPosition((prev) => Math.max(0, prev - 1));
    } else if (e.key === 'ArrowRight') {
      setCarPosition((prev) => Math.min(4, prev + 1));
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Generate obstacles at random lanes
  useEffect(() => {
    const generateObstacle = () => {
      const randomLane = Math.floor(Math.random() * 5); // 5 lanes
      setObstacles((prev) => [...prev, { lane: randomLane, yPos: 0 }]);
    };

    if (!isGameOver) {
      const obstacleInterval = setInterval(generateObstacle, 1000); // Obstacles appear every second
      return () => clearInterval(obstacleInterval);
    }
  }, [isGameOver]);

  // Move obstacles downward with increasing speed
  useEffect(() => {
    const moveObstacles = () => {
      setObstacles((prev) =>
        prev.map((obstacle) => ({ ...obstacle, yPos: obstacle.yPos + speed }))
      );
    };

    if (!isGameOver) {
      const movementInterval = setInterval(moveObstacles, 100); // Movement tick interval
      return () => clearInterval(movementInterval);
    }
  }, [speed, isGameOver]);

  // Timer and score logic
  useEffect(() => {
    if (!isGameOver) {
      const gameTimer = setInterval(() => {
        setTimer((prev) => prev + 1); // Increment timer every second
        setScore((prev) => prev + 10); // Increase score by 10 every second

        // Increase movement speed every second
        setSpeed((prevSpeed) => prevSpeed + 0.5); // Increase downward speed over time
      }, 1000); // Timer increments every second

      return () => clearInterval(gameTimer);
    }
  }, [isGameOver]);

  // High score logic
  useEffect(() => {
    const savedHighScore = localStorage.getItem('highScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('highScore', score); // Save high score to localStorage
    }
  }, [score, highScore]);

  // Collision detection logic
  useEffect(() => {
    const checkCollision = () => {
      obstacles.forEach((obstacle) => {
        const carTop = window.innerHeight - 120;
        const carBottom = window.innerHeight - 20;
        const obstacleTop = obstacle.yPos;
        const obstacleBottom = obstacle.yPos + 50;
        const isInSameLane = obstacle.lane === carPosition;
        const isOverlapping = obstacleBottom > carTop && obstacleTop < carBottom;

        if (isInSameLane && isOverlapping) {
          setIsGameOver(true);
        }
      });
    };

    if (!isGameOver) {
      const collisionCheck = setInterval(checkCollision, 50);
      return () => clearInterval(collisionCheck);
    }
  }, [obstacles, carPosition, isGameOver]);

  // Reset game
  const resetGame = () => {
    setIsGameOver(false);
    setCarPosition(2); // Reset car to middle lane
    setObstacles([]);
    setScore(0);       // Reset score
    setTimer(0);       // Reset timer
    setSpeed(10);      // Reset speed to initial value
  };

  return (
    <div className="game-container">
      <div className="road">
        {Array.from({ length: 5 }, (_, lane) => (
          <div key={lane} className="lane">
            {carPosition === lane && <Car />}
          </div>
        ))}
        {obstacles.map((obstacle, index) => (
          <Obstacle key={index} lane={obstacle.lane} yPos={obstacle.yPos} />
        ))}
      </div>

      <div className="game-info">
        <p>Time: {timer}</p>
        <p>Score: {score}</p>
        <p>High Score: {highScore}</p>
      </div>

      {isGameOver && (
        <div className="game-over">
          <h1>Game Over</h1>
          <button onClick={resetGame}>Try Again</button>
        </div>
      )}
    </div>
  );
};

export default Game;
