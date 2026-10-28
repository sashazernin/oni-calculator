import { useContext, useMemo } from "react";
import { ThemeContext } from "../../providers/app-theme-provider";
import { useTranslation } from "../../hooks/useTranslation";
import GameItemDependencyFlow from "./GameItemDependencyFlow";
import {
  buildProductionFlows,
  buildUsedInFlows,
  type DependencyModalItem,
  isUsedInOnlyDependencyItem,
} from "../../helpers/gameItemDependencyInfo";

type GameItemInfoDependenciesProps = {
  item: DependencyModalItem;
};

export default function GameItemInfoDependencies({
  item,
}: GameItemInfoDependenciesProps) {
  const { colors } = useContext(ThemeContext);
  const { t, language } = useTranslation();

  const mutedLabel = `color-mix(in srgb, ${colors.text.primary} 62%, ${colors.background.paper})`;

  const usedInOnly = isUsedInOnlyDependencyItem(item);

  const { productionFlows, usedInFlows } = useMemo(() => {
    if (
      item.type === "liquid" ||
      item.type === "resourse" ||
      item.type === "kitchen-tool"
    ) {
      return {
        productionFlows: [],
        usedInFlows: buildUsedInFlows(item.name, t, language),
      };
    }

    const builtFlows = buildProductionFlows(item, t, language);
    const lastFlow = builtFlows[builtFlows.length - 1];
    const flowOutName =
      lastFlow?.segments.length
        ? lastFlow.segments[lastFlow.segments.length - 1][0]?.item.name
        : null;

    const usedIn = buildUsedInFlows(
      item.name,
      t,
      language,
      item.type === "plant" ? flowOutName : null,
    );

    return {
      productionFlows: builtFlows,
      usedInFlows: usedIn,
    };
  }, [item, t, language]);

  const isPlant = item.type === "plant";
  const hasUsedIn = usedInFlows.length > 0;
  const hasProduction = productionFlows.length > 0;

  if (!hasProduction && !hasUsedIn) {
    return null;
  }

  const flowSectionStyle = {
    display: "flex",
    flexDirection: "column" as const,
    gap: 10,
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        width: "100%",
      }}
    >
      {isPlant ? (
        hasProduction || hasUsedIn ? (
          <div style={flowSectionStyle}>
            <SectionLabel
              muted={mutedLabel}
              text={t("game_item_section_used_in")}
            />
            {productionFlows.map((productionFlow, index) => (
              <GameItemDependencyFlow
                key={`${productionFlow.headerTitleKey ?? "production"}-${index}`}
                flow={productionFlow}
              />
            ))}
            {usedInFlows.map((usedFlow, index) => (
              <GameItemDependencyFlow
                key={`${usedFlow.headerTitleKey ?? "used"}-${index}`}
                flow={usedFlow}
              />
            ))}
          </div>
        ) : null
      ) : usedInOnly ? (
        hasUsedIn ? (
          <div style={flowSectionStyle}>
            <SectionLabel
              muted={mutedLabel}
              text={t("game_item_section_used_in")}
            />
            {usedInFlows.map((usedFlow, index) => (
              <GameItemDependencyFlow
                key={`${usedFlow.headerTitleKey ?? "used"}-${index}`}
                flow={usedFlow}
              />
            ))}
          </div>
        ) : null
      ) : (
        <>
          {hasProduction ? (
            <div style={flowSectionStyle}>
              <SectionLabel
                muted={mutedLabel}
                text={t("game_item_flow_production")}
              />
              {productionFlows.map((productionFlow, index) => (
                <GameItemDependencyFlow
                  key={`${productionFlow.headerTitleKey ?? "production"}-${index}`}
                  flow={productionFlow}
                />
              ))}
            </div>
          ) : null}

          {hasUsedIn ? (
            <div style={flowSectionStyle}>
              <SectionLabel
                muted={mutedLabel}
                text={t("game_item_section_used_in")}
              />
              {usedInFlows.map((usedFlow, index) => (
                <GameItemDependencyFlow
                  key={`${usedFlow.headerTitleKey ?? "used"}-${index}`}
                  flow={usedFlow}
                />
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function SectionLabel({ text, muted }: { text: string; muted: string }) {
  return (
    <div
      style={{
        fontSize: "0.65rem",
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: muted,
        marginBottom: 8,
      }}
    >
      {text}
    </div>
  );
}
