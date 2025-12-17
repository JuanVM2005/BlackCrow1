// src/ui/ScrollRail/useScrollRail.ts
"use client";

import * as React from "react";

export type UseScrollRailOptions = {
  minThumbSize?: number;
  autoHide?: boolean;
  idleDelay?: number;
  offsetTop?: number;
  offsetBottom?: number;

  thumbScale?: number;   // multiplica el tamaño proporcional
  thumbFixedPx?: number; // fuerza un alto fijo
};

type State = {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
  isDragging: boolean;
  isHovering: boolean;
  isIdle: boolean;
};

export function useScrollRail<T extends HTMLElement = HTMLDivElement>(
  refTrack: React.RefObject<T | null>,
  {
    minThumbSize = 48,
    autoHide = true,
    idleDelay = 900,
    offsetTop = 8,
    offsetBottom = 8,
    thumbScale = 1,
    thumbFixedPx,
  }: UseScrollRailOptions = {}
) {
  const rafRef = React.useRef<number | null>(null);
  const idleRef = React.useRef<number | null>(null);
  const dragStart = React.useRef<{ y: number; scrollTop: number } | null>(null);

  const initialScroller: HTMLElement | null =
    typeof document !== "undefined"
      ? (document.scrollingElement as HTMLElement) ?? document.documentElement
      : null;

  const [state, setState] = React.useState<State>(() => {
    const el = initialScroller ?? ({} as HTMLElement);
    return {
      scrollTop: el.scrollTop || 0,
      scrollHeight: el.scrollHeight || 0,
      clientHeight: el.clientHeight || 0,
      isDragging: false,
      isHovering: false,
      isIdle: false,
    };
  });

  const scroller: HTMLElement | null =
    typeof document !== "undefined"
      ? (document.scrollingElement as HTMLElement) ?? document.documentElement
      : null;

  const scheduleIdle = React.useCallback(() => {
    if (!autoHide) return;
    if (idleRef.current) window.clearTimeout(idleRef.current);
    idleRef.current = window.setTimeout(() => {
      setState((s) => ({ ...s, isIdle: true }));
    }, idleDelay);
  }, [autoHide, idleDelay]);

  const read = React.useCallback(() => {
    if (!scroller) return;
    setState((s) => ({
      ...s,
      scrollTop: scroller.scrollTop,
      scrollHeight: scroller.scrollHeight,
      clientHeight: scroller.clientHeight,
      isIdle: false,
    }));
    scheduleIdle();
    rafRef.current = null;
  }, [scroller, scheduleIdle]);

  const onScroll = React.useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = window.requestAnimationFrame(read);
  }, [read]);

  const onResize = React.useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = window.requestAnimationFrame(read);
  }, [read]);

  React.useEffect(() => {
    if (!scroller) return;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    const ro = new ResizeObserver(onResize);
    ro.observe(scroller);

    read();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (idleRef.current) clearTimeout(idleRef.current);
    };
  }, [scroller, onScroll, onResize, read]);

  const visible =
    state.scrollHeight > 0 && state.clientHeight > 0 && state.scrollHeight > state.clientHeight + 1;

  const trackPixels = Math.max(0, state.clientHeight - (offsetTop + offsetBottom));
  const scrollRange = Math.max(1, state.scrollHeight - state.clientHeight);

  // Tamaño proporcional base (evita /0)
  const proportional =
    state.scrollHeight > 0 ? (state.clientHeight / state.scrollHeight) * trackPixels : trackPixels;

  // Aplica fijo > escala > mínimo, y clamp al track
  const thumbRaw =
    typeof thumbFixedPx === "number" && thumbFixedPx >= 0
      ? thumbFixedPx
      : proportional * (thumbScale ?? 1);

  const thumbPx = Math.max(minThumbSize, Math.min(trackPixels, thumbRaw));
  const maxThumbOffset = Math.max(0, trackPixels - thumbPx);
  const thumbOffset = Math.min(
    maxThumbOffset,
    (state.scrollTop / scrollRange) * maxThumbOffset
  );

  // Pointer interactions
  const beginDrag = React.useCallback((clientY: number) => {
    if (!scroller) return;
    dragStart.current = { y: clientY, scrollTop: scroller.scrollTop };
    setState((s) => ({ ...s, isDragging: true, isIdle: false }));
  }, [scroller]);

  const doDrag = React.useCallback(
    (clientY: number) => {
      if (!scroller || !refTrack.current) return;
      const rect = refTrack.current.getBoundingClientRect();
      const trackH = rect.height;
      const thumbH = thumbPx;
      const maxThumb = Math.max(0, trackH - thumbH);
      const dy = clientY - rect.top - thumbH / 2;
      const clamped = Math.min(maxThumb, Math.max(0, dy));
      const ratio = maxThumb > 0 ? clamped / maxThumb : 0;
      const newTop = ratio * (scroller.scrollHeight - scroller.clientHeight);
      scroller.scrollTo({ top: newTop, behavior: "auto" });
    },
    [refTrack, scroller, thumbPx]
  );

  const endDrag = React.useCallback(() => {
    dragStart.current = null;
    setState((s) => ({ ...s, isDragging: false }));
    scheduleIdle();
  }, [scheduleIdle]);

  const onThumbPointerDown = React.useCallback(
    (e: React.PointerEvent) => {
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      beginDrag(e.clientY);
    },
    [beginDrag]
  );

  const onTrackPointerDown = React.useCallback(
    (e: React.PointerEvent) => {
      // Click en el track -> saltar a esa posición
      doDrag(e.clientY);
      beginDrag(e.clientY);
    },
    [beginDrag, doDrag]
  );

  React.useEffect(() => {
    if (!state.isDragging) return;
    const move = (e: PointerEvent) => doDrag(e.clientY);
    const up = () => endDrag();
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
    window.addEventListener("pointercancel", up, { once: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [state.isDragging, doDrag, endDrag]);

  const setHovering = React.useCallback((v: boolean) => {
    setState((s) => ({ ...s, isHovering: v, isIdle: v ? false : s.isIdle }));
  }, []);

  return {
    visible,
    // valores numéricos útiles
    scrollTop: state.scrollTop,
    scrollMax: Math.max(0, state.scrollHeight - state.clientHeight),
    trackPixels,
    thumbPx,
    thumbOffset,
    isDragging: state.isDragging,
    isHovering: state.isHovering,
    isIdle: state.isIdle,
    // handlers
    onThumbPointerDown,
    onTrackPointerDown,
    setHovering,
  };
}

export default useScrollRail;
