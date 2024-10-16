import React, { useState, useEffect, useRef } from 'react';
import Car from './Car';
import Obstacle from './Obstacle';
import PowerUp from './PowerUp';
import '../styles/Game.scss';

const Game = () => {
  const [carPosition, setCarPosition] = useState(2); // Car starts in the middle lane
  const [obstacles, setObstacles] = useState([]);
  const [powerUps, setPowerUps] = useState([]); // Store power-ups
  const [speed, setSpeed] = useState(2.5);
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // State for pausing the game
  const [lastLane, setLastLane] = useState(null); // Keep track of the last lane
  const [powerUpActive, setPowerUpActive] = useState(false); // Track if a power-up is active

  const animationRef = useRef(null); // To hold requestAnimationFrame reference
  const collisionCheckRef = useRef(null); // Separate reference for collision detection
  const timerIntervalRef = useRef(null); // Reference to hold the interval for the timer
  const speedIncreaseRef = useRef(null); // Reference for speed increase

  // Fetch the high score from localStorage on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('highScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

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

  // Generate obstacles and power-ups at random lanes
  const generateObstacle = () => {
    let randomLane = Math.floor(Math.random() * 5); // 5 lanes
    // Ensure the new lane is different from the last lane
    while (randomLane === lastLane) {
      randomLane = Math.floor(Math.random() * 5);
    }
    setLastLane(randomLane); // Update the last lane
    setObstacles((prev) => [...prev, { lane: randomLane, yPos: 0 }]);

    // Generate a power-up with a 10% chance, ensuring it doesn't overlap with obstacles
    if (Math.random() < 0.1 && !powerUpActive) {
      const safeLanes = [0, 1, 2, 3, 4].filter(lane => {
        // Ensure no obstacle is in the same lane and not too close (both horizontally and vertically)
        return !obstacles.some(obstacle => obstacle.lane === lane && Math.abs(obstacle.yPos) < 200);
      });

      if (safeLanes.length > 0) {
        const randomSafeLane = safeLanes[Math.floor(Math.random() * safeLanes.length)];
        setPowerUps((prev) => [...prev, { lane: randomSafeLane, yPos: 0 }]);
      }
    }
  };

  useEffect(() => {
    if (!isGameOver && !isPaused) {
      const obstacleInterval = setInterval(generateObstacle, 1000); // Obstacles appear every second
      return () => clearInterval(obstacleInterval);
    }
  }, [isGameOver, isPaused, lastLane, powerUpActive]);

  // Move obstacles and power-ups downward with `requestAnimationFrame`
  const moveObjects = () => {
    setObstacles((prev) =>
      prev.map((obstacle) => ({ ...obstacle, yPos: obstacle.yPos + speed }))
    );

    // Move power-ups at half the speed of obstacles
    setPowerUps((prev) =>
      prev.map((powerUp) => ({ ...powerUp, yPos: powerUp.yPos + speed / 2 }))
    );

    // Continue the animation loop
    if (!isGameOver && !isPaused) {
      animationRef.current = requestAnimationFrame(moveObjects);
    }
  };

  useEffect(() => {
    if (!isGameOver && !isPaused) {
      animationRef.current = requestAnimationFrame(moveObjects);
    }

    return () => cancelAnimationFrame(animationRef.current); // Clean up animation on unmount
  }, [speed, isGameOver, isPaused]);

  // Slow down effect when power-up is collected
  const handleSlowDown = () => {
    setPowerUpActive(true); // Disable further power-up spawns

    const prePowerUpSpeed = speed; // Save the speed before slowing down
    const reducedSpeed = prePowerUpSpeed / 2; // Halve the current speed
    setSpeed(reducedSpeed); // Slow down to 50% of the current speed
    clearInterval(speedIncreaseRef.current); // Temporarily stop default speed increase

    setTimeout(() => {
      // Ramp back up to 75% of the original speed after 5 seconds
      let currentSpeed = reducedSpeed;
      const rampTargetSpeed = prePowerUpSpeed * 0.75; // 75% of the original speed
      const speedUpInterval = setInterval(() => {
        currentSpeed += (rampTargetSpeed - reducedSpeed) / 10; // Ramp up over 5 seconds
        setSpeed(currentSpeed);
        if (currentSpeed >= rampTargetSpeed) {
          clearInterval(speedUpInterval); // Stop ramp-up once 75% speed is reached

          // Resume normal speed increase after ramp-up is done
          speedIncreaseRef.current = setInterval(() => {
            setSpeed((prevSpeed) => prevSpeed + 0.25); // Increase speed by +0.25 every second
          }, 1000);

          // After another 2.5 seconds, allow power-ups to spawn again
          setTimeout(() => {
            setPowerUpActive(false); // Re-enable power-up spawning after the total 12.5 seconds
          }, 2500);
        }
      }, 500); // Speed ramp over 5 seconds
    }, 5000); // Stay slow for 5 seconds
  };

  // Collision detection logic for obstacles and power-ups
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
        cancelAnimationFrame(animationRef.current); // Stop movement loop
        cancelAnimationFrame(collisionCheckRef.current); // Stop collision detection loop
        clearInterval(timerIntervalRef.current); // Stop the timer
        clearInterval(speedIncreaseRef.current); // Stop speed increase
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('highScore', score); // Save high score to localStorage
        }
      }
    });

    // Collision detection for power-ups
    powerUps.forEach((powerUp, index) => {
      const carTop = window.innerHeight - 120;
      const carBottom = window.innerHeight - 20;
      const powerUpTop = powerUp.yPos;
      const powerUpBottom = powerUp.yPos + 50;
      const isInSameLane = powerUp.lane === carPosition;
      const isOverlapping = powerUpBottom > carTop && powerUpTop < carBottom;

      if (isInSameLane && isOverlapping) {
        handleSlowDown(); // Trigger slow down effect
        setPowerUps((prev) => prev.filter((_, i) => i !== index)); // Remove power-up after collision
      }
    });

    if (!isGameOver && !isPaused) {
      collisionCheckRef.current = requestAnimationFrame(checkCollision);
    }
  };

  useEffect(() => {
    if (!isGameOver && !isPaused) {
      collisionCheckRef.current = requestAnimationFrame(checkCollision);
    }

    return () => cancelAnimationFrame(collisionCheckRef.current); // Clean up collision detection on unmount
  }, [obstacles, carPosition, powerUps, isGameOver, isPaused]);

  // Default speed increase by +0.25 every second
  useEffect(() => {
    if (!isGameOver && !isPaused) {
      speedIncreaseRef.current = setInterval(() => {
        setSpeed((prevSpeed) => prevSpeed + 0.25);
      }, 1000);
    }

    return () => clearInterval(speedIncreaseRef.current); // Clean up speed increase interval on unmount
  }, [isGameOver, isPaused]);

  // Reset game
  const resetGame = () => {
    // Stop any ongoing animation loops
    cancelAnimationFrame(animationRef.current);
    cancelAnimationFrame(collisionCheckRef.current);
    clearInterval(timerIntervalRef.current);
    clearInterval(speedIncreaseRef.current); // Stop speed increase on reset

    // Reset all states
    setIsGameOver(false);
    setCarPosition(2); // Reset car to middle lane
    setObstacles([]);
    setPowerUps([]); // Reset power-ups
    setScore(0); // Reset score
    setTimer(0); // Reset timer
    setSpeed(2.5); // Slowed down initial speed
    setLastLane(null); // Reset the last lane

    // Restart the game loop after resetting
    animationRef.current = requestAnimationFrame(moveObjects);
    collisionCheckRef.current = requestAnimationFrame(checkCollision);
    timerIntervalRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
      setScore((prev) => prev + 10);
    }, 1000);

    // Resume speed increase after reset
    speedIncreaseRef.current = setInterval(() => {
      setSpeed((prevSpeed) => prevSpeed + 0.25);
    }, 1000);
  };

  // Clear high score
  const clearHighScore = () => {
    setHighScore(0);
    localStorage.removeItem('highScore');
  };

  // Pause/Resume game
  const togglePause = () => {
    setIsPaused((prevPaused) => !prevPaused);
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
        {powerUps.map((powerUp, index) => (
          <PowerUp key={index} lane={powerUp.lane} yPos={powerUp.yPos} />
        ))}
      </div>

      <div className="game-info">
        <p>
          <span>TIME:</span>
          <span>{timer}</span>
        </p>
        <p>
          <span>SCORE:</span>
          <span>{score}</span>
        </p>
        <p>
          <span>HIGH SCORE:</span>
          <span>{highScore}</span>
        </p>
        <button className="clear-high-score" onClick={clearHighScore}>
          Clear High Score
        </button>
        <button className="pause-button" onClick={togglePause}>
          {isPaused ? 'Resume' : 'Pause'}
        </button>
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
