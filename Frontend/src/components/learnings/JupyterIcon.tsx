import React from "react";

interface JupyterIconProps {
  className?: string;
}

export function JupyterIcon({ className = "h-5 w-5" }: JupyterIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Jupyter Notebook"
    >
      {/* Top crescent arc in classic Jupyter orange */}
      <path
        d="M6.8 4.2C9.8 2.5 14.2 2.5 17.2 4.2C18.1 4.7 18.5 5.7 18.1 6.5C17.6 7.2 16.6 7.4 15.8 7.0C13.6 5.8 10.4 5.8 8.2 7.0C7.4 7.4 6.4 7.2 5.9 6.5C5.5 5.7 5.9 4.7 6.8 4.2Z"
        fill="#F37626"
      />
      {/* Upper orbit satellite dot */}
      <circle cx="17.6" cy="8.2" r="1.3" fill="#F37626" />
      {/* Center grey ring planet */}
      <circle cx="12" cy="12" r="3.2" fill="#767677" />
      {/* Lower orbit satellite dot */}
      <circle cx="6.4" cy="15.8" r="1.3" fill="#F37626" />
      {/* Bottom crescent arc in classic Jupyter orange */}
      <path
        d="M17.2 19.8C14.2 21.5 9.8 21.5 6.8 19.8C5.9 19.3 5.5 18.3 5.9 17.5C6.4 16.8 7.4 16.6 8.2 17.0C10.4 18.2 13.6 18.2 15.8 17.0C16.6 16.6 17.6 16.8 18.1 17.5C18.5 18.3 18.1 19.3 17.2 19.8Z"
        fill="#F37626"
      />
    </svg>
  );
}
