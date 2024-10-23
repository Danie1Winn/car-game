import React, { useState, useEffect, useRef } from 'react';
import Car from './Car';
import Obstacle from './Obstacle';
import PowerUp from './PowerUp';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved, faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import '../styles/Game.scss';

const Game = () => {
  const initialSpeed = 2;
  const maxSpeed = 5;
  const speedIncrement = 0.1;
  const maxShields = 3;

  const [speed, setSpeed] = useState(initialSpeed);
  const [carPosition, setCarPosition] = useState(2); // Starting in the center lane
  const [obstacles, setObstacles] = useState([]);
  const [powerUps, setPowerUps] = useState([]);
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lastLane, setLastLane] = useState(null);
  const [powerUpActive, setPowerUpActive] = useState(false);
  const [shields, setShields] = useState(0);
  const [collisionCooldown, setCollisionCooldown] = useState(false);

  const animationRef = useRef(null);
  const collisionCheckRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const speedIncreaseRef = useRef(null);

  useEffect(() => {
    const savedHighScore = localStorage.getItem('highScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  const handleKeyDown = (e) => {
    if (isPaused) return;
    if (e.key === 'ArrowLeft') {
      setCarPosition((prev) => Math.max(0, prev - 1));
    } else if (e.key === 'ArrowRight') {
      setCarPosition((prev) => Math.min(4, prev + 1));
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused]);

  const generateObstacle = () => {
    let randomLane = Math.floor(Math.random() * 5);
    while (randomLane === lastLane) {
      randomLane = Math.floor(Math.random() * 5);
    }
    setLastLane(randomLane);
    setObstacles((prev) => [...prev, { lane: randomLane, yPos: 0 }]);

    if (Math.random() < 0.1 && !powerUpActive) {
      const powerUpLane = Math.floor(Math.random() * 5);
      const powerUpType = Math.random() < 0.5 ? 'slow' : 'shield';
      setPowerUps((prev) => [...prev, { lane: powerUpLane, yPos: 0, type: powerUpType }]);
    }
  };

  useEffect(() => {
    if (!isGameOver && !isPaused) {
      const obstacleInterval = setInterval(generateObstacle, 1000);
      return () => clearInterval(obstacleInterval);
    }
  }, [isGameOver, isPaused, lastLane, powerUpActive]);

  const moveObjects = () => {
    setObstacles((prev) => prev.map((obstacle) => ({ ...obstacle, yPos: obstacle.yPos + speed })));
    setPowerUps((prev) => prev.map((powerUp) => ({ ...powerUp, yPos: powerUp.yPos + speed / 2 })));

    if (!isGameOver && !isPaused) {
      animationRef.current = requestAnimationFrame(moveObjects);
    }
  };

  useEffect(() => {
    if (!isGameOver && !isPaused) {
      animationRef.current = requestAnimationFrame(moveObjects);
    }
    return () => cancelAnimationFrame(animationRef.current);
  }, [speed, isGameOver, isPaused]);

  const handleSlowDown = () => {
    setPowerUpActive(true);
    const prePowerUpSpeed = speed;
    const reducedSpeed = prePowerUpSpeed / 2;
    setSpeed(reducedSpeed);
    clearInterval(speedIncreaseRef.current);
    setTimeout(() => {
      let currentSpeed = reducedSpeed;
      const rampTargetSpeed = prePowerUpSpeed * 0.75;
      const speedUpInterval = setInterval(() => {
        currentSpeed += (rampTargetSpeed - reducedSpeed) / 10;
        setSpeed(currentSpeed);
        if (currentSpeed >= rampTargetSpeed) {
          clearInterval(speedUpInterval);
          speedIncreaseRef.current = setInterval(() => {
            setSpeed((prevSpeed) => prevSpeed + 0.5);
          }, 1000);
          setTimeout(() => {
            setPowerUpActive(false);
          }, 2500);
        }
      }, 500);
    }, 5000);
  };

  const checkCollision = () => {
    if (collisionCooldown) return;
    obstacles.forEach((obstacle) => {
      const carTop = window.innerHeight - 120;
      const carBottom = window.innerHeight - 20;
      const obstacleTop = obstacle.yPos;
      const obstacleBottom = obstacle.yPos + 50;
      const carLeft = carPosition * (window.innerWidth / 5);
      const carRight = carLeft + 50;
      const obstacleLeft = obstacle.lane * (window.innerWidth / 5);
      const obstacleRight = obstacleLeft + 50;
      const isInSameLane = obstacle.lane === carPosition;
      const isOverlappingVertical = obstacleBottom > carTop && obstacleTop < carBottom;
      const isOverlappingHorizontal = carLeft < obstacleRight && carRight > obstacleLeft;

      if (isInSameLane && isOverlappingVertical && isOverlappingHorizontal) {
        if (shields > 0) {
          setShields((prevShields) => prevShields - 1);
          setCollisionCooldown(true);
          setTimeout(() => setCollisionCooldown(false), 500);
        } else {
          setIsGameOver(true);
          cancelAnimationFrame(animationRef.current);
          cancelAnimationFrame(collisionCheckRef.current);
          clearInterval(timerIntervalRef.current);
          clearInterval(speedIncreaseRef.current);
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('highScore', score);
          }
        }
      }
    });

    powerUps.forEach((powerUp, index) => {
      const carTop = window.innerHeight - 120;
      const carBottom = window.innerHeight - 20;
      const powerUpTop = powerUp.yPos;
      const powerUpBottom = powerUp.yPos + 50;
      const carLeft = carPosition * (window.innerWidth / 5);
      const carRight = carLeft + 50;
      const powerUpLeft = powerUp.lane * (window.innerWidth / 5);
      const powerUpRight = powerUpLeft + 50;
      const isInSameLane = powerUp.lane === carPosition;
      const isOverlappingVertical = powerUpBottom > carTop && powerUpTop < carBottom;
      const isOverlappingHorizontal = carLeft < powerUpRight && carRight > powerUpLeft;

      if (isInSameLane && isOverlappingVertical && isOverlappingHorizontal) {
        if (powerUp.type === 'slow') {
          handleSlowDown();
        } else if (powerUp.type === 'shield') {
          if (shields < maxShields) {
            setShields((prevShields) => Math.min(prevShields + 1, maxShields));
          }
        }
        setPowerUps((prev) => prev.filter((_, i) => i !== index));
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
    return () => cancelAnimationFrame(collisionCheckRef.current);
  }, [obstacles, carPosition, powerUps, isGameOver, isPaused]);

  useEffect(() => {
    if (!isGameOver && !isPaused) {
      speedIncreaseRef.current = setInterval(() => {
        setSpeed((prevSpeed) => Math.min(prevSpeed + speedIncrement, maxSpeed));
      }, 1000);
    }
    return () => clearInterval(speedIncreaseRef.current);
  }, [isGameOver, isPaused]);

  useEffect(() => {
    if (!isGameOver && !isPaused) {
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
        setScore((prev) => prev + 10);
      }, 1000);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [isGameOver, isPaused]);

  const resetGame = () => {
    cancelAnimationFrame(animationRef.current);
    cancelAnimationFrame(collisionCheckRef.current);
    clearInterval(timerIntervalRef.current);
    clearInterval(speedIncreaseRef.current);

    setIsGameOver(false);
    setCarPosition(2);
    setObstacles([]);
    setPowerUps([]);
    setScore(0);
    setTimer(0);
    setSpeed(initialSpeed);
    setLastLane(null);
    setShields(0);
    setCollisionCooldown(false);

    animationRef.current = requestAnimationFrame(moveObjects);
    collisionCheckRef.current = requestAnimationFrame(checkCollision);
    timerIntervalRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
      setScore((prev) => prev + 10);
    }, 1000);
  };

  const clearHighScore = () => {
    setHighScore(0);
    localStorage.removeItem('highScore');
  };

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
          <PowerUp key={index} lane={powerUp.lane} yPos={powerUp.yPos} type={powerUp.type} />
        ))}
      </div>

      <div className="game-info">
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

      <div className="shield-status">
        {Array.from({ length: maxShields }, (_, i) => (
          <FontAwesomeIcon
            key={i}
            icon={faShieldHalved}
            size="2x"
            color={i < shields ? 'green' : 'gray'}
            style={{ marginRight: '10px' }}
          />
        ))}
      </div>

      {isGameOver && (
        <div className="game-over">
          <h1>Game Over</h1>
          <button className="game-over-button" onClick={resetGame}>Try Again</button>
        </div>
      )}
    </div>
  );
};

export default Game;
