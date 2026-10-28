import { useContext } from "react";
import type { KnowledgeBaseItem } from "../../types/game-data-types";
import { ThemeContext } from "../../providers/app-theme-provider";
import { useTranslation } from "../../hooks/useTranslation";
import { AssetImage } from "../asset-image/AssetImage";
import GameItemInfoPopup from "./gameItemInfoPopup";
import type { DependencyRowData } from "../../helpers/gameItemDependencyInfo";

export function GameItemDependencyRows({
  rows,
  mutedLabel,
}: {
  rows: DependencyRowData[];
  mutedLabel: string;
}) {
  const { colors } = useContext(ThemeContext);
  const { entityName } = useTranslation();

  if (rows.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {rows.map((row) => (
        <GameItemInfoPopup
          key={`${row.item.type}-${row.item.name}`}
          item={row.item as KnowledgeBaseItem}
          pointerBackground
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              borderRadius: 10,
              background: colors.background.average,
              border: `1px solid ${colors.border.main}`,
              cursor: "pointer",
              minWidth: 0,
            }}
          >
            <AssetImage
              pathRelativeToAssets={row.item.image}
              alt={entityName(row.item.name)}
              width={36}
              height={36}
            />
            <span
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: colors.text.primary,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {entityName(row.item.name)}
            </span>
            {row.amount ? (
              <span
                style={{
                  flexShrink: 0,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                  color: mutedLabel,
                }}
              >
                {row.amount}
              </span>
            ) : null}
          </div>
        </GameItemInfoPopup>
      ))}
    </div>
  );
}
