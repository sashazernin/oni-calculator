import type { CSSProperties, SVGProps } from "react";

export type DupeIconProps = Omit<SVGProps<SVGSVGElement>, "width" | "height"> & {
  size?: number | string;
};

function sizeToCssLength(size: number | string | undefined, fallback: string): string {
  if (size === undefined) return fallback;
  return typeof size === "number" ? `${size}px` : size;
}

export function DupeIcon({ className, style, size, ...rest }: DupeIconProps) {
  const h = sizeToCssLength(size, "24px");

  const VIEW_BOX_X = 7.49;
  const VIEW_BOX_Y = 4.29;
  const VIEW_BOX_W = 68.78;
  const VIEW_BOX_H = 118.36;
  const VIEW_BOX_STR = `${VIEW_BOX_X} ${VIEW_BOX_Y} ${VIEW_BOX_W} ${VIEW_BOX_H}`;

  const merged: CSSProperties = {
    display: "block",
    height: h,
    width: "auto",
    aspectRatio: `${VIEW_BOX_W} / ${VIEW_BOX_H}`,
    flexShrink: 0,
    overflow: "visible",
    ...style,
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={VIEW_BOX_STR}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={merged}
      aria-hidden
      {...rest}
    >
      <g
        transform="translate(0,126) scale(0.1,-0.1)"
        fill="currentColor"
        stroke="none"
      >
        <path d="M357 1199 c-10 -6 -38 -12 -61 -14 -62 -4 -173 -59 -197 -98 -20 -32 -20 -57 -9 -242 1 -11 -2 -33 -5 -48 -6 -22 -2 -34 15 -53 13 -13 33 -24 45 -24 17 0 65 -46 65 -63 0 -2 -23 -27 -51 -55 -42 -42 -50 -56 -44 -74 4 -13 12 -41 19 -63 16 -55 23 -65 52 -65 30 0 74 41 74 69 0 11 -11 28 -25 37 -33 21 -32 35 6 63 25 19 33 21 40 10 5 -8 9 -19 9 -25 0 -6 11 -37 25 -68 32 -71 32 -126 1 -218 -62 -188 -67 -220 -33 -226 29 -6 44 15 57 81 7 34 17 76 23 94 10 29 12 31 31 17 11 -8 40 -14 64 -14 l44 0 -4 -88 c-3 -84 -2 -87 19 -90 32 -5 43 31 43 140 0 75 4 97 21 125 19 31 21 45 17 121 -3 48 -13 106 -23 130 -10 24 -15 46 -11 49 3 4 23 2 44 -3 l37 -9 -3 -59 c-3 -67 11 -85 64 -86 49 0 57 17 43 97 -6 37 -16 74 -22 81 -17 21 -83 52 -111 52 -34 0 -40 14 -16 35 17 15 20 31 20 99 0 45 -6 110 -14 146 -7 36 -11 82 -8 103 4 33 0 42 -33 73 -21 19 -56 40 -81 46 -24 7 -44 16 -44 20 0 12 -62 9 -83 -3z" />
      </g>
    </svg>
  );
}
