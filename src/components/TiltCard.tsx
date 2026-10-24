import React, { useRef, useState, useCallback } from "react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // Maximum tilt angle in degrees (default 10)
  scale?: number; // Scale on hover (default 1.025)
  glowColor?: string; // Glare reflection color
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  style?: React.CSSProperties;
}

export default function TiltCard({
  children,
  className = "",
  maxTilt = 9,
  scale = 1.02,
  glowColor = "rgba(212, 175, 55, 0.18)",
  onClick,
  style = {}
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Normalized coordinates (-0.5 to 0.5)
    const normalizedX = (e.clientX - rect.left) / width - 0.5;
    const normalizedY = (e.clientY - rect.top) / height - 0.5;

    // Tilt degrees
    const rotateX = normalizedY * -maxTilt;
    const rotateY = normalizedX * maxTilt;

    setTilt({ x: rotateX, y: rotateY });
    setGlare({
      x: ((e.clientX - rect.left) / width) * 100,
      y: ((e.clientY - rect.top) / height) * 100,
      opacity: 1
    });
  }, [maxTilt]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setGlare(prev => ({ ...prev, opacity: 0 }));
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: "1000px",
        ...style
      }}
      className={`relative transform-gpu ${className}`}
    >
      <div
        style={{
          transform: isHovered
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${scale}, ${scale}, ${scale})`
            : "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
          transition: isHovered
            ? "transform 0.08s ease-out, box-shadow 0.25s ease-out"
            : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease",
          transformStyle: "preserve-3d"
        }}
        className="w-full h-full relative"
      >
        {children}

        {/* 3D Dynamic Specular Light Glare Overlay */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            pointerEvents: "none",
            background: `radial-gradient(circle 280px at ${glare.x}% ${glare.y}%, ${glowColor} 0%, transparent 75%)`,
            opacity: glare.opacity,
            transition: "opacity 0.3s ease",
            zIndex: 30,
            mixBlendMode: "screen"
          }}
        />
      </div>
    </div>
  );
}
