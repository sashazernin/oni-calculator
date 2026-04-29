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
import { getQualityColor, getQualityTranslationKey } from "../../helpers/qualityData";
import { useTranslation } from "../../hooks/useTranslation";
import type { TranslationKey } from "../../i18n/translations";

function gameNodeTypeKey(type: GameNode["type"]): TranslationKey {
  switch (type) {
    case "food":
      return "game_node_food";
    case "ingredient":
      return "game_node_ingredient";
    case "liquid":
      return "game_node_liquid";
    case "plant":
      return "game_node_plant";
    case "resourse":
      return "game_node_resource";
    case "kitchen-tool":
      return "game_node_kitchen_tool";
    default: {
      const _exhaustive: never = type;
      void _exhaustive;
      return "game_node_food";
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
  const { t, entityName } = useTranslation();
  const [open, setOpen] = useState(false);

  const onClose = useCallback(() => {
    setOpen(false);
  }, []);

  const onOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const popup = useMemo(() => {
    const hasQuality = "quality" in item && item.quality !== undefined;
    const qualityTint =
      hasQuality ? getQualityColor(item.quality!) : undefined;
    const qualityKey = hasQuality ? getQualityTranslationKey(item.quality!) : undefined;

    const mutedLabel = `color-mix(in srgb, ${colors.text.primary} 52%, ${colors.background.paper})`;
    const qTint =
      hasQuality && qualityTint && qualityTint !== "inherit"
        ? qualityTint
        : colors.primary.main;

    const typeKey = gameNodeTypeKey(item.type);

    return (
      <Popup variant="fit-content" closeButton open={open} onClose={onClose} title={entityName(item.name)}>
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
                alt={entityName(item.name)}
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
                {t("label_type")}
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
                {t(typeKey)}
              </span>
            </div>
            {hasQuality && qualityKey ? (
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
                  {t("label_quality")}
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
                        qualityTint && qualityTint !== "inherit" ? qualityTint : colors.text.primary,
                      padding: "4px 10px",
                      borderRadius: 8,
                      background: `color-mix(in srgb, ${qTint} 14%, ${colors.background.paper})`,
                      border: `1px solid color-mix(in srgb, ${qTint} 35%, ${colors.border.main})`,
                    }}
                  >
                    {qualityKey ? t(qualityKey) : null}
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
  }, [open, onClose, item, colors, t, entityName]);

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