interface ThinkingAnimationProps {
  className?: string;
  style?: React.CSSProperties;
  size?: "sm" | "md" | "lg";
}

const ThinkingTextAnimation: React.FC<ThinkingAnimationProps> = ({
  className = "",
  style,
  size = "md",
  ...props
}) => {
  const sizeConfig = {
    sm: { width: 80, height: 20, fontSize: 12, y: 14 },
    md: { width: 100, height: 24, fontSize: 14, y: 16 },
    lg: { width: 120, height: 28, fontSize: 16, y: 18 },
  };

  const config = sizeConfig[size];

  return (
    <svg
      width={config.width}
      height={config.height}
      viewBox={`0 0 ${config.width} ${config.height}`}
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      style={style}
      {...props}
    >
      <defs>
        <linearGradient id="shine-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="20%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="80%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        <mask id="shine-mask">
          <rect
            x={-config.width}
            y="0"
            width={config.width * 0.3}
            height={config.height}
            fill="url(#shine-gradient)"
          >
            <animate
              attributeName="x"
              values={`${-config.width * 0.5};${config.width * 1.2};${
                -config.width * 0.5
              }`}
              dur="2.5s"
              repeatCount="indefinite"
            />
          </rect>
        </mask>
      </defs>

      {/* Base text */}
      <text
        x="50%"
        y={config.y}
        textAnchor="middle"
        fontSize={config.fontSize}
        fill="#474747"
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
        className="opacity-80"
      >
        Thinking...
      </text>

      {/* Shine overlay */}
      <text
        x="50%"
        y={config.y}
        textAnchor="middle"
        fontSize={config.fontSize}
        fill="#ffffff"
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
        mask="url(#shine-mask)"
        className="drop-shadow-sm"
      >
        Thinking...
      </text>
    </svg>
  );
};

export default ThinkingTextAnimation;
