import React from "react";

interface KeysIconProps extends React.SVGProps<SVGSVGElement> {
  color?: string; // Optional color prop
}

const KeysIcon: React.FC<KeysIconProps> = ({
  color = "#000000", // Default color to black if none is provided
  ...props // Capture any other standard SVG props like className, style, etc.
}) => (
  <svg
    width="22px"
    height="22px"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    // Apply the color prop here for the main SVG element (can be a fallback)
    color={color}
    {...props} // Spread any other props onto the svg element
  >
    <path
      d="M10 12C10 14.2091 8.20914 16 6 16C3.79086 16 2 14.2091 2 12C2 9.79086 3.79086 8 6 8C8.20914 8 10 9.79086 10 12ZM10 12H22V15"
      stroke={color} // Use the color prop for the stroke
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 12V15"
      stroke={color} // Use the color prop for the stroke
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default KeysIcon;
