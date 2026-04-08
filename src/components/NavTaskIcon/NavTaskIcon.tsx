import type { FC, ImgHTMLAttributes } from "react";
import { NavtaskLogoNew } from "../../assets";

interface NavtaskIconProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "width" | "height"
> {
  width?: number | string;
  height?: number | string;
  color?: string;
}

const NavtaskIcon: FC<NavtaskIconProps> = ({
  width = 32,
  height = 32,
  color,
  ...props
}) => (
  <img
    src={NavtaskLogoNew}
    alt="NavTask"
    width={width}
    height={height}
    style={{
      display: "block",
      objectFit: "contain",
      ...(color ? { color } : {}),
      ...props.style,
    }}
    {...props}
  />
);

export default NavtaskIcon;
