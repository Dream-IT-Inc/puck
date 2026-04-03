import { ReactNode, Ref, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

type RenderItemProps = {
  componentId: string;
  index: number;
  measureRef: Ref<HTMLElement>;
};

type VirtualizedDropZoneProps = {
  contentIds: string[];
  zoneCompound: string;
  renderItem: (props: RenderItemProps) => ReactNode;
};

export const VirtualizedDropZone = ({
  contentIds,
  renderItem,
}: VirtualizedDropZoneProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: contentIds.length,
    getScrollElement: () => {
      return (
        parentRef.current?.closest<HTMLElement>("[data-puck-preview]") ??
        (typeof document !== "undefined" ? document.documentElement : null)
      );
    },
    estimateSize: () => 250,
    overscan: 5,
    measureElement:
      typeof window !== "undefined"
        ? (element) => element.getBoundingClientRect().height
        : undefined,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      style={{
        height: `${virtualizer.getTotalSize()}px`,
        width: "100%",
        position: "relative",
      }}
    >
      {virtualItems.map((virtualItem) => {
        const componentId = contentIds[virtualItem.index];
        return (
          <div
            key={componentId}
            data-index={virtualItem.index}
            ref={virtualizer.measureElement}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem({
              componentId,
              index: virtualItem.index,
              measureRef: null,
            })}
          </div>
        );
      })}
    </div>
  );
};
