import {
  cloneElement,
  useCallback,
  useContext,
  useMemo,
  useState,
  type CSSProperties,
  type ReactElement,
} from "react";
import "./game-item-info-popup.css";
import type { GameNode } from "../../types/game-data-types";
import { Popup } from "../popup/Popup";
import { AssetImage } from "../asset-image/AssetImage";
import { ThemeContext } from "../../providers/app-theme-provider";
import { getQualityData } from "../../helpers/qualityData";

function getGameNodeTypeLabel(type: GameNode["type"]): string {
  switch (type) {
    case "food":
      return "Food";
    case "ingredient":
      return "Ingredient";
    case "liquid":
      return "Liquid";
    case "plant":
      return "Plant";
    case "resourse":
      return "Resource";
    case "kitchen-tool":
      return "Kitchen tool";
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

export interface GameItemInfoPopupProps {
  item: GameNode;
  children: React.ReactNode;
  style?: CSSProperties;
  cursor?: CSSProperties["cursor"];
  pointerBackground?: boolean;
}

export default function GameItemInfoPopup({ item, children, style, cursor = "pointer", pointerBackground }: GameItemInfoPopupProps) {
  const { colors } = useContext(ThemeContext);
  const [open, setOpen] = useState(false);

  const onClose = useCallback(() => {
    setOpen(false);
  }, []);

  const onOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const popup = useMemo(() => {
    const hasQuality = "quality" in item && item.quality !== undefined;
    const qualityData = hasQuality ? getQualityData(item.quality) : undefined;

    const mutedLabel = `color-mix(in srgb, ${colors.text.primary} 52%, ${colors.background.paper})`;
    const qTint =
      hasQuality && qualityData && qualityData.color !== "inherit"
        ? qualityData.color
        : colors.primary.main;

    const typeLabel = getGameNodeTypeLabel(item.type);

    return (
      <Popup variant="fit-content" closeButton open={open} onClose={onClose} title={item.name}>
        <div style={{ padding: 16, minWidth: "min(312px, 85vw)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 16 }}>
            <div
              style={{
                flexShrink: 0,
                width: 80,
                height: 80,
                borderRadius: "50%",
                padding: 4,
                background: colors.background.average,
                border: `1px solid ${colors.border.main}`,
                boxShadow:
                  `${colors.shadow.default}, inset 0 1px 0 color-mix(in srgb, ${colors.text.primary} 8%, transparent)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
              }}
            >
              <AssetImage
                pathRelativeToAssets={item.image}
                alt={item.name}
                width={55}
                height={55}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: mutedLabel,
                  marginBottom: 6,
                }}
              >
                Type
              </div>
              <span
                style={{
                  display: "inline-block",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  lineHeight: 1.35,
                  color: colors.text.primary,
                  padding: "4px 10px",
                  borderRadius: 8,
                  background: `color-mix(in srgb, ${colors.primary.main} 10%, ${colors.background.paper})`,
                  border: `1px solid ${colors.border.main}`,
                }}
              >
                {typeLabel}
              </span>
            </div>
            {hasQuality && qualityData ? (
              <div>
                <div
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: mutedLabel,
                    marginBottom: 6,
                  }}
                >
                  Quality
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                    maxWidth: "100%",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      lineHeight: 1.35,
                      color:
                        qualityData.color !== "inherit" ? qualityData.color : colors.text.primary,
                      padding: "4px 10px",
                      borderRadius: 8,
                      background: `color-mix(in srgb, ${qTint} 14%, ${colors.background.paper})`,
                      border: `1px solid color-mix(in srgb, ${qTint} 35%, ${colors.border.main})`,
                    }}
                  >
                    {qualityData.name}
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 500,
                        fontVariantNumeric: "tabular-nums",
                        marginLeft: 4,
                      }}
                    >
                      ({item.quality})
                    </span>
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Popup>
    );
  }, [open, onClose, item, colors]);

  return (
    <>
      {popup}
      <div
        className={pointerBackground ? "game-item-info-popup__trigger" : undefined}
        onClick={onOpen}
        style={
          {
            ...(style ?? {}),
            cursor: style?.cursor !== undefined ? style.cursor : cursor,
            "--gio-hover-bg": `color-mix(in srgb, ${colors.text.primary} 9%, transparent)`,
          } as CSSProperties & { "--gio-hover-bg": string }
        }
      >
        {cloneElement(children as ReactElement<any>, { onClick: (e: React.MouseEvent<HTMLElement>) => { onOpen(); e.preventDefault(); e.stopPropagation(); } })}
      </div>
    </>
  )
}