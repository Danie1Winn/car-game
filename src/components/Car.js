import React from 'react';
import '../styles/Game.scss';
import redCarImage from '../assets/images/red-car.png';

const Car = () => {
  return (
    <div className="car">
      <img src={redCarImage} alt="Car" className="car-image" />
    </div>
  );
};

export default Car;
