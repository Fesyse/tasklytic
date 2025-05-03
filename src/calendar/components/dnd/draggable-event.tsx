"use client";

import { useRef } from "react";
import { useDrag } from "react-dnd";

import { cn } from "@/lib/utils";

import type { IEvent } from "@/calendar/interfaces";

export const ItemTypes = {
  EVENT: "event",
};

interface DraggableEventProps {
  event: IEvent;
  children: React.ReactNode;
}

export function DraggableEvent({ event, children }: DraggableEventProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.EVENT,
    item: { event },
    collect: monitor => ({ isDragging: monitor.isDragging() }),
  }));

  drag(ref);

  return (
    <div ref={ref} className={cn(isDragging && "opacity-40")}>
      {children}
    </div>
  );
}
