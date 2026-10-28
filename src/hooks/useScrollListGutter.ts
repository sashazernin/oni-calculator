import { useEffect, useRef } from "react";

const SCROLLBAR_CLASS = "scroll-list-has-scrollbar";

/** Вертикальный скролл — класс для уменьшённого `padding-right` (см. CSS). */
export function useScrollListGutter<T extends HTMLElement>(
  refreshDeps: readonly unknown[] = [],
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const hasVerticalScroll = el.scrollHeight > el.clientHeight + 1;
      el.classList.toggle(SCROLLBAR_CLASS, hasVerticalScroll);
    };

    update();

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(el);

    const mutationObserver = new MutationObserver(update);
    mutationObserver.observe(el, { childList: true, subtree: true });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refreshDeps пересчитывают скролл после смены списка
  }, refreshDeps);

  return ref;
}
