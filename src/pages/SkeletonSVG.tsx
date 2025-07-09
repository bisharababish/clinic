import React from 'react';

interface SkeletonSVGProps {
  selectedBodyPart: string;
  onBodyPartSelect: (bodyPart: string) => void;
  width?: number;
  height?: number;
  className?: string;
}

const bodyParts = [
  { key: "skull", label: "Skull" },
  { key: "spine", label: "Spine" },
  { key: "shoulder", label: "Shoulders" },
  { key: "chest", label: "Chest" },
  { key: "pelvis", label: "Pelvis" },
  { key: "hips", label: "Hips" },
  { key: "femurs", label: "Thighs" },
  { key: "knees", label: "Knees" },
  { key: "lower-legs", label: "Lower Legs" },
  { key: "ankles", label: "Ankles" },
  { key: "feet", label: "Feet" },
  { key: "humerus", label: "Upper Arms" },
  { key: "elbows", label: "Elbows" },
  { key: "forearms", label: "Forearms" },
  { key: "wrists", label: "Wrists" },
  { key: "hands", label: "Hands" },
];

const SkeletonSVG: React.FC<SkeletonSVGProps> = ({ 
  selectedBodyPart,
  onBodyPartSelect,
  width = 300, 
  height = 600, 
  className = "" 
}) => {
  const boneColor = "#F5E6D3";
  const boneStroke = "#D4C5A9";
  const selectedColor = "#3B82F6";
  const hoverColor = "#60A5FA";
  const strokeWidth = 1.5;

  const getBodyPartColor = (bodyPart: string) => {
    return selectedBodyPart === bodyPart ? selectedColor : boneColor;
  };

  const getBodyPartStroke = (bodyPart: string) => {
    return selectedBodyPart === bodyPart ? "#1D4ED8" : boneStroke;
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-700 mb-6 text-center">
        Select Body Part
      </h3>
      
      {/* Detailed Anatomical Skeleton SVG */}
      <div className="flex justify-center mb-6">
        <svg 
          width={width} 
          height={height} 
          viewBox="0 0 400 700" 
          className={`${className} max-w-full h-auto`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="boneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F8F0E3" />
              <stop offset="50%" stopColor="#F5E6D3" />
              <stop offset="100%" stopColor="#E8D5B7" />
            </linearGradient>
            <radialGradient id="jointGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F0E6D2" />
              <stop offset="100%" stopColor="#E8D5B7" />
            </radialGradient>
          </defs>
          
          {/* Background */}
          <rect width="100%" height="100%" fill="#FAFAFA" />
          
          {/* SKULL */}
          <g 
            id="skull-group" 
            className="cursor-pointer transition-all duration-200 hover:opacity-80"
            onClick={() => onBodyPartSelect('skull')}
          >
            {/* Main skull dome */}
            <ellipse 
              cx="200" 
              cy="60" 
              rx="45" 
              ry="40" 
              fill={getBodyPartColor('skull')} 
              stroke={getBodyPartStroke('skull')} 
              strokeWidth={selectedBodyPart === 'skull' ? strokeWidth + 1 : strokeWidth}
            />
            
            {/* Frontal bone ridges */}
            <path 
              d="M 170 45 Q 185 35 200 35 Q 215 35 230 45" 
              fill="none" 
              stroke={boneStroke} 
              strokeWidth="1"
            />
            
            {/* Eye sockets */}
            <ellipse cx="185" cy="55" rx="8" ry="10" fill="#2D2D2D" />
            <ellipse cx="215" cy="55" rx="8" ry="10" fill="#2D2D2D" />
            
            {/* Nasal cavity */}
            <path d="M 200 60 L 195 75 L 205 75 Z" fill="#2D2D2D" />
            
            {/* Maxilla (upper jaw) */}
            <ellipse 
              cx="200" 
              cy="85" 
              rx="25" 
              ry="10" 
              fill={getBodyPartColor('skull')} 
              stroke={getBodyPartStroke('skull')} 
              strokeWidth={selectedBodyPart === 'skull' ? strokeWidth + 1 : strokeWidth}
            />
            
            {/* Mandible (lower jaw) */}
            <path 
              d="M 180 90 Q 200 100 220 90 Q 220 95 200 98 Q 180 95 180 90 Z" 
              fill={getBodyPartColor('skull')} 
              stroke={getBodyPartStroke('skull')} 
              strokeWidth={selectedBodyPart === 'skull' ? strokeWidth + 1 : strokeWidth}
            />
          </g>

          {/* CERVICAL SPINE (Neck vertebrae) */}
          <g 
            id="cervical-spine"
            className="cursor-pointer transition-all duration-200 hover:opacity-80"
            onClick={() => onBodyPartSelect('spine')}
          >
            {Array.from({ length: 7 }, (_, i) => (
              <ellipse 
                key={`cervical-${i}`}
                cx="200" 
                cy={105 + i * 6} 
                rx="3" 
                ry="4" 
                fill={getBodyPartColor('spine')} 
                stroke={getBodyPartStroke('spine')} 
                strokeWidth={selectedBodyPart === 'spine' ? strokeWidth + 0.5 : 0.8}
              />
            ))}
          </g>

          {/* CLAVICLES (Collar bones) */}
          <g 
            id="clavicles"
            className="cursor-pointer transition-all duration-200 hover:opacity-80"
            onClick={() => onBodyPartSelect('shoulder')}
          >
            <ellipse 
              cx="160" 
              cy="150" 
              rx="35" 
              ry="6" 
              fill={getBodyPartColor('shoulder')} 
              stroke={getBodyPartStroke('shoulder')} 
              strokeWidth={selectedBodyPart === 'shoulder' ? strokeWidth + 1 : strokeWidth}
              transform="rotate(-10 160 150)"
            />
            <ellipse 
              cx="240" 
              cy="150" 
              rx="35" 
              ry="6" 
              fill={getBodyPartColor('shoulder')} 
              stroke={getBodyPartStroke('shoulder')} 
              strokeWidth={selectedBodyPart === 'shoulder' ? strokeWidth + 1 : strokeWidth}
              transform="rotate(10 240 150)"
            />
          </g>

          {/* SCAPULAE (Shoulder blades) */}
          <g 
            id="scapulae"
            className="cursor-pointer transition-all duration-200 hover:opacity-80"
            onClick={() => onBodyPartSelect('shoulder')}
          >
            <path 
              d="M 140 160 L 120 180 L 125 200 L 145 185 Z" 
              fill={getBodyPartColor('shoulder')} 
              stroke={getBodyPartStroke('shoulder')} 
              strokeWidth={selectedBodyPart === 'shoulder' ? strokeWidth + 1 : strokeWidth}
            />
            <path 
              d="M 260 160 L 280 180 L 275 200 L 255 185 Z" 
              fill={getBodyPartColor('shoulder')} 
              stroke={getBodyPartStroke('shoulder')} 
              strokeWidth={selectedBodyPart === 'shoulder' ? strokeWidth + 1 : strokeWidth}
            />
          </g>

          {/* STERNUM */}
          <g 
            id="sternum"
            className="cursor-pointer transition-all duration-200 hover:opacity-80"
            onClick={() => onBodyPartSelect('chest')}
          >
            <rect 
              x="195" 
              y="150" 
              width="10" 
              height="80" 
              rx="5" 
              fill={getBodyPartColor('chest')} 
              stroke={getBodyPartStroke('chest')} 
              strokeWidth={selectedBodyPart === 'chest' ? strokeWidth + 1 : strokeWidth}
            />
          </g>

          {/* RIBCAGE */}
          <g 
            id="ribcage"
            className="cursor-pointer transition-all duration-200 hover:opacity-80"
            onClick={() => onBodyPartSelect('chest')}
          >
            {Array.from({ length: 12 }, (_, i) => {
              const y = 160 + i * 12;
              const width = 50 + i * 2;
              const height = 8 + i * 0.5;
              return (
                <g key={`rib-${i}`}>
                  {/* Left rib */}
                  <ellipse 
                    cx={150 - width/4} 
                    cy={y} 
                    rx={width/2} 
                    ry={height} 
                    fill="none" 
                    stroke={getBodyPartStroke('chest')} 
                    strokeWidth={selectedBodyPart === 'chest' ? 3 : 2}
                    transform={`rotate(-15 ${150 - width/4} ${y})`}
                  />
                  {/* Right rib */}
                  <ellipse 
                    cx={250 + width/4} 
                    cy={y} 
                    rx={width/2} 
                    ry={height} 
                    fill="none" 
                    stroke={getBodyPartStroke('chest')} 
                    strokeWidth={selectedBodyPart === 'chest' ? 3 : 2}
                    transform={`rotate(15 ${250 + width/4} ${y})`}
                  />
                </g>
              );
            })}
          </g>

          {/* THORACIC SPINE */}
          <g id="thoracic-spine">
            {Array.from({ length: 12 }, (_, i) => (
              <ellipse 
                key={`thoracic-${i}`}
                cx="200" 
                cy={155 + i * 12} 
                rx="4" 
                ry="5" 
                fill="url(#boneGradient)" 
                stroke={boneStroke} 
                strokeWidth="1"
              />
            ))}
          </g>

          {/* HUMERUS (Upper arm bones) */}
          <g id="humerus">
            {/* Left humerus */}
            <ellipse 
              cx="120" 
              cy="220" 
              rx="8" 
              ry="50" 
              fill="url(#boneGradient)" 
              stroke={boneStroke} 
              strokeWidth={strokeWidth}
            />
            {/* Left humeral head */}
            <circle 
              cx="120" 
              cy="170" 
              r="12" 
              fill="url(#jointGradient)" 
              stroke={boneStroke} 
              strokeWidth={strokeWidth}
            />
            
            {/* Right humerus */}
            <ellipse 
              cx="280" 
              cy="220" 
              rx="8" 
              ry="50" 
              fill="url(#boneGradient)" 
              stroke={boneStroke} 
              strokeWidth={strokeWidth}
            />
            {/* Right humeral head */}
            <circle 
              cx="280" 
              cy="170" 
              r="12" 
              fill="url(#jointGradient)" 
              stroke={boneStroke} 
              strokeWidth={strokeWidth}
            />
          </g>

          {/* ELBOW JOINTS */}
          <g id="elbows">
            <circle 
              cx="120" 
              cy="270" 
              r="10" 
              fill="url(#jointGradient)" 
              stroke={boneStroke} 
              strokeWidth={strokeWidth}
            />
            <circle 
              cx="280" 
              cy="270" 
              r="10" 
              fill="url(#jointGradient)" 
              stroke={boneStroke} 
              strokeWidth={strokeWidth}
            />
          </g>

          {/* RADIUS AND ULNA (Forearm bones) */}
          <g id="forearms">
            {/* Left radius */}
            <ellipse 
              cx="115" 
              cy="320" 
              rx="5" 
              ry="40" 
              fill="url(#boneGradient)" 
              stroke={boneStroke} 
              strokeWidth={strokeWidth}
            />
            {/* Left ulna */}
            <ellipse 
              cx="125" 
              cy="320" 
              rx="5" 
              ry="42" 
              fill="url(#boneGradient)" 
              stroke={boneStroke} 
              strokeWidth={strokeWidth}
            />
            
            {/* Right radius */}
            <ellipse 
              cx="285" 
              cy="320" 
              rx="5" 
              ry="40" 
              fill="url(#boneGradient)" 
              stroke={boneStroke} 
              strokeWidth={strokeWidth}
            />
            {/* Right ulna */}
            <ellipse 
              cx="275" 
              cy="320" 
              rx="5" 
              ry="42" 
              fill="url(#boneGradient)" 
              stroke={boneStroke} 
              strokeWidth={strokeWidth}
            />
          </g>

          {/* WRISTS */}
          <g id="wrists">
            <rect 
              x="110" 
              y="360" 
              width="20" 
              height="12" 
              rx="6" 
              fill="url(#jointGradient)" 
              stroke={boneStroke} 
              strokeWidth={strokeWidth}
            />
            <rect 
              x="270" 
              y="360" 
              width="20" 
              height="12" 
              rx="6" 
              fill="url(#jointGradient)" 
              stroke={boneStroke} 
              strokeWidth={strokeWidth}
            />
          </g>

          {/* HANDS */}
          <g id="hands">
            {/* Left hand */}
            <g>
              {/* Palm */}
              <ellipse 
                cx="120" 
                cy="385" 
                rx="12" 
                ry="18" 
                fill="url(#boneGradient)" 
                stroke={boneStroke} 
                strokeWidth={strokeWidth}
              />
              {/* Fingers */}
              {Array.from({ length: 5 }, (_, i) => {
                const x = 108 + i * 6;
                const length = i === 0 ? 15 : i === 2 ? 25 : 20;
                return (
                  <rect 
                    key={`left-finger-${i}`}
                    x={x} 
                    y="400" 
                    width="3" 
                    height={length} 
                    rx="1.5" 
                    fill="url(#boneGradient)" 
                    stroke={boneStroke} 
                    strokeWidth="0.8"
                  />
                );
              })}
            </g>
            
            {/* Right hand */}
            <g>
              {/* Palm */}
              <ellipse 
                cx="280" 
                cy="385" 
                rx="12" 
                ry="18" 
                fill="url(#boneGradient)" 
                stroke={boneStroke} 
                strokeWidth={strokeWidth}
              />
              {/* Fingers */}
              {Array.from({ length: 5 }, (_, i) => {
                const x = 268 + i * 6;
                const length = i === 0 ? 15 : i === 2 ? 25 : 20;
                return (
                  <rect 
                    key={`right-finger-${i}`}
                    x={x} 
                    y="400" 
                    width="3" 
                    height={length} 
                    rx="1.5" 
                    fill="url(#boneGradient)" 
                    stroke={boneStroke} 
                    strokeWidth="0.8"
                  />
                );
              })}
            </g>
          </g>

          {/* LUMBAR SPINE */}
          <g id="lumbar-spine">
            {Array.from({ length: 5 }, (_, i) => (
              <ellipse 
                key={`lumbar-${i}`}
                cx="200" 
                cy={300 + i * 15} 
                rx="6" 
                ry="7" 
                fill="url(#boneGradient)" 
                stroke={boneStroke} 
                strokeWidth="1"
              />
            ))}
          </g>

          {/* PELVIS */}
          <g id="pelvis">
            {/* Iliac crests */}
            <ellipse 
              cx="200" 
              cy="380" 
              rx="60" 
              ry="25" 
              fill="url(#boneGradient)" 
              stroke={boneStroke} 
              strokeWidth={strokeWidth}
            />
            {/* Sacrum */}
            <path 
              d="M 190 390 Q 200 400 210 390 Q 210 410 200 415 Q 190 410 190 390 Z" 
              fill="url(#boneGradient)" 
              stroke={boneStroke} 
              strokeWidth={strokeWidth}
            />
          </g>

          {/* HIP JOINTS */}
          <g id="hips">
            <circle 
              cx="170" 
              cy="400" 
              r="15" 
              fill="url(#jointGradient)" 
              stroke={boneStroke} 
              strokeWidth={strokeWidth}
            />
            <circle 
              cx="230" 
              cy="400" 
              r="15" 
              fill="url(#jointGradient)" 
              stroke={boneStroke} 
              strokeWidth={strokeWidth}
            />
          </g>

          {/* FEMURS (Thigh bones) */}
          <g id="femurs">
            {/* Left femur */}
            <ellipse 
              cx="170" 
              cy="480" 
              rx="10" 
              ry="65" 
              fill="url(#boneGradient)" 
              stroke={boneStroke} 
              strokeWidth={strokeWidth}
            />
            {/* Right femur */}
            <ellipse 
              cx="230" 
              cy="480" 
              rx="10" 
              ry="65" 
              fill="url(#boneGradient)" 
              stroke={boneStroke} 
              strokeWidth={strokeWidth}
            />
          </g>

          {/* KNEE JOINTS */}
          <g id="knees">
            {/* Left patella */}
            <ellipse 
              cx="170" 
              cy="545" 
              rx="8" 
              ry="12" 
              fill="url(#jointGradient)" 
              stroke={boneStroke} 
              strokeWidth={strokeWidth}
            />
            {/* Right patella */}
            <ellipse 
              cx="230" 
              cy="545" 
              rx="8" 
              ry="12" 
              fill="url(#jointGradient)" 
              stroke={boneStroke} 
              strokeWidth={strokeWidth}
            />
          </g>

          {/* TIBIA AND FIBULA (Lower leg bones) */}
          <g id="lower-legs">
            {/* Left tibia */}
            <ellipse 
              cx="170" 
              cy="600" 
              rx="8" 
              ry="45" 
              fill="url(#boneGradient)" 
              stroke={boneStroke} 
              strokeWidth={strokeWidth}
            />
            {/* Left fibula */}
            <ellipse 
              cx="180" 
              cy="605" 
              rx="4" 
              ry="40" 
              fill="url(#boneGradient)" 
              stroke={boneStroke} 
              strokeWidth={strokeWidth}
            />
            
            {/* Right tibia */}
            <ellipse 
              cx="230" 
              cy="600" 
              rx="8" 
              ry="45" 
              fill="url(#boneGradient)" 
              stroke={boneStroke} 
              strokeWidth={strokeWidth}
            />
            {/* Right fibula */}
            <ellipse 
              cx="220" 
              cy="605" 
              rx="4" 
              ry="40" 
              fill="url(#boneGradient)" 
              stroke={boneStroke} 
              strokeWidth={strokeWidth}
            />
          </g>

          {/* ANKLE JOINTS */}
          <g id="ankles">
            <circle 
              cx="170" 
              cy="645" 
              r="8" 
              fill="url(#jointGradient)" 
              stroke={boneStroke} 
              strokeWidth={strokeWidth}
            />
            <circle 
              cx="230" 
              cy="645" 
              r="8" 
              fill="url(#jointGradient)" 
              stroke={boneStroke} 
              strokeWidth={strokeWidth}
            />
          </g>

          {/* FEET */}
          <g id="feet">
            {/* Left foot */}
            <ellipse 
              cx="165" 
              cy="665" 
              rx="25" 
              ry="12" 
              fill="url(#boneGradient)" 
              stroke={boneStroke} 
              strokeWidth={strokeWidth}
            />
            {/* Left toes */}
            {Array.from({ length: 5 }, (_, i) => (
              <ellipse 
                key={`left-toe-${i}`}
                cx={145 + i * 8} 
                cy="675" 
                rx="3" 
                ry="6" 
                fill="url(#boneGradient)" 
                stroke={boneStroke} 
                strokeWidth="0.8"
              />
            ))}
            
            {/* Right foot */}
            <ellipse 
              cx="235" 
              cy="665" 
              rx="25" 
              ry="12" 
              fill="url(#boneGradient)" 
              stroke={boneStroke} 
              strokeWidth={strokeWidth}
            />
            {/* Right toes */}
            {Array.from({ length: 5 }, (_, i) => (
              <ellipse 
                key={`right-toe-${i}`}
                cx={215 + i * 8} 
                cy="675" 
                rx="3" 
                ry="6" 
                fill="url(#boneGradient)" 
                stroke={boneStroke} 
                strokeWidth="0.8"
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Body Part Buttons Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {bodyParts.map((part) => (
          <button
            key={part.key}
            onClick={() => onBodyPartSelect(part.key)}
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedBodyPart === part.key
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:border-blue-300"
            }`}
          >
            {part.label}
          </button>
        ))}
      </div>

      {selectedBodyPart && (
        <div className="mt-4 text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            Selected: {bodyParts.find(p => p.key === selectedBodyPart)?.label || selectedBodyPart}
          </span>
        </div>
      )}
    </div>
  );
};

export default SkeletonSVG;