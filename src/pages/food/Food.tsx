import { useCallback, useContext, useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { AssetImage } from "../../components/asset-image/AssetImage";
import { Button } from "../../components/button/Button";
import {
  DependencyTree,
  type DependencyTreeNode,
} from "../../components/dependency-tree/DependencyTree";
import { food } from "../../game-data/food";
import type { GameNode, IFood, IPlant } from "../../types/game-data-types";
import { ThemeContext } from "../../providers/app-theme-provider";
import Box from "../../components/box/box";
import { DuplicantContext } from "../../providers/duplicant-provider";
import Tabs from "../../components/tabs/Tabs";
import { IoChevronBackOutline, IoFastFoodSharp, IoNewspaper } from "react-icons/io5";
import Info from "../../components/info/info";
import { getQualityColor, getQualityTranslationKey } from "../../helpers/qualityData";
import GameItemInfoPopup from "../../components/game-item-info-popup/gameItemInfoPopup";
import { DupeIcon } from "../../icons";
import { IconButton } from "../../components/icon-button/IconButton";
import { FiPlusCircle } from "react-icons/fi";
import { AiOutlineMinusCircle } from "react-icons/ai";
import { GiStomach } from "react-icons/gi";
import { useTranslation } from "../../hooks/useTranslation";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useAppSettings } from "../../providers/app-settings-provider";
import { visiblePlanetoids } from "../../helpers/planetoidStorage";
import { isFoodShownForPlanetoid } from "../../helpers/foodPlanetoidFilter";
import { TextField } from "../../components/text-field/TextField";
import { Popup } from "../../components/popup/Popup";
import styles from "./food.module.css";

function clampDupeCount(raw: string, max: number): number {
  const parsed = parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(max, parsed));
}

type DuplicantCountCounterProps = {
  accent: string;
  value: number;
  onChange: (next: number) => void;
  icon?: "dupe" | "stomach";
  maxValue?: number;
};

function DuplicantCountCounter({
  accent,
  value,
  onChange,
  icon = "dupe",
  maxValue = 99,
}: DuplicantCountCounterProps) {
  const { colors } = useContext(ThemeContext);
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const commitDraft = () => {
    onChange(clampDupeCount(draft, maxValue));
    setEditing(false);
  };

  const handleCountKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: "8px 12px",
        borderRadius: 12,
        background: `color-mix(in srgb, ${accent} 13%, ${colors.background.paper})`,
        border: `1px solid color-mix(in srgb, ${accent} 38%, ${colors.border.main})`,
        boxShadow:
          colors.mode === "dark"
            ? "0 1px 0 color-mix(in srgb, #fff 6%, transparent)"
            : "0 1px 0 color-mix(in srgb, #000 5%, transparent)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 42,
          height: 42,
          borderRadius: "50%",
          flexShrink: 0,
          background: `color-mix(in srgb, ${accent} 22%, ${colors.background.average})`,
          boxShadow: `inset 0 1px 0 color-mix(in srgb, ${accent} 45%, transparent)`,
        }}
      >
        {icon === "stomach" ? (
          <GiStomach
            size={26}
            style={{
              color: accent,
              filter: "drop-shadow(0 1px 3px rgb(0 0 0 / 0.45))",
            }}
          />
        ) : (
          <DupeIcon
            size={26}
            style={{
              color: accent,
              filter: "drop-shadow(0 1px 3px rgb(0 0 0 / 0.45))",
            }}
          />
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton
          color="action"
          aria-label={t("aria_decrease_count")}
          onClick={() => {
            setEditing(false);
            if (value > 0) onChange(value - 1);
          }}
        >
          <AiOutlineMinusCircle size={22} />
        </IconButton>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-label={t("aria_edit_count")}
          value={editing ? draft : String(value)}
          onFocus={(e) => {
            setEditing(true);
            setDraft(String(value));
            e.target.select();
          }}
          onBlur={commitDraft}
          onChange={(e) => {
            setDraft(e.target.value.replace(/\D/g, "").slice(0, 2));
          }}
          onKeyDown={handleCountKeyDown}
          style={{
            boxSizing: "border-box",
            width: "2.75rem",
            minWidth: "2.75rem",
            padding: "6px 4px",
            textAlign: "center",
            fontVariantNumeric: "tabular-nums",
            fontWeight: 700,
            fontSize: "0.9375rem",
            lineHeight: 1.15,
            color: colors.text.primary,
            background: colors.background.average,
            borderRadius: 8,
            border: `1px solid ${colors.border.main}`,
            outline: "none",
          }}
        />
        <IconButton
          color="action"
          aria-label={t("aria_increase_count")}
          onClick={() => {
            setEditing(false);
            if (value < maxValue) onChange(value + 1);
          }}
        >
          <FiPlusCircle size={22} />
        </IconButton>
      </div>
    </div>
  );
}

export default function Food() {
  const { colors } = useContext(ThemeContext);
  const { t, entityName, language } = useTranslation();
  const { activePlanetoid, data } = useAppSettings();
  const hasVisiblePlanetoids = visiblePlanetoids(data.planetoids).length > 0;

  const [selectedItem, setSelectedItem] = useState<IFood | null>(null);

  const { duplicants } = useContext(DuplicantContext);

  const [greenDupe, setGreenDupe] = useState(0);
  const [redDupe, setRedDupe] = useState(0);

  const setDefaultDupes = useCallback(() => {
    const total = duplicants.length;
    const gluttonous = duplicants.filter((d) => d.gluttonous).length;
    setGreenDupe(total);
    setRedDupe(gluttonous);
  }, [duplicants]);

  useEffect(() => {
    setDefaultDupes();
  }, [setDefaultDupes]);

  const setTotalDupeCount = useCallback((next: number) => {
    const n = Math.max(0, Math.min(99, next));
    setGreenDupe(n);
    setRedDupe((r) => Math.min(r, n));
  }, []);

  const setGluttonousCount = useCallback(
    (next: number) => {
      const n = Math.max(0, Math.min(99, next, greenDupe));
      setRedDupe(n);
    },
    [greenDupe]
  );

  const totalPerCycle = useMemo(() => {
    const gluttonous = Math.min(redDupe, greenDupe);
    const normal = Math.max(0, greenDupe - gluttonous);
    return normal * 1000 + gluttonous * 1500;
  }, [greenDupe, redDupe]);

  /** Латиница a–z и кириллица а–я (и ё) по правилам `ru` */
  const foodItemsSorted = useMemo(
    () =>
      Object.values(food).sort((a, b) =>
        entityName(a.name).localeCompare(entityName(b.name), language === "ru" ? "ru" : "en", {
          sensitivity: "base",
          numeric: true,
        })
      ),
    [language, entityName]
  );

  const foodItemsForPlanetoid = useMemo(
    () =>
      foodItemsSorted.filter((item) =>
        isFoodShownForPlanetoid(item, activePlanetoid, hasVisiblePlanetoids)
      ),
    [foodItemsSorted, activePlanetoid, hasVisiblePlanetoids]
  );

  useEffect(() => {
    if (!selectedItem) return;
    if (isFoodShownForPlanetoid(selectedItem, activePlanetoid, hasVisiblePlanetoids)) return;
    setSelectedItem(null);
  }, [selectedItem, activePlanetoid, hasVisiblePlanetoids]);

  const { tree, uniqueResourses, uniqueTools } = useMemo((): { tree: DependencyTreeNode | null, uniqueResourses: Record<string, GameNode & { total: number }>, uniqueTools: Record<string, GameNode & { total: number }> } => {
    if (!selectedItem) return { tree: null, uniqueResourses: {}, uniqueTools: {} };

    const uniqueResourses: Record<string, GameNode & { total: number }> = {};
    const uniqueTools: Record<string, GameNode & { total: number }> = {};

    /** Сколько «единиц спроса» даёт одно растение (обратно к формуле ceil в этапе 1). */
    const plantDemandFactor = (plant: IPlant, union: boolean) =>
      union ? 1 / plant.harvest : plant.cycles === 0 ? 1 : plant.cycles;

    const requirementNodes = (node: DependencyTreeNode): DependencyTreeNode[] => {
      if (!node.children?.length) return [];
      if (node.children.length === 1 && node.children[0].type === "kitchen-tool") {
        return node.children[0].children ?? [];
      }
      return node.children;
    };

    /** Этап 1: сверху вниз — спрос по калориям/рецепту, растения вверх до целого. */
    const mapToTree = (item: GameNode & { total: number }, parent?: GameNode): DependencyTreeNode => {
      const total = (() => {
        const value = "calory" in item ? item.calory : 1;
        if (item.type === "plant") {
          const union = Boolean(parent && "union" in parent && parent.union);
          return Math.ceil(item.total * plantDemandFactor(item, union));
        }
        return item.total / value;
      })();

      if ("tool" in item && item.tool) {
        uniqueTools[item.tool.name] = {
          name: item.tool.name,
          type: item.tool.type,
          image: item.tool.image,
          total: 1,
        };
      }

      const result: DependencyTreeNode = {
        item,
        name: item.name,
        image: item.image,
        total,
        type: item.type,
        ...(("calory" in item && !item.union) ? {
          calory: total * item.calory,
        } : {}),
      };

      const children = (() => {
        if (
          "requirements" in item &&
          item.requirements &&
          item.requirements.length > 0
        ) {
          return item.requirements.map((requirement) =>
            mapToTree({
              ...requirement.item,
              total: total * requirement.count,
            }, item)
          );
        }
        return undefined;
      })();

      if ("tool" in item && item.tool) {
        const tool = item.tool;
        return {
          ...result,
          children: [{
            item: tool,
            ...tool,
            total: 1,
            children,
          }],
        };
      }
      return { ...result, children };
    };

    /**
     * Этап 2: снизу вверх — от целого числа растений считаем фактический урожай
     * и производимую еду; жидкости/ресурсы рецепта масштабируем под выпуск.
     */
    const applyPlantProduction = (node: DependencyTreeNode): void => {
      node.children?.forEach(applyPlantProduction);

      if (node.type !== "food" && node.type !== "ingredient") return;
      if (!("requirements" in node.item) || !node.item.requirements?.length) return;

      const reqNodes = requirementNodes(node);
      const byName = new Map(reqNodes.map((child) => [child.name, child]));

      let producedUnits: number | null = null;

      for (const requirement of node.item.requirements) {
        const child = byName.get(requirement.item.name);
        if (!child) continue;

        if (requirement.item.type === "plant") {
          const union = Boolean("union" in node.item && node.item.union);
          const factor = plantDemandFactor(requirement.item, union);
          const units = child.total / (requirement.count * factor);
          producedUnits = producedUnits === null ? units : Math.min(producedUnits, units);
        } else if (requirement.item.type === "food" || requirement.item.type === "ingredient") {
          const units = (child.total * requirement.item.calory) / requirement.count;
          producedUnits = producedUnits === null ? units : Math.min(producedUnits, units);
        }
      }

      if (producedUnits === null || Math.abs(producedUnits - node.total) < 1e-9) return;

      node.total = producedUnits;
      if ("calory" in node.item && !node.item.union) {
        node.calory = producedUnits * node.item.calory;
      }

      for (const requirement of node.item.requirements) {
        if (requirement.item.type !== "liquid" && requirement.item.type !== "resourse") continue;
        const child = byName.get(requirement.item.name);
        if (child) child.total = producedUnits * requirement.count;
      }
    };

    const collectTotals = (node: DependencyTreeNode): void => {
      if (node.type !== "kitchen-tool") {
        if (!uniqueResourses[node.name]) {
          uniqueResourses[node.name] = { ...node.item, total: node.total };
        } else {
          uniqueResourses[node.name].total += node.total;
        }
      }
      node.children?.forEach(collectTotals);
    };

    const tree = mapToTree({ ...selectedItem, total: totalPerCycle });
    applyPlantProduction(tree);
    collectTotals(tree);

    return { tree, uniqueResourses, uniqueTools };
  }, [selectedItem, totalPerCycle]);

  const accent = colors.primary.main;

  const [selectedTab, setSelectedTab] = useState<number>(0);

  const [plants, foods, resourses, liquids] = useMemo(() => {
    const plants: (GameNode & { total: number })[] = [];
    const food: (GameNode & { total: number })[] = [];
    const resourses: (GameNode & { total: number })[] = [];
    const liquids: (GameNode & { total: number })[] = [];

    Object.values(uniqueResourses).forEach((item) => {
      if (item.type === "plant") {
        plants.push(item);
      }

      if (item.type === "food" || item.type === "ingredient") {
        food.push(item);
      }

      if (item.type === "resourse") {
        resourses.push(item);
      }

      if (item.type === "liquid") {
        liquids.push(item);
      }
    });

    return [plants, food, resourses, liquids];
  }, [uniqueResourses]);

  const getResourseValue = useCallback(
    (item: GameNode & { total: number } | DependencyTreeNode, totalCalory: boolean = false) => {
      if (item.type === "ingredient") {
        if ("union" in item && item.union) {
          return Number.isInteger(item.total) ? item.total : item.total.toFixed(2);
        }
        const grams = (totalCalory ? 1 : item.total) * (item.calory ?? 0);
        return `${Math.round(grams)} ${t("unit_grams")}`;
      }
      if ("calory" in item && item.calory) {
        const kcal = (totalCalory ? 1 : item.total) * item.calory;
        return `${Math.round(kcal)} ${t("unit_kcal")}`;
      }
      if (Number.isInteger(item.total)) return item.total;
      return item.total.toFixed(2);
    },
    [t]
  );

  const infoItems = useCallback(
    (mas: (GameNode & { total: number })[], title: string) => {
      if (mas.length === 0) return null;
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: "0.875rem", fontWeight: 600, color: colors.text.primary }}>{title}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {mas.map((item) => (
              <GameItemInfoPopup item={item}>
                <div key={item.name} style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px",
                  borderRadius: 10,
                  background: colors.background.average,
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  width: "fit-content",
                  color: colors.text.primary,
                  minWidth: 0,
                }}>
                  <AssetImage
                    pathRelativeToAssets={item.image}
                    alt={entityName(item.name)}
                    width={28}
                    height={28}
                  />
                  {item.type !== "kitchen-tool" && <span>{getResourseValue(item)}</span>}
                </div>
              </GameItemInfoPopup>
            ))}
          </div>
        </div>
      )
    }, [colors.text.primary, getResourseValue]);

  const qualityChip = useCallback(
    (quality: number) => {
      const color = getQualityColor(quality);
      const key = getQualityTranslationKey(quality);
      return (
        <div style={{ color }}>
          {`${t(key)} (${quality})`}
        </div>
      );
    },
    [t]
  );

  const [foodSearch, setFoodSearch] = useState<string>("");

  const foodItemsFiltered = useMemo(() => {
    const q = foodSearch.trim().toLowerCase();
    if (!q) return foodItemsForPlanetoid;
    return foodItemsForPlanetoid.filter((item) => {
      const label = entityName(item.name).toLowerCase();
      const keyId = item.name.toLowerCase();
      return label.includes(q) || keyId.includes(q);
    });
  }, [foodSearch, foodItemsForPlanetoid, entityName]);

  const narrowFoodLayout = useMediaQuery("(max-width: 1200px)");
  const [foodPickerOpen, setFoodPickerOpen] = useState(false);

  useEffect(() => {
    if (!narrowFoodLayout) setFoodPickerOpen(false);
  }, [narrowFoodLayout]);

  const foodPickerHint =
    narrowFoodLayout && !foodPickerOpen ? t("food_select_open_panel_hint") : t("food_select_prompt");

  const foodSidebarBlocks = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        minWidth: 0,
        ...(narrowFoodLayout
          ? { flex: "1 1 auto", minHeight: 0, overflow: "hidden" }
          : { flex: 1, minHeight: 0, height: "100%" }),
      }}
    >
      <Box
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 10,
          padding: narrowFoodLayout ? 0 : "12px 14px",
        }}
      >
        <DuplicantCountCounter
          accent="#0EAD78"
          value={greenDupe}
          onChange={setTotalDupeCount}
        />
        <DuplicantCountCounter
          accent="#E53935"
          value={redDupe}
          onChange={setGluttonousCount}
          icon="stomach"
          maxValue={greenDupe}
        />
        <Button
          type="button"
          variant="translucent"
          onClick={setDefaultDupes}
          style={{
            marginLeft: "auto",
            padding: "10px 18px",
            borderRadius: 10,
            fontSize: "0.6875rem",
            fontWeight: 700,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
          }}
        >
          {t("food_clear")}
        </Button>
      </Box>
      <Box
        style={{
          height: narrowFoodLayout ? undefined : "100%",
          width: "100%",
          overflow: "hidden",
          flex: narrowFoodLayout ? "1 1 0%" : "1 1 auto",
          minHeight: "300px",
          display: "flex",
          flexDirection: "column",
          padding: narrowFoodLayout ? 0 : 16,
        }}
      >
        <TextField
          label={t("search_label")}
          clearable
          value={foodSearch}
          onChange={(e) => {
            setFoodSearch(e.target.value);
          }}
        />
        <div style={{ position: 'relative', height: narrowFoodLayout ? '100%' : 'calc(100% - 40px)', width: '100%', minHeight: 0, flex: 1 }}>
          <div
            style={{
              position: "absolute",
              top: narrowFoodLayout ? 8 : 16,
              left: 0,
              width: "100%",
              height: narrowFoodLayout ? "calc(100% - 8px)" : "calc(100% - 32px)",
              overflow: "auto",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(min(100%, 128px), 1fr))",
                gap: 10,
                minWidth: 0,
                boxSizing: "border-box",
              }}
            >
              {foodItemsFiltered.length === 0 ? (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    padding: "24px 16px",
                    textAlign: "center",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: `color-mix(in srgb, ${colors.text.primary} 52%, ${colors.background.paper})`,
                  }}
                >
                  {t("food_search_no_results")}
                </div>
              ) : null}
              {foodItemsFiltered.map((item) => {
                const isSelected = selectedItem?.name === item.name;
                return (
                  <div
                    key={item.name}
                    style={{ display: "flex", minWidth: 0, minHeight: 0, width: "100%" }}
                  >
                    <Button
                      variant="translucent"
                      className="button--natural-case"
                      colorOverrides={
                        isSelected
                          ? {
                            main: `color-mix(in srgb, ${accent} 38%, transparent)`,
                            hover: `color-mix(in srgb, ${accent} 48%, transparent)`,
                            active: `color-mix(in srgb, ${accent} 54%, transparent)`,
                          }
                          : undefined
                      }
                      style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "1",
                        minWidth: 128,
                        minHeight: 128,
                        padding: "clamp(8px, 2vw, 12px)",
                        boxSizing: "border-box",
                        borderRadius: 10,
                      }}
                      onClick={() => {
                        setSelectedItem(item);
                        setFoodPickerOpen(false);
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                          height: "100%",
                          width: "100%",
                          color: "inherit",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.75rem",
                            lineHeight: 1.2,
                            color: "inherit",
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
                      </div>
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Box>
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flex: 1,
        minHeight: 0,
        boxSizing: "border-box",
        height: "100%"
      }}
    >
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          width: narrowFoodLayout ? "100%" : "70%",
          minWidth: 0,
          gap: 14,
          height: "100%",
          minHeight: 0,
        }}
      >
        <Tabs
          header={
            <>
              <div style={{ flex: 1 }} />
              <div style={{ display: "flex", justifyContent: "center", alignItems: 'center', marginLeft: 8 }}>
                <Info message={t("food_resource_info_tooltip")} />
              </div>
            </>}
          value={selectedTab}
          onChange={setSelectedTab}
          tabs={[
            { label: t("food_tab_food"), icon: <IoFastFoodSharp /> },
            { label: t("food_tab_info"), icon: <IoNewspaper /> },
          ]}
        >
          <div
            style={{
              flex: 1,
              minHeight: 0,
              paddingTop: 16,
              display: "flex",
              flexDirection: "column",
              position: 'relative',
              height: '100%',
            }}
          >
            {tree ? (
              <DependencyTree
                style={{ position: 'absolute', top: 16, left: 0, width: '100%', height: 'calc(100% - 16px)' }}
                root={tree}
                nodeSize={96}
                item={(node) => (
                  <GameItemInfoPopup item={node.item} style={{ width: '100%', height: '100%' }} pointerBackground>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        padding: 6,
                        minWidth: 0,
                        width: "100%",
                        height: "100%",
                        textAlign: "center",
                      }}
                    >
                      <AssetImage
                        pathRelativeToAssets={node.image}
                        alt=""
                        width={36}
                        height={36}
                      />
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "0.65rem",
                          lineHeight: 1.15,
                          color: colors.text.primary,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {entityName(node.name)}
                      </div>
                      {node.type !== "kitchen-tool" && (
                        <div
                          style={{
                            fontSize: "0.6rem",
                            lineHeight: 1,
                            color: `color-mix(in srgb, ${colors.text.primary} 72%, ${colors.background.paper})`,
                          }}
                        >
                          {getResourseValue({ ...node.item, ...node }, true)}
                        </div>
                      )}
                    </div>
                  </GameItemInfoPopup>
                )}
              />
            ) : (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  color: `color-mix(in srgb, ${colors.text.primary} 48%, ${colors.background.paper})`,
                }}
              >
                {foodPickerHint}
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              paddingTop: 16,
              height: "100%",
              width: "100%",
            }}
          >
            {selectedItem ? <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                flexWrap: "wrap",
                gap: 8,
                width: "100%",
                minWidth: 0,
                boxSizing: "border-box",
                minHeight: 40,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: colors.text.primary }}>{t("food_quality_label")}</div>
                {typeof selectedItem.quality === "number"
                  ? qualityChip(selectedItem.quality)
                  : null}
              </div>
              {infoItems(plants, t("food_section_plants"))}
              {infoItems(foods, t("food_section_food"))}
              {infoItems(resourses, t("food_section_resources"))}
              {infoItems(liquids, t("food_section_liquids"))}
              {infoItems(Object.values(uniqueTools), t("food_section_tools"))}
            </div> : <div
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.95rem", fontWeight: 500,
                color: `color-mix(in srgb, ${colors.text.primary} 48%, ${colors.background.paper})`,
                height: "100%", width: "100%",
              }}>
              {foodPickerHint}
            </div>}
          </div>
        </Tabs>
      </Box>
      {narrowFoodLayout ? (
        <>
          {!foodPickerOpen ? (
            <Button
              type="button"
              variant="translucent"
              aria-label={t("aria_food_open_picker_panel")}
              onClick={() => setFoodPickerOpen(true)}
              style={{
                position: "fixed",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 1592,
                padding: "14px 10px 14px 12px",
                borderRadius: "12px 0 0 12px",
                boxShadow: colors.shadow.default,
              }}
            >
              <IoChevronBackOutline size={22} aria-hidden />
            </Button>
          ) : null}
          <Popup
            title={t("food_picker_drawer_title")}
            variant="drawer-right"
            open={foodPickerOpen}
            onClose={() => setFoodPickerOpen(false)}
            closeButton
            zIndex={1592}
            width={450}
          >
            <div style={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {foodSidebarBlocks}
            </div>

          </Popup>
        </>
      ) : (
        <>
          <div
            className={styles["food-sidebar-scroll"]}
            style={{
              width: "40%",
              marginLeft: 16,
              minHeight: 0,
              alignSelf: "stretch",
              overflow: "auto",
              overflowX: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                minWidth: 0,
                minHeight: "100%",
                boxSizing: "border-box",
              }}
            >
              {foodSidebarBlocks}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
