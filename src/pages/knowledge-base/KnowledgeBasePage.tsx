import { useContext, useMemo, useState } from "react";
import Box from "../../components/box/box";
import { AssetImage } from "../../components/asset-image/AssetImage";
import { TextField } from "../../components/text-field/TextField";
import Tabs from "../../components/tabs/Tabs";
import GameItemInfoPopup from "../../components/game-item-info-popup/gameItemInfoPopup";
import {
  getKnowledgeBaseCatalog,
  knowledgeBaseItemMatchesFilter,
  type KnowledgeBaseTypeFilter,
} from "../../helpers/knowledgeBaseCatalog";
import type { KnowledgeBaseItem } from "../../types/game-data-types";
import { isSpaceOutOnlyCatalogItem } from "../../helpers/foodPlanetoidFilter";
import SpaceOutOnlyBadge from "../../components/space-out-only-badge/SpaceOutOnlyBadge";
import { getCatalogTypeChipColor } from "../../helpers/catalogTypeChipColor";
import { catalogTypeChipLabelKey } from "../../helpers/catalogTypeChipLabel";
import { useTranslation } from "../../hooks/useTranslation";
import { ThemeContext } from "../../providers/app-theme-provider";
import type { TranslationKey } from "../../i18n/translations";

const FILTER_ORDER: KnowledgeBaseTypeFilter[] = [
  "all",
  "food",
  "plant",
  "liquid",
  "resourse",
  "kitchen-tool",
  "gas",
  "other",
];

function filterLabelKey(filter: KnowledgeBaseTypeFilter): TranslationKey {
  if (filter === "all") return "knowledge_base_filter_all";
  if (filter === "food") return "game_node_food";
  if (filter === "gas") return "game_node_gas";
  if (filter === "other") return "game_node_other";
  if (filter === "resourse") return "game_node_resource";
  if (filter === "kitchen-tool") return "game_node_kitchen_tool";
  return `game_node_${filter}` as TranslationKey;
}

export default function KnowledgeBasePage() {
  const { colors } = useContext(ThemeContext);
  const { t, entityName, language } = useTranslation();
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");

  const tabLabels = useMemo(
    () => FILTER_ORDER.map((filter) => ({ label: t(filterLabelKey(filter)) })),
    [t],
  );

  const itemsSorted = useMemo(
    () =>
      [...getKnowledgeBaseCatalog()].sort((a, b) =>
        entityName(a.name).localeCompare(
          entityName(b.name),
          language === "ru" ? "ru" : "en",
          { sensitivity: "base", numeric: true },
        ),
      ),
    [entityName, language],
  );

  const accent = colors.primary.main;

  return (
    <Box
      style={{
        flex: 1,
        width: "100%",
        minHeight: 0,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        padding: "16px 20px",
        ["--page-inline-padding" as string]: "20px",
      }}
    >
      <Tabs value={tab} onChange={setTab} tabs={tabLabels}>
        {FILTER_ORDER.map((filter) => (
          <KnowledgeBasePanel
            key={filter}
            filter={filter}
            search={search}
            onSearchChange={setSearch}
            itemsSorted={itemsSorted}
            accent={accent}
          />
        ))}
      </Tabs>
    </Box>
  );
}

type KnowledgeBasePanelProps = {
  filter: KnowledgeBaseTypeFilter;
  search: string;
  onSearchChange: (value: string) => void;
  itemsSorted: KnowledgeBaseItem[];
  accent: string;
};

function KnowledgeBasePanel({
  filter,
  search,
  onSearchChange,
  itemsSorted,
  accent,
}: KnowledgeBasePanelProps) {
  const { colors } = useContext(ThemeContext);
  const { t, entityName } = useTranslation();
  const itemsFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return itemsSorted.filter((item) => {
      if (!knowledgeBaseItemMatchesFilter(item, filter)) return false;
      if (!q) return true;
      const label = entityName(item.name).toLowerCase();
      const keyId = item.name.toLowerCase();
      return label.includes(q) || keyId.includes(q);
    });
  }, [itemsSorted, filter, search, entityName]);

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        paddingTop: 16,
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <TextField
        label={t("search_label")}
        clearable
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div
        className="catalog-list-scroll"
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
        }}
      >
        {itemsFiltered.length === 0 ? (
          <div
            style={{
              padding: "32px 16px",
              textAlign: "center",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: `color-mix(in srgb, ${colors.text.primary} 52%, ${colors.background.paper})`,
            }}
          >
            {t("knowledge_base_no_results")}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(min(100%, 128px), 1fr))",
              gap: 10,
              minWidth: 0,
              boxSizing: "border-box",
              paddingBottom: 8,
            }}
          >
            {itemsFiltered.map((item) => (
              <CatalogCard key={`${item.type}-${item.name}`} item={item} accent={accent} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CatalogCard({
  item,
  accent,
}: {
  item: KnowledgeBaseItem;
  accent: string;
}) {
  const { colors } = useContext(ThemeContext);
  const { t, entityName } = useTranslation();
  const typeLabel = t(catalogTypeChipLabelKey(item.type));
  const typeColor = getCatalogTypeChipColor(item.type);
  const showSpaceOutBadge =
    (item.type === "food" || item.type === "ingredient" || item.type === "plant") &&
    isSpaceOutOnlyCatalogItem(item);

  return (
    <GameItemInfoPopup item={item} pointerBackground>
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          width: "100%",
          aspectRatio: "1",
          minWidth: 128,
          minHeight: 128,
          padding: "clamp(8px, 2vw, 12px)",
          boxSizing: "border-box",
          borderRadius: 10,
          background: `color-mix(in srgb, ${accent} 8%, transparent)`,
          border: `1px solid color-mix(in srgb, ${accent} 22%, transparent)`,
        }}
      >
        <div
          style={{
            fontSize: "0.75rem",
            lineHeight: 1.2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            wordBreak: "break-word",
          }}
        >
          {entityName(item.name)}
        </div>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AssetImage
            pathRelativeToAssets={item.image}
            alt={entityName(item.name)}
            width="100%"
            height="100%"
          />
        </div>
        <span
          style={{
            position: "absolute",
            left: 6,
            bottom: 6,
            maxWidth: "calc(100% - 12px)",
            fontSize: "0.5625rem",
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: typeColor,
            padding: "2px 6px",
            borderRadius: 6,
            background: `color-mix(in srgb, ${typeColor} 16%, ${colors.background.paper})`,
            border: `1px solid color-mix(in srgb, ${typeColor} 42%, ${colors.border.main})`,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {typeLabel}
        </span>
        {showSpaceOutBadge ? (
          <SpaceOutOnlyBadge
            size={28}
            style={{ position: "absolute", right: 6, bottom: 0 }}
          />
        ) : null}
      </div>
    </GameItemInfoPopup>
  );
}
