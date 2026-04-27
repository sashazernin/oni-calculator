import { useContext, useMemo, useState, type CSSProperties } from "react";
import { AssetImage } from "../../components/asset-image/AssetImage";
import { Button } from "../../components/button/Button";
import {
  DependencyTree,
  type DependencyTreeNode,
} from "../../components/dependency-tree/DependencyTree";
import { food } from "../../game-data/food";
import type { GameNode, IFood, IKitchenTool } from "../../types/game-data-types";
import { ThemeContext } from "../../providers/app-theme-provider";
import Box from "../../components/box/box";
import { DuplicantContext } from "../../providers/duplicant-provider";
import { duplicantInfo } from "../../game-data/dublicantInfo";

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

  const { tree, uniqueResourses, uniqueTools } = useMemo((): { tree: DependencyTreeNode | null, uniqueResourses: Record<string, GameNode & { total: number }>, uniqueTools: Record<string, IKitchenTool & { total: number }> } => {
    if (!selectedItem) return { tree: null, uniqueResourses: {}, uniqueTools: {} };

    const uniqueResourses: Record<string, GameNode & { total: number }> = {};
    const uniqueTools: Record<string, IKitchenTool & { total: number }> = {};

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
  const resourceChip = useMemo(
    (): CSSProperties => ({
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 12px",
      borderRadius: 10,
      background: `color-mix(in srgb, ${colors.text.primary} 7%, ${colors.background.paper})`,
      fontSize: "0.8125rem",
      fontWeight: 600,
      color: colors.text.primary,
      minWidth: 0,
    }),
    [colors.background.paper, colors.text.primary]
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
      <div
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
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            padding: 12,
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              width: "100%",
              minWidth: 0,
              boxSizing: "border-box",
              minHeight: 40,
            }}
          >
            {Object.values(uniqueResourses).map((item) => (
              <div key={item.name} style={resourceChip}>
                <AssetImage
                  pathRelativeToAssets={item.image}
                  alt={item.name}
                  width={28}
                  height={28}
                />
                <span>{item.total}</span>
              </div>
            ))}
            {Object.values(uniqueTools).length > 0 && <div style={{ height: '40px', width: 1, background: colors.border.main }}></div>}
            {Object.values(uniqueTools).map((item) => (
              <div key={item.name} style={resourceChip}>
                <AssetImage
                  pathRelativeToAssets={item.image}
                  alt={item.name}
                  width={28}
                  height={28}
                />
              </div>
            ))}
          </div>
        </Box>
        <Box
          style={{
            padding: 16,
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            position: 'relative',
          }}
        >
          {tree ? (
            <DependencyTree
              style={{ position: 'absolute', top: 16, left: 16, width: 'calc(100% - 32px)', height: 'calc(100% - 32px)' }}
              root={tree}
              nodeSize={96}
              item={(node) => (
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
                      {node.calory ? `${node.calory.toFixed()} kcal` : Number.isInteger(node.total)
                        ? node.total
                        : node.total.toFixed(2)}
                    </div>
                  )}
                </div>
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
        </Box>
      </div>
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
