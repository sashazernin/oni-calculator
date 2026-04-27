import type { CSSProperties, ImgHTMLAttributes } from "react";

const assetUrlByPath = import.meta.glob("../../game-data/assets/**/*", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

function getAssetImageUrl(pathRelativeToAssets: string): string {
  const trimmed = pathRelativeToAssets.replace(/^\.?\//, "");
  const key = `../../game-data/assets/${trimmed}`;
  const url = assetUrlByPath[key];
  if (url === undefined) {
    throw new Error(
      `Asset not found: ${key} (available: ${Object.keys(assetUrlByPath).join(", ")})`
    );
  }
  return url;
}

export type AssetImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  pathRelativeToAssets: string;
};

const imgFitStyle: CSSProperties = {
  maxWidth: "100%",
  maxHeight: "100%",
  height: '100%',
  width: '100%',
  objectFit: "contain",
};

export function AssetImage({
  pathRelativeToAssets,
  width,
  height,
  className,
  style,
  alt,
  ...imgRest
}: AssetImageProps) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        ...style,
      }}
    >
      <img
        src={getAssetImageUrl(pathRelativeToAssets)}
        alt={alt}
        style={imgFitStyle}
        {...imgRest}
      />
    </div>
  );
}
