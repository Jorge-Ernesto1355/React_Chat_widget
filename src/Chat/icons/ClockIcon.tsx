import React from "react";

// Define the types for the component's props
interface ClockIconProps extends React.SVGProps<SVGSVGElement> {
  color?: string; // We're adding an optional color prop
}

const ClockIcon: React.FC<ClockIconProps> = ({
  color = "#000000", // Set a default color (black) if none is provided
  ...props // This collects any other standard SVG properties like 'className', 'style', etc.
}) => (
  <svg
    width="22px"
    height="22px"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    // The 'color' prop on the <svg> tag acts as a general currentColor for its children
    // but we'll also apply it directly to strokes for explicit control.
    color={color}
    {...props} // Spread any other incoming props onto the SVG element
  >
    <path
      d="M12 6L12 12L18 12"
      stroke={color} // Use the 'color' prop for the stroke
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      stroke={color} // Use the 'color' prop for the stroke
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default ClockIcon;
