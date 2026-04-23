import { useContext, useMemo, useState } from "react";
import { AssetImage } from "../../components/asset-image/AssetImage";
import { Button } from "../../components/button/Button";
import {
  DependencyTree,
  type DependencyTreeNode,
} from "../../components/dependency-tree/DependencyTree";
import { food } from "../../game-data/food";
import type { GameNode, IFood } from "../../types/game-data-types";
import { ThemeContext } from "../../providers/AppThemeProvider";

export default function Food() {
  const { colors } = useContext(ThemeContext);

  const [selectedItem, setSelectedItem] = useState<IFood | null>(null);

  const dupeReq = 1000;
  const dupeCount = 3;

  const totalPerCycle = useMemo(() => dupeReq * dupeCount, [dupeReq, dupeCount]);

  const { tree, uniqueResourses } = useMemo((): { tree: DependencyTreeNode | null, uniqueResourses: Record<string, GameNode & { total: number }> } => {
    if (!selectedItem) return { tree: null, uniqueResourses: {} };

    const uniqueResourses: Record<string, GameNode & { total: number }> = {};

    const mapToTree = (item: GameNode & { total: number }): DependencyTreeNode => {
      const total = (() => {
        const value = "calory" in item ? item.calory : 1;
        return Math.ceil(item.total / ("cycles" in item ? value / item.cycles : value));
      })();

      if (!uniqueResourses[item.name]) {
        uniqueResourses[item.name] = { ...item, total };
      } else {
        uniqueResourses[item.name].total += total;
      }

      const result: DependencyTreeNode = {
        name: item.name,
        image: item.image,
        total,
      };

      if (
        "requirements" in item &&
        item.requirements &&
        item.requirements.length > 0
      ) {
        result.children = item.requirements.map((requirement) =>
          mapToTree({
            ...requirement.item,
            total: total * requirement.count,
          })
        );
      }

      return result;
    };

    return { tree: mapToTree({ ...selectedItem, total: totalPerCycle }), uniqueResourses };
  }, [selectedItem, totalPerCycle]);

  return (
    <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", height: '100%' }}>
      <div style={{ display: "flex", flexDirection: "column", width: "60%", minWidth: 0, gap: '20px', height: '100%' }}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          backgroundColor: colors.background.paper,
          padding: "10px",
        }}>
          <div
            style={{
              flex: 1,
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(min(100%, 100px), 1fr))",
              gap: "clamp(10px, 2.5vw, 10px)",
              width: "100%",
              minWidth: 0,
              boxSizing: "border-box",
              minHeight: '30px'
            }}
          >
            {Object.values(uniqueResourses).map((item) => (
              <div key={item.name} style={{ display: "flex", alignItems: 'center', gap: 4 }}>
                <AssetImage
                  pathRelativeToAssets={item.image}
                  alt={item.name}
                  width="30px"
                  height="30px"
                />
                <div >{item.total}</div>
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            backgroundColor: colors.background.paper,
            padding: "20px",
            height: 'calc(100% - 40px)'
          }}
        >
          {tree ? (
            <DependencyTree
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
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {node.name}
                  </div>
                  <div
                    style={{
                      fontSize: "0.6rem",
                      opacity: 0.88,
                      lineHeight: 1,
                    }}
                  >
                    {Number.isInteger(node.total)
                      ? node.total
                      : node.total.toFixed(2)}
                  </div>
                </div>
              )}
            />
          ) : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 600 }}>
            Нет данных
          </div>}

        </div>
      </div>
      <div style={{
        backgroundColor: colors.background.paper,
        width: "40%",
        padding: "10px",
        height: 'calc(100% - 20px)',
      }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(min(100%, 100px), 1fr))",
            gap: "clamp(10px, 2.5vw, 10px)",
            minWidth: 0,
            boxSizing: "border-box",
          }}
        >
          {Object.values(food).map((item) => (
            <div
              key={item.name}
              style={{ display: "flex", minWidth: 0, minHeight: 0 }}
            >
              <Button
                variant="translucent"
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  minHeight: 0,
                  padding: "clamp(6px, 2vw, 12px)",
                  boxSizing: "border-box",
                }}
                onClick={() => setSelectedItem(item)}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    height: "100%",
                    width: "100%",
                  }}
                >
                  <div>{item.name}</div>
                  <AssetImage
                    pathRelativeToAssets={item.image}
                    alt={item.name}
                    width="100%"
                    height="100%"
                  />
                </div>
              </Button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
