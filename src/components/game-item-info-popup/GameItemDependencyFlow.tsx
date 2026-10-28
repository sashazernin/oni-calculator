import { useContext } from "react";
import { IoPlay } from "react-icons/io5";
import type { KnowledgeBaseItem } from "../../types/game-data-types";
import type { DependencyFlow, FlowStep } from "../../helpers/gameItemDependencyInfo";
import { ThemeContext } from "../../providers/app-theme-provider";
import { useTranslation } from "../../hooks/useTranslation";
import { AssetImage } from "../asset-image/AssetImage";
import GameItemInfoPopup from "./gameItemInfoPopup";

export default function GameItemDependencyFlow({ flow }: { flow: DependencyFlow }) {
  const { colors } = useContext(ThemeContext);
  const { entityName } = useTranslation();

  const showHeader = Boolean(flow.headerTitleKey);
  const headerText = flow.headerTitleKey
    ? entityName(flow.headerTitleKey)
    : "";

  return (
    <div
      style={{
        borderRadius: 10,
        overflow: "hidden",
        border: `1px solid ${colors.border.main}`,
        background: colors.background.paper,
        boxShadow: colors.shadow.default,
      }}
    >
      {showHeader ? (
        <div
          style={{
            padding: "6px 12px",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            textAlign: "center",
            color: colors.primary.contrastText,
            background: colors.primary.main,
          }}
        >
          {headerText}
        </div>
      ) : null}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: 6,
          padding: "14px 10px 12px",
          flexWrap: "wrap",
        }}
      >
        {flow.segments.map((segment, segmentIndex) => (
          <div
            key={segmentIndex}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 6,
            }}
          >
            {segmentIndex > 0 ? (
              <IoPlay
                size={14}
                aria-hidden
                style={{
                  flexShrink: 0,
                  color: colors.text.primary,
                  opacity: 0.75,
                  marginTop: 21,
                }}
              />
            ) : null}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 4,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {segment.map((step, stepIndex) => (
                <FlowNode
                  key={`${step.item.type}-${step.item.name}-${stepIndex}`}
                  item={step.item}
                  caption={step.caption}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlowNode({
  item,
  caption,
}: {
  item: FlowStep["item"];
  caption: string;
}) {
  const { colors } = useContext(ThemeContext);
  const { entityName } = useTranslation();

  return (
    <GameItemInfoPopup item={item as KnowledgeBaseItem} pointerBackground>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          width: 72,
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            filter: "drop-shadow(0 2px 4px rgb(0 0 0 / 0.35))",
          }}
        >
          <AssetImage
            pathRelativeToAssets={item.image}
            alt={entityName(item.name)}
            width={52}
            height={52}
          />
        </div>
        <div
          style={{
            minHeight: "2.5em",
            width: "100%",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            fontSize: "0.6875rem",
            fontWeight: 700,
            lineHeight: 1.2,
            textAlign: "center",
            fontVariantNumeric: "tabular-nums",
            color: colors.text.primary,
            wordBreak: "break-word",
            maxWidth: 88,
            boxSizing: "border-box",
          }}
        >
          {caption || "\u00a0"}
        </div>
      </div>
    </GameItemInfoPopup>
  );
}
