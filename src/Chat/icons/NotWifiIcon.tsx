import React from "react";

// Define the type for the component's props
interface NotWifiIconProps extends React.SVGProps<SVGSVGElement> {
  color?: string; // Optional color prop
}

const NotWifiIcon: React.FC<NotWifiIconProps> = ({
  color = "#000000", // Default to black if no color is provided
  ...props // Capture any other standard SVG props like className, style, etc.
}) => (
  <svg
    width="22px"
    height="22px"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    // Apply the color prop here for the main SVG element (can act as a fallback)
    color={color}
    {...props} // Spread any other props onto the svg element
  >
    <path
      d="M2.12636 8.32361C1.92567 8.06248 1.97135 7.71868 2.21158 7.53482C5.2903 5.17827 8.55286 4 11.9993 4C15.4457 4 18.7082 5.17827 21.7869 7.53482C22.0388 7.74708 22.0676 8.09272 21.8722 8.32367L12.4174 19.4967C12.3978 19.5199 12.3763 19.5414 12.3531 19.561C12.1222 19.7564 11.7765 19.7276 11.5811 19.4967L2.12636 8.32361Z"
      stroke={color} // Use the color prop for the stroke
      strokeWidth="1.5"
    />
    <path
      d="M12 8V10"
      stroke={color} // Use the color prop for the stroke
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 14.01L12.01 13.9989"
      stroke={color} // Use the color prop for the stroke
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default NotWifiIcon;
