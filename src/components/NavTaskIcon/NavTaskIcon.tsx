import type { FC, SVGProps } from "react";

const TasklyIcon: FC<SVGProps<SVGSVGElement>> = ({
  width = 32,
  height = 32,
  color = "currentColor",
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    width={width}
    height={height}
    fill={color}
    {...props}
  >
    {/* Left vertical bar */}
    <rect x="8" y="8" width="18" height="84" />

    {/* Diagonal - top half (top-left to middle) */}
    <polygon points="26,8 44,8 56,42 38,42" />

    {/* Diagonal - bottom half (middle to bottom-right) */}
    <polygon points="44,58 62,58 74,92 56,92" />

    {/* Right vertical bar */}
    <rect x="74" y="8" width="18" height="84" />
  </svg>
);

export default TasklyIcon;