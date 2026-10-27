export {
  WIDGET_CATALOG,
  defaultHostForWidget,
  widgetIdSchema,
  type WidgetCatalogEntry,
  type WidgetId,
} from "./widgets.js";
export {
  EXAMPLE_HARNESS_LABELS,
  EXAMPLE_HARNESS_PATHS,
  exampleHarnessSchema,
  resolveExampleHarnessPath,
  type ExampleHarnessId,
} from "./example-harnesses.js";
export {
  hostFromPickerEntry,
  isPickerEntryActive,
  pickerCatalogForLayout,
  type PickerCatalogEntry,
} from "./catalog.js";
export {
  SPLIT_MAX,
  SPLIT_MIN,
  layoutSchema,
  paneHostSchema,
  paneSchema,
  parseScene,
  sceneSchema,
  type LayoutDef,
  type PaneDef,
  type PaneHost,
  type Scene,
} from "./scene.js";
