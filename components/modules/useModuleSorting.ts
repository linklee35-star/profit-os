"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";

const STORAGE_KEY = "margin-os-calculator-module-order";

type DropPosition = { id: string; after: boolean };

interface DragSession {
  id: string;
  title: string;
  pointerId: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  started: boolean;
  drop: DropPosition | null;
}

export function useModuleSorting(defaultOrder: string[]) {
  const list = useRef<HTMLDivElement>(null);
  const session = useRef<DragSession | null>(null);
  const scrollFrame = useRef<number | null>(null);
  const [order, setOrder] = useState(defaultOrder);
  const [preview, setPreview] = useState<DragSession | null>(null);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      if (!Array.isArray(saved)) return;
      const remaining = new Set(defaultOrder);
      const ordered = saved.filter((id): id is string => typeof id === "string" && remaining.delete(id));
      setOrder([...ordered, ...remaining]);
    } catch {
      // An unavailable or invalid preference can fall back to the default order.
    }
  }, [defaultOrder]);

  function getVisibleCards() {
    return Array.from(list.current?.querySelectorAll<HTMLElement>("[data-module-id]") ?? [])
      .filter((element) => element.getClientRects().length > 0);
  }

  function move(id: string, title: string, drop: DropPosition) {
    const visibleIds = new Set(getVisibleCards().map((element) => element.dataset.moduleId));
    const next = order.filter((card) => card !== id);
    const target = next.indexOf(drop.id);
    if (target < 0) return;
    next.splice(target + Number(drop.after), 0, id);
    if (next.every((card, index) => card === order[index])) return;

    setOrder(next);
    const position = next.filter((card) => visibleIds.has(card)).indexOf(id) + 1;
    setAnnouncement(`${title}已移到第 ${position} 位`);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // The new order still applies to the current page.
    }
  }

  function updateDrop(drag: DragSession) {
    const bounds = list.current?.getBoundingClientRect();
    let drop: DropPosition | null = null;
    if (bounds && drag.x >= bounds.left - 16 && drag.x <= bounds.right + 16 &&
      drag.y >= bounds.top - 16 && drag.y <= bounds.bottom + 16) {
      let closestDistance = Infinity;
      for (const card of getVisibleCards()) {
        const rect = card.getBoundingClientRect();
        const dx = Math.max(rect.left - drag.x, drag.x - rect.right, 0);
        const dy = Math.max(rect.top - drag.y, drag.y - rect.bottom, 0);
        const distance = Math.hypot(dx, dy);
        if (distance < closestDistance) {
          closestDistance = distance;
          const id = card.dataset.moduleId!;
          drop = id === drag.id ? null : { id, after: drag.y > rect.top + rect.height / 2 };
        }
      }
    }
    drag.drop = drop;
    setPreview({ ...drag });
  }

  function autoScroll() {
    scrollFrame.current = null;
    const drag = session.current;
    if (!drag?.started) return;
    const edge = 96;
    const speed = Math.max(0, drag.y - (window.innerHeight - edge))
      - Math.max(0, edge - drag.y);
    if (speed === 0) return;

    const previousY = window.scrollY;
    window.scrollBy(0, Math.round(speed / 6));
    if (window.scrollY !== previousY) {
      updateDrop(drag);
      scrollFrame.current = requestAnimationFrame(autoScroll);
    }
  }

  const onHandlePointerDown = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || !event.isPrimary || session.current) return;
    const id = event.currentTarget.closest<HTMLElement>("[data-module-id]")?.dataset.moduleId;
    if (!id) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    session.current = {
      id, title: event.currentTarget.dataset.moduleTitle ?? "",
      pointerId: event.pointerId,
      x: event.clientX, y: event.clientY,
      startX: event.clientX, startY: event.clientY,
      started: false, drop: null,
    };
  }, []);

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = session.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    drag.x = event.clientX;
    drag.y = event.clientY;
    if (!drag.started && Math.hypot(drag.x - drag.startX, drag.y - drag.startY) < 6) return;
    drag.started = true;
    updateDrop(drag);
    if (scrollFrame.current === null) scrollFrame.current = requestAnimationFrame(autoScroll);
  }

  function clearDrag() {
    if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = null;
    session.current = null;
    setPreview(null);
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const drag = session.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (drag.drop) move(drag.id, drag.title, drag.drop);
    clearDrag();
  }

  function onPointerCancel(event: PointerEvent<HTMLDivElement>) {
    if (session.current?.pointerId === event.pointerId) clearDrag();
  }

  function onHandleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (session.current) {
      if (event.key === "Escape") clearDrag();
      return;
    }
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    const id = event.currentTarget.closest<HTMLElement>("[data-module-id]")?.dataset.moduleId;
    const cards = getVisibleCards();
    const index = cards.findIndex((element) => element.dataset.moduleId === id);
    const after = event.key === "ArrowDown";
    const targetId = cards[index + (after ? 1 : -1)]?.dataset.moduleId;
    if (!id || index < 0 || !targetId) return;
    event.preventDefault();
    move(id, event.currentTarget.dataset.moduleTitle ?? "", { id: targetId, after });
  }

  useEffect(() => () => {
    if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
  }, []);

  return {
    list, order, preview, announcement, onHandlePointerDown, onHandleKeyDown,
    onPointerMove, onPointerUp, onPointerCancel,
  };
}
