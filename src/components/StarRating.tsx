//Projekt ITU - Pivní Plánovač
//Autor: Dominik Václavík

import React, { useState } from "react";
import './StarRating.css'

interface StarRatingProps {
  initialRating?: number;
  onRatingChange: (rating: number) => void; 
}

const StarRating: React.FC<StarRatingProps> = ({ initialRating = 0, onRatingChange }) => {
  const [rating, setRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const handleClick = (value: number) => {
    setRating(value);
    onRatingChange(value);
  };

  const handleMouseEnter = (value: number) => {
    setHoveredRating(value);
  };

  const handleMouseLeave = () => {
    setHoveredRating(null);
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = hoveredRating ? i <= hoveredRating : i <= rating;
      stars.push(
        <span
          key={i}
          className={`star ${isFilled ? "filled" : ""}`}
          onClick={() => handleClick(i)}
          onMouseEnter={() => handleMouseEnter(i)}
          onMouseLeave={handleMouseLeave}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return <div className="star-rating">{renderStars()}</div>;
};

export default StarRating;
