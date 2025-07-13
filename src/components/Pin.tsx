import React from "react";

interface PinProps {
  onHover?: () => void;
}

/**
 * Small red pin used on the plan.
 * Logs to console when hovered to demonstrate hover capability.
 */
export default function Pin({ onHover }: PinProps) {
  return (
    <div
      id="pin"
      className="w-5 h-5 bg-red-600 rounded-full border-2 border-white shadow-lg"
      onMouseEnter={onHover}
    />
  );
}
