import { ComponentConfig } from "@/core/types";
import styles from "./styles.module.css";
import { getClassNameFactory } from "@/core/lib";
import { Section } from "../../components/Section";
import { WithLayout, withLayout } from "../../components/Layout";

const getClassName = getClassNameFactory("CustomFlex", styles);

export type CustomFlexProps = WithLayout<{
  justifyContent: "start" | "center" | "end";
  direction: "row" | "column";
  gap: number;
  wrap: "wrap" | "nowrap";
}>;

const CustomFlexInternal: ComponentConfig<CustomFlexProps> = {
  fields: {
    direction: {
      label: "Direction",
      type: "radio",
      options: [
        { label: "Row", value: "row" },
        { label: "Column", value: "column" },
      ],
    },
    justifyContent: {
      label: "Justify Content",
      type: "radio",
      options: [
        { label: "Start", value: "start" },
        { label: "Center", value: "center" },
        { label: "End", value: "end" },
      ],
    },
    gap: {
      label: "Gap",
      type: "number",
      min: 0,
    },
    wrap: {
      label: "Wrap",
      type: "radio",
      options: [
        { label: "true", value: "wrap" },
        { label: "false", value: "nowrap" },
      ],
    },
  },
  defaultProps: {
    justifyContent: "start",
    direction: "row",
    gap: 24,
    wrap: "wrap",
    layout: {
      grow: true,
    },
  },
  render: ({ justifyContent, direction, gap, wrap, puck }) => {
    return (
      <Section style={{ height: "100%" }}>
        {puck.renderDropZone({
          zone: "items",
          overrideItem(item) {
            return {
              ...item,
              props: {
                ...item.props,
                text: "Mantap",
              },
            };
          },
        })}
      </Section>
    );
  },
};

export const CustomFlex = withLayout(CustomFlexInternal);
