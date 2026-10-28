import type { CSSProperties } from "react";
import soIconUrl from "../../assets/SO_icon.webp";

type SpaceOutOnlyBadgeProps = {
  size?: number;
  style?: CSSProperties;
};

export default function SpaceOutOnlyBadge({
  size = 28,
  style,
}: SpaceOutOnlyBadgeProps) {
  return (
    <img
      src={soIconUrl}
      alt=""
      aria-hidden
      width={size}
      height={size}
      style={{
        objectFit: "contain",
        flexShrink: 0,
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}
