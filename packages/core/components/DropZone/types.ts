import { CSSProperties, ElementType } from "react";
import { ComponentData, DragAxis } from "../../types";

export type DropZoneProps = {
  zone: string;
  allow?: string[];
  disallow?: string[];
  style?: CSSProperties;
  minEmptyHeight?: number;
  className?: string;
  collisionAxis?: DragAxis;
  overrideItem?: (item: ComponentData) => ComponentData | null;
  as?: ElementType;
};
