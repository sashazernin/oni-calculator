import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
} from "react";
import RocketBuilder, {
  ROCKET_CELL_PX,
  ROCKET_GRID_COLUMNS,
} from "./RocketBuilder";
import styles from "./rocketBuilderScrollPane.module.css";
import { useTranslation } from "../../hooks/useTranslation";

export const ROCKET_MINIMAP_MAX_WIDTH_PX = 120;

export type RocketBuilderScrollPaneProps = ComponentProps<typeof RocketBuilder> & {
  className?: string;
  contentClassName?: string;
  style?: CSSProperties;
};

type Metrics = {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
  contentWidth: number;
  contentHeight: number;
};

export default function RocketBuilderScrollPane({
  className,
  contentClassName,
  style,
  ...builderProps
}: RocketBuilderScrollPaneProps) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startY: number;
    startScrollTop: number;
    thumbH: number;
    trackH: number;
  } | null>(null);

  const [metrics, setMetrics] = useState<Metrics>({
    scrollTop: 0,
    scrollHeight: 1,
    clientHeight: 1,
    contentWidth: 1,
    contentHeight: 1,
  });

  const { engineId, placements, inferredTankPlacements } = builderProps;

  const syncMetrics = useCallback(() => {
    const sc = scrollRef.current;
    const ct = contentRef.current;
    if (!sc || !ct) return;
    const inner = ct.firstElementChild;
    const innerEl =
      inner instanceof HTMLElement ? inner : null;
    const contentHeight = Math.max(
      innerEl?.offsetHeight ?? 0,
      innerEl?.scrollHeight ?? 0,
      ct.scrollHeight,
      ct.offsetHeight,
    );
    const contentWidth = Math.max(
      innerEl?.offsetWidth ?? 0,
      innerEl?.scrollWidth ?? 0,
      ct.offsetWidth,
    );
    setMetrics({
      scrollTop: sc.scrollTop,
      scrollHeight: sc.scrollHeight,
      clientHeight: sc.clientHeight,
      contentWidth,
      contentHeight,
    });
  }, []);

  useEffect(() => {
    const sc = scrollRef.current;
    const ct = contentRef.current;
    if (!sc || !ct) return;

    syncMetrics();
    const ro = new ResizeObserver(syncMetrics);
    ro.observe(sc);
    ro.observe(ct);
    sc.addEventListener("scroll", syncMetrics, { passive: true });
    window.addEventListener("resize", syncMetrics);

    return () => {
      ro.disconnect();
      sc.removeEventListener("scroll", syncMetrics);
      window.removeEventListener("resize", syncMetrics);
    };
  }, [syncMetrics, engineId, placements, inferredTankPlacements]);

  useEffect(() => {
    const rail = railRef.current;
    const sc = scrollRef.current;
    if (!rail || !sc || engineId == null) return;

    const onWheel = (e: WheelEvent) => {
      const range = sc.scrollHeight - sc.clientHeight;
      if (range <= 2) return;
      e.preventDefault();
      sc.scrollTop = Math.min(range, Math.max(0, sc.scrollTop + e.deltaY));
    };

    rail.addEventListener("wheel", onWheel, { passive: false });
    return () => rail.removeEventListener("wheel", onWheel);
  }, [engineId, placements, inferredTankPlacements]);

  const trackH = Math.max(metrics.clientHeight, 1);
  const contentH = Math.max(metrics.contentHeight, 1);
  /** Ширина превью: только сетка (в minimap нет боковых рельс). */
  const minimapContentW = ROCKET_GRID_COLUMNS * ROCKET_CELL_PX;
  /** Масштаб по высоте ракеты и ширине колонки (не по scrollHeight страницы). */
  const trackScale = Math.min(
    ROCKET_MINIMAP_MAX_WIDTH_PX / minimapContentW,
    trackH / contentH,
  );
  const scaledH = contentH * trackScale;
  const scaledW = minimapContentW * trackScale;
  const trackW = Math.min(ROCKET_MINIMAP_MAX_WIDTH_PX, scaledW);
  const minimapRailW = trackW + 8;
  const minimapRailMaxW = ROCKET_MINIMAP_MAX_WIDTH_PX + 8;
  const scrollRange = Math.max(
    metrics.scrollHeight - metrics.clientHeight,
    0,
  );
  const canScroll = scrollRange > 2;
  const scrollRatio =
    scrollRange > 0
      ? Math.min(1, Math.max(0, metrics.scrollTop / scrollRange))
      : 0;
  const thumbH = canScroll
    ? Math.max(20, (metrics.clientHeight / contentH) * scaledH)
    : scaledH;
  const thumbTravel = Math.max(scaledH - thumbH, 0);
  const thumbTop = canScroll
    ? Math.min(thumbTravel, scrollRatio * thumbTravel)
    : 0;

  const localYInBand = useCallback((clientY: number) => {
    const band = bandRef.current;
    if (!band) return 0;
    return clientY - band.getBoundingClientRect().top;
  }, []);

  const scrollFromClientY = useCallback(
    (clientY: number, centerOnThumb: boolean) => {
      const sc = scrollRef.current;
      if (!sc || !canScroll) return;
      const localY = Math.min(Math.max(localYInBand(clientY), 0), scaledH);
      const bandScrollable = Math.max(scaledH - thumbH, 1);
      const ratio = centerOnThumb
        ? Math.max(0, Math.min(1, (localY - thumbH / 2) / bandScrollable))
        : Math.max(0, Math.min(1, localY / scaledH));
      sc.scrollTop = ratio * scrollRange;
    },
    [canScroll, localYInBand, scaledH, thumbH, scrollRange],
  );

  const onTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canScroll || !engineId) return;
    const localY = localYInBand(e.clientY);
    if (localY < 0 || localY > scaledH) return;
    const onThumb = localY >= thumbTop && localY <= thumbTop + thumbH;
    const sc = scrollRef.current;
    if (!sc) return;

    if (onThumb) {
      dragRef.current = {
        startY: e.clientY,
        startScrollTop: sc.scrollTop,
        thumbH,
        trackH: scaledH,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
      e.preventDefault();
    } else {
      scrollFromClientY(e.clientY, true);
    }
  };

  const onTrackPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const sc = scrollRef.current;
    if (!drag || !sc) return;
    const dy = e.clientY - drag.startY;
    const trackRange = Math.max(drag.trackH - drag.thumbH, 1);
    const range = Math.max(sc.scrollHeight - sc.clientHeight, 0);
    sc.scrollTop = drag.startScrollTop + (dy / trackRange) * range;
  };

  const onTrackPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const showMinimap = engineId != null;

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      style={style}
    >
      <div ref={scrollRef} className={styles.mainScroll}>
        <div className={styles.mainScrollInner}>
          <div ref={contentRef} className={contentClassName}>
            <RocketBuilder {...builderProps} />
          </div>
        </div>
      </div>
      {showMinimap ? (
        <div
          ref={railRef}
          className={styles.minimapRail}
          style={{
            width: minimapRailW,
            maxWidth: minimapRailMaxW,
          }}
          aria-label={t("aria_rocket_minimap")}
          role="scrollbar"
          aria-orientation="vertical"
        >
          <div
            ref={trackRef}
            className={styles.minimapTrack}
            style={{
              width: trackW,
              maxWidth: ROCKET_MINIMAP_MAX_WIDTH_PX,
            }}
            onPointerDown={onTrackPointerDown}
            onPointerMove={onTrackPointerMove}
            onPointerUp={onTrackPointerUp}
            onPointerCancel={onTrackPointerUp}
          >
            <div
              ref={bandRef}
              className={styles.minimapBand}
              style={{ width: "100%", height: scaledH }}
            >
              <div
                className={styles.minimapRocket}
                style={{
                  width: minimapContentW,
                  height: contentH,
                  marginLeft: -minimapContentW / 2,
                  transform: `scale(${trackScale})`,
                  transformOrigin: "top center",
                }}
              >
                <RocketBuilder
                  {...builderProps}
                  minimap
                  showLaunchPlatform={!builderProps.readOnly}
                  onPlacementsChange={() => {}}
                />
              </div>
              {canScroll ? (
                <div
                  className={styles.viewport}
                  style={{ top: thumbTop, height: thumbH }}
                  aria-hidden
                />
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}