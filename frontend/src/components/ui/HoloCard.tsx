import React, { useRef, useState } from 'react';
import './HoloCard.css';

interface HoloCardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}

const HoloCard: React.FC<HoloCardProps> = ({ children, className = '', id, style: externalStyle }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element
    const y = e.clientY - rect.top;  // y position within the element

    // Calculate rotation (-4deg to 4deg max tilt)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = -((y - centerY) / centerY) * 4; 
    const rotateY = ((x - centerX) / centerX) * 4;

    setStyle({
      '--mouse-x': `${x}px`,
      '--mouse-y': `${y}px`,
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`,
      transition: 'none', // Remove transition while moving for instant response
    } as React.CSSProperties);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    // Smooth return to resting state
    setStyle({
      transform: `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
      '--mouse-x': `50%`,
      '--mouse-y': `50%`,
    } as React.CSSProperties);
  };

  return (
    <div
      id={id}
      ref={cardRef}
      className={`holo-card-wrapper ${isHovering ? 'hovering' : ''} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ ...externalStyle, ...style }}
    >
      {/* The background glow effect */}
      <div className="holo-card-glow" />
      {/* The actual content */}
      <div className="holo-card-content">
        {children}
      </div>
    </div>
  );
};

export default HoloCard;
