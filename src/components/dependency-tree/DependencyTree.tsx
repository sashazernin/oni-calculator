import { useContext, type CSSProperties, type ReactNode } from "react";
import { ThemeContext } from "../../providers/AppThemeProvider";

export type DependencyTreeNode = {
  name: string;
  image: string;
  total: number;
  children?: DependencyTreeNode[];
};

export type DependencyTreeProps = {
  root: DependencyTreeNode | null;
  /** Содержимое внутри круглого узла. */
  item: (node: DependencyTreeNode) => ReactNode;
  /** Диаметр узла (px). */
  nodeSize?: number;
};

const STEM = 22;
const GAP = 8;

type BranchProps = {
  node: DependencyTreeNode;
  item: (node: DependencyTreeNode) => ReactNode;
  nodeSize: number;
  edgeColor: string;
  nodeBorder: string;
  nodeBg: string;
  nodeRingShadow: string;
};

function Branch({ node, item, nodeSize, edgeColor, nodeBorder, nodeBg, nodeRingShadow }: BranchProps) {
  const children = node.children;
  const n = children?.length ?? 0;

  const circleStyle: CSSProperties = {
    width: nodeSize,
    height: nodeSize,
    borderRadius: "50%",
    boxSizing: "border-box",
    border: `2px solid ${nodeBorder}`,
    background: nodeBg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
    boxShadow: nodeRingShadow,
  };

  const vLine: CSSProperties = {
    width: 2,
    flexShrink: 0,
    background: edgeColor,
  };

  if (n === 1) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={circleStyle}>{item(node)}</div>
        <div style={{ ...vLine, height: STEM * 2 }} />
        <Branch
          node={children![0]}
          item={item}
          nodeSize={nodeSize}
          edgeColor={edgeColor}
          nodeBorder={nodeBorder}
          nodeBg={nodeBg}
          nodeRingShadow={nodeRingShadow}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={circleStyle}>{item(node)}</div>

      {n > 0 ? (
        <>
          <div style={{ ...vLine, height: STEM }} />

          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "center",
              gap: GAP,
            }}
          >
            {n > 1 ? (
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: 0,
                  left: `calc(100% / ${2 * n})`,
                  width: `calc(100% * ${n - 1} / ${n})`,
                  height: 2,
                  background: edgeColor,
                }}
              />
            ) : null}

            {children!.map((child, index) => (
              <div
                key={`${index}-${child.name}`}
                style={{
                  flex: "1 1 0",
                  minWidth: nodeSize,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div style={{ ...vLine, height: STEM }} />
                <Branch
                  node={child}
                  item={item}
                  nodeSize={nodeSize}
                  edgeColor={edgeColor}
                  nodeBorder={nodeBorder}
                  nodeBg={nodeBg}
                  nodeRingShadow={nodeRingShadow}
                />
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export interface IDependencyTreeProps {
  root: DependencyTreeNode | null;
  item: (node: DependencyTreeNode) => ReactNode;
  nodeSize?: number;
  style?: CSSProperties;
}

export function DependencyTree({ root, item, nodeSize = 92, style }: IDependencyTreeProps) {
  const { colors } = useContext(ThemeContext);
  const edgeColor = `color-mix(in srgb, ${colors.text.primary} 45%, transparent)`;
  const nodeBorder = `color-mix(in srgb, ${colors.text.primary} 35%, transparent)`;
  const nodeBg = colors.background.paper;
  const nodeRingShadow = "0 2px 6px color-mix(in srgb, #000 20%, transparent)";

  if (!root) {
    return null;
  }

  return (
    <div
      style={{
        width: "100%",
        overflow: "auto",
        padding: "12px 8px",
        boxSizing: "border-box",
        ...style,
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", minWidth: "min-content" }}>
        <Branch
          node={root}
          item={item}
          nodeSize={nodeSize}
          edgeColor={edgeColor}
          nodeBorder={nodeBorder}
          nodeBg={nodeBg}
          nodeRingShadow={nodeRingShadow}
        />
      </div>
    </div>
  );
}
