import { useCallback, useContext, useMemo, useState } from "react";
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
import { duplicantInfo } from "../../game-data/dublicantInfo";
import Tabs from "../../components/tabs/Tabs";
import { IoFastFoodSharp } from "react-icons/io5";
import { IoNewspaper } from "react-icons/io5";
import Info from "../../components/info/info";
import { getQualityData } from "../../helpers/qualityData";
import GameItemInfoPopup from "../../components/game-item-info-popup/gameItemInfoPopup";

export default function Food() {
  const { colors } = useContext(ThemeContext);

  const [selectedItem, setSelectedItem] = useState<IFood | null>(null);

  const { duplicants } = useContext(DuplicantContext);

  const totalPerCycle = useMemo(() => (
    duplicants.reduce((acc, duplicate) =>
      acc + 1000 + (duplicate.gluttonous ? duplicantInfo.gluttonous : 0),
      0
    )
  ), [duplicants]);

  /** Латиница a–z и кириллица а–я (и ё) по правилам `ru` */
  const foodItemsSorted = useMemo(
    () =>
      Object.values(food).sort((a, b) =>
        a.name.localeCompare(b.name, "ru", { sensitivity: "base", numeric: true })
      ),
    []
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
    const plants = []
    const food = []
    const resourses = []
    const liquids = []

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

  const getResourseValue = useCallback((item: GameNode & { total: number } | DependencyTreeNode, totalCalory: boolean = false) => {
    if (item.type === "ingredient") {
      if ('union' in item && item.union) {
        return Number.isInteger(item.total) ? item.total : item.total.toFixed(2)
      }
      return `${((totalCalory ? 1 : item.total) * item.calory).toFixed()} g`
    };
    if ('calory' in item && item.calory) return `${((totalCalory ? 1 : item.total) * item.calory).toFixed()} kcal`;
    if (Number.isInteger(item.total)) return item.total;
    return item.total.toFixed(2);
  }, []);

  const infoItems = useCallback((mas: (GameNode & { total: number })[], title: string) => {
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
                  alt={item.name}
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
  }, []);

  const qualityChip = useCallback(
    (quality: number) => {

      const qualityData = getQualityData(quality);

      return (
        <div style={{ color: qualityData.color }}>
          {`${qualityData.name} (${quality})`}
        </div>
      );
    },
    [colors.text.primary]
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
                <Info message="Resource values ​​are given per cycle, plants are calculated so that there is enough food for the duration of their growth cycle" />
              </div>
            </>}
          value={selectedTab}
          onChange={setSelectedTab}
          tabs={[
            { label: "Food", icon: <IoFastFoodSharp /> },
            { label: "Info", icon: <IoNewspaper /> },
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
                        {node.name}
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
                Select food on the right
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
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: colors.text.primary }}>Quality:</div>
                {selectedItem && qualityChip(selectedItem?.quality)}
              </div>
              {infoItems(plants, 'Plants')}
              {infoItems(foods, 'Food')}
              {infoItems(resourses, 'Resourses')}
              {infoItems(liquids, 'Liquids')}
              {infoItems(Object.values(uniqueTools), 'Tools')}
            </div> : <div
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.95rem", fontWeight: 500,
                color: `color-mix(in srgb, ${colors.text.primary} 48%, ${colors.background.paper})`,
                height: "100%", width: "100%",
              }}>
              Select food on the right
            </div>}
          </div>
        </Tabs>
      </Box>
      <Box
        style={{
          position: "relative",
          height: "100%",
          width: "40%",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            width: "calc(100% - 32px)",
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
            {foodItemsSorted.map((item) => {
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
                        }}
                      >
                        {item.name}
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
                          alt={item.name}
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
      </Box>
    </div>
  );
}
