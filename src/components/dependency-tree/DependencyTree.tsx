import {
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ThemeContext } from "../../providers/app-theme-provider";
import type { GameNode } from "../../types/game-data-types";

export type DependencyTreeNode = {
  name: string;
  image: string;
  total: number;
  type: GameNode["type"];
  calory?: number;
  children?: DependencyTreeNode[];
  item: GameNode;
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

const DEPTREE_COL_ATTR = "data-dep-tree-col";

function directRowColumns(row: HTMLElement): HTMLElement[] {
  return Array.from(row.children).filter(
    (el): el is HTMLElement => el instanceof HTMLElement && el.hasAttribute(DEPTREE_COL_ATTR),
  );
}

type MultiChildRowProps = {
  n: number;
  childNodes: DependencyTreeNode[];
  item: (node: DependencyTreeNode) => ReactNode;
  nodeSize: number;
  edgeColor: string;
  nodeBorder: string;
  nodeBg: string;
  nodeRingShadow: string;
  vLine: CSSProperties;
};

function MultiChildRow({
  n,
  childNodes,
  item,
  nodeSize,
  edgeColor,
  nodeBorder,
  nodeBg,
  nodeRingShadow,
  vLine,
}: MultiChildRowProps) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [hBar, setHBar] = useState({ leftPx: 0, widthPx: 0 });

  const updateHorizontalBar = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;
    /* Только прямые дочерние колонки: querySelectorAll тянет вложенные ряды (иначе
       «последняя» = самая глубокая вправо, линия уезжала за границы ветки). */
    const cols = directRowColumns(row);
    if (cols.length < 2) {
      setHBar({ leftPx: 0, widthPx: 0 });
      return;
    }
    const rowRect = row.getBoundingClientRect();
    const r0 = cols[0].getBoundingClientRect();
    const r1 = cols[cols.length - 1].getBoundingClientRect();
    const c0 = r0.left + r0.width / 2 - rowRect.left;
    const c1 = r1.left + r1.width / 2 - rowRect.left;
    setHBar({ leftPx: c0, widthPx: Math.max(0, c1 - c0) });
  }, []);

  useLayoutEffect(() => {
    updateHorizontalBar();
    const row = rowRef.current;
    if (!row) return;
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(updateHorizontalBar);
    });
    ro.observe(row);
    for (const c of directRowColumns(row)) {
      ro.observe(c);
    }
    return () => ro.disconnect();
  }, [updateHorizontalBar, n, childNodes]);

  return (
    <div
      ref={rowRef}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: GAP,
        alignSelf: "center",
        width: "fit-content",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      {n > 1 ? (
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: hBar.leftPx,
            width: hBar.widthPx,
            height: 2,
            background: edgeColor,
            /* до первого layout + measure не используем %, чтобы линия не тянулась на всю ширину */
            visibility: hBar.widthPx > 0 ? "visible" : "hidden",
          }}
        />
      ) : null}

      {childNodes.map((child, index) => (
        <div
          key={`${index}-${child.name}`}
          {...{ [DEPTREE_COL_ATTR]: "" }}
          style={{
            flex: "0 0 auto",
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
  );
}

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

          <MultiChildRow
            n={n}
            childNodes={children!}
            item={item}
            nodeSize={nodeSize}
            edgeColor={edgeColor}
            nodeBorder={nodeBorder}
            nodeBg={nodeBg}
            nodeRingShadow={nodeRingShadow}
            vLine={vLine}
          />
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
  const edgeColor = colors.border.main;
  const nodeBorder = colors.border.main;
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
