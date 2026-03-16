"use client";

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { rootDroppableId, rootZone } from "../../lib/root-droppable-id";
import { setupZone } from "../../lib/data/setup-zone";
import {
  ComponentData,
  Config,
  Data,
  Metadata,
  UserGenerics,
  WithPuckProps,
} from "../../types";
import { useSlots } from "../../lib/use-slots";
import { SlotRenderPure } from "../SlotRender/server";
import { DropZoneProps } from "../DropZone/types";

// Lightweight render context — same shape as client Render's renderContext
const renderContext = createContext<{
  config: Config;
  data: Data;
  metadata: Metadata;
}>({
  config: { components: {} },
  data: { root: {}, content: [] },
  metadata: {},
});

// Lightweight dropzone context — same shape as DropZone/context.tsx but no store dependency
type DropZoneContextType = {
  areaId?: string;
  mode?: "edit" | "render";
  depth: number;
} | null;

const dropZoneCtx = createContext<DropZoneContextType>(null);

// Lightweight provider — just wraps context, no useAppStore
const DropZoneProviderPure = ({
  children,
  value,
}: {
  children: ReactNode;
  value: DropZoneContextType;
}) => {
  return (
    <dropZoneCtx.Provider value={value}>{children}</dropZoneCtx.Provider>
  );
};

// Matches client DropZoneRenderItem (DropZone/index.tsx lines 527-581)
const DropZoneRenderItem = ({
  config,
  item,
  metadata,
}: {
  config: Config;
  item: ComponentData;
  metadata: Metadata;
}) => {
  const Component = config.components[item.type];

  const props = useSlots(config, item, (slotProps) => (
    <SlotRenderPure {...slotProps} config={config} metadata={metadata} />
  )) as WithPuckProps<ComponentData["props"]>;

  const nextContextValue = useMemo<DropZoneContextType>(
    () => ({
      areaId: props.id,
      depth: 1,
    }),
    [props]
  );

  const renderDropZone = useCallback(
    (dropZoneProps: DropZoneProps) => (
      <DropZoneRenderPure {...dropZoneProps} />
    ),
    []
  );

  return (
    <DropZoneProviderPure key={props.id} value={nextContextValue}>
      <Component.render
        {...props}
        puck={{
          ...props.puck,
          renderDropZone,
          metadata: { ...metadata, ...Component.metadata },
        }}
      />
    </DropZoneProviderPure>
  );
};

// Matches client DropZoneRender (DropZone/index.tsx lines 587-645)
const DropZoneRenderPure = ({
  className,
  style,
  zone,
}: DropZoneProps) => {
  const ctx = useContext(dropZoneCtx);
  const { areaId = "root" } = ctx || {};
  const { config, data, metadata } = useContext(renderContext);

  let zoneCompound = `${areaId}:${zone}`;
  let content = data?.content || [];

  if (!data || !config) {
    return null;
  }

  if (zoneCompound !== rootDroppableId) {
    content = setupZone(data, zoneCompound).zones[zoneCompound];
  }

  return (
    <div className={className} style={style}>
      {content.map((item) => {
        const Component = config.components[item.type];

        if (Component) {
          return (
            <DropZoneRenderItem
              key={item.props.id}
              config={config}
              item={item}
              metadata={metadata}
            />
          );
        }

        return null;
      })}
    </div>
  );
};

const DropZonePure = (props: DropZoneProps) => (
  <DropZoneRenderPure {...props} />
);

export function Render<
  UserConfig extends Config = Config,
  G extends UserGenerics<UserConfig> = UserGenerics<UserConfig>
>({
  config,
  data,
  metadata = {},
}: {
  config: UserConfig;
  data: Partial<G["UserData"] | Data>;
  metadata?: Metadata;
}) {
  const defaultedData = {
    ...data,
    root: data.root || {},
    content: data.content || [],
  } as G["UserData"];

  // DEPRECATED
  const rootProps =
    "props" in defaultedData.root
      ? defaultedData.root.props
      : defaultedData.root;
  const title = rootProps?.title || "";

  const pageProps = {
    ...rootProps,
    puck: {
      renderDropZone: DropZonePure,
      isEditing: false,
      dragRef: null,
      metadata: metadata,
    },
    title,
    editMode: false,
    id: "puck-root",
  };

  const propsWithSlots = useSlots(
    config,
    { type: "root", props: pageProps },
    (props) => <SlotRenderPure {...props} config={config} metadata={metadata} />
  );

  const nextContextValue = useMemo<DropZoneContextType>(
    () => ({
      mode: "render",
      depth: 0,
    }),
    []
  );

  if (config.root?.render) {
    return (
      <renderContext.Provider
        value={{ config, data: defaultedData, metadata }}
      >
        <DropZoneProviderPure value={nextContextValue}>
          <config.root.render {...propsWithSlots}>
            <DropZoneRenderPure zone={rootZone} />
          </config.root.render>
        </DropZoneProviderPure>
      </renderContext.Provider>
    );
  }

  return (
    <renderContext.Provider value={{ config, data: defaultedData, metadata }}>
      <DropZoneProviderPure value={nextContextValue}>
        <DropZoneRenderPure zone={rootZone} />
      </DropZoneProviderPure>
    </renderContext.Provider>
  );
}
