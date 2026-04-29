import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AssetImage } from "../../components/asset-image/AssetImage";
import { Button } from "../../components/button/Button";
import {
  DependencyTree,
  type DependencyTreeNode,
} from "../../components/dependency-tree/DependencyTree";
import { food } from "../../game-data/food";
import type { GameNode, IFood } from "../../types/game-data-types";
import { ThemeContext } from "../../providers/app-theme-provider";
import Box from "../../components/box/box";
import { DuplicantContext } from "../../providers/duplicant-provider";
import Tabs from "../../components/tabs/Tabs";
import { IoFastFoodSharp } from "react-icons/io5";
import { IoNewspaper } from "react-icons/io5";
import Info from "../../components/info/info";
import { getQualityColor, getQualityTranslationKey } from "../../helpers/qualityData";
import GameItemInfoPopup from "../../components/game-item-info-popup/gameItemInfoPopup";
import { DupeIcon } from "../../icons";
import { IconButton } from "../../components/icon-button/IconButton";
import { FiPlusCircle } from "react-icons/fi";
import { AiOutlineMinusCircle } from "react-icons/ai";
import { useTranslation } from "../../hooks/useTranslation";
import { TextField } from "../../components/text-field/TextField";

export default function Food() {
  const { colors } = useContext(ThemeContext);
  const { t, entityName, language } = useTranslation();

  const [selectedItem, setSelectedItem] = useState<IFood | null>(null);

  const { duplicants } = useContext(DuplicantContext);

  const [greenDupe, setGreenDupe] = useState(0);
  const [redDupe, setRedDupe] = useState(0);

  const setDefaultDupes = useCallback(() => {
    const greenDupe = []

    const redDupe = []

    duplicants.forEach((duplicate) => {
      if (duplicate.gluttonous) {
        redDupe.push(duplicate);
      } else {
        greenDupe.push(duplicate);
      }
    });

    setGreenDupe(greenDupe.length);
    setRedDupe(redDupe.length);
  }, [duplicants]);

  useEffect(() => {
    setDefaultDupes()
  }, [setDefaultDupes]);

  const totalPerCycle = useMemo(() => greenDupe * 1000 + redDupe * 1500, [greenDupe, redDupe]);

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

  const { tree, uniqueResourses, uniqueTools } = useMemo((): { tree: DependencyTreeNode | null, uniqueResourses: Record<string, GameNode & { total: number }>, uniqueTools: Record<string, GameNode & { total: number }> } => {
    if (!selectedItem) return { tree: null, uniqueResourses: {}, uniqueTools: {} };

    const uniqueResourses: Record<string, GameNode & { total: number }> = {};
    const uniqueTools: Record<string, GameNode & { total: number }> = {};

    const mapToTree = (item: GameNode & { total: number }, parent?: GameNode): DependencyTreeNode => {
      const total = (() => {
        const value = "calory" in item ? item.calory : 1;
        if (item.type === "plant") {
          const union = Boolean(parent && "union" in parent && parent.union);
          return Math.ceil(
            item.total * (union ? 1 / item.harvest : item.cycles === 0 ? 1 : item.cycles)
          );
        } else {
          return item.total / value;
        }
      })();

      if (!uniqueResourses[item.name]) {
        uniqueResourses[item.name] = { ...item, total: Number(total.toFixed(2)) };
      } else {
        uniqueResourses[item.name].total += Number(total.toFixed(2));
      }

      if ("tool" in item && item.tool) {
        uniqueTools[item.tool.name] = { name: item.tool.name, type: item.tool.type, image: item.tool.image, total: 1 };
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
              total: total * requirement.count
            }, item)
          );
        }
        return undefined;
      })()

      if ("tool" in item && item.tool) {
        const tool = item.tool;
        return {
          ...result,
          children: [{
            item: tool,
            ...tool,
            total: 1,
            children: children
          }],
        }
      } else {
        return {
          ...result,
          children: children,
        }
      }
    };

    return { tree: mapToTree({ ...selectedItem, total: totalPerCycle }), uniqueResourses, uniqueTools };
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
        return `${((totalCalory ? 1 : item.total) * (item.calory ?? 0)).toFixed()} ${t("unit_grams")}`;
      }
      if ("calory" in item && item.calory)
        return `${((totalCalory ? 1 : item.total) * item.calory).toFixed()} ${t("unit_kcal")}`;
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
    if (!q) return foodItemsSorted;
    return foodItemsSorted.filter((item) => {
      const label = entityName(item.name).toLowerCase();
      const keyId = item.name.toLowerCase();
      return label.includes(q) || keyId.includes(q);
    });
  }, [foodSearch, foodItemsSorted, entityName]);

  const dupeCounter = useCallback(
    (accent: string, value: number, onChange: (next: number) => void) => (
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
          <DupeIcon
            size={26}
            style={{
              color: accent,
              filter: "drop-shadow(0 1px 3px rgb(0 0 0 / 0.45))",
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            color="action"
            aria-label={t("aria_decrease_count")}
            onClick={() => {
              if (value > 0) onChange(value - 1);
            }}
          >
            <AiOutlineMinusCircle size={22} />
          </IconButton>
          <div
            style={{
              minWidth: "2.35rem",
              padding: "6px 8px",
              textAlign: "center",
              fontVariantNumeric: "tabular-nums",
              fontWeight: 700,
              fontSize: "0.9375rem",
              lineHeight: 1.15,
              color: colors.text.primary,
              background: colors.background.average,
              borderRadius: 8,
              border: `1px solid ${colors.border.main}`,
            }}
          >
            {value}
          </div>
          <IconButton
            color="action"
            aria-label={t("aria_increase_count")}
            onClick={() => {
              if (value < 99) onChange(value + 1);
            }}
          >
            <FiPlusCircle size={22} />
          </IconButton>
        </div>
      </div>
    ),
    [colors, t]
  );

  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        alignItems: "stretch",
        height: "100%",
        minHeight: 0,
      }}
    >
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          width: "60%",
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
              <div style={{ display: "flex", justifyContent: "center", alignItems: 'center' }}>
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
                {t("food_select_prompt")}
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
              {t("food_select_prompt")}
            </div>}
          </div>
        </Tabs>
      </Box>
      <div style={{
        height: "100%",
        width: "40%",
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}>
        <Box
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 10,
            padding: "12px 14px",
          }}
        >
          {dupeCounter("#0EAD78", greenDupe, setGreenDupe)}
          {dupeCounter("#E53935", redDupe, setRedDupe)}
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
            height: "100%",
            width: "100%",
            overflow: "hidden",
          }}
        >
          <TextField
            label={t("search_label")}
            onChange={(e) => {
              setFoodSearch(e.target.value);
            }}
          />
          <div style={{ position: 'relative', height: 'calc(100% - 40px)', width: '100%' }}>
            <div
              style={{
                position: "absolute",
                top: 16,
                left: 0,
                width: "100%",
                height: "calc(100% - 32px)",
                overflow: "auto",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(min(100%, 100px), 1fr))",
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
                      style={{ display: "flex", minWidth: 0, minHeight: 0 }}
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
                          width: "100%",
                          aspectRatio: "1",
                          minHeight: 0,
                          padding: "clamp(8px, 2vw, 12px)",
                          boxSizing: "border-box",
                          borderRadius: 10,
                        }}
                        onClick={() => setSelectedItem(item)}
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
                              textOverflow: "ellipsis"
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
    </div>
  );
}
