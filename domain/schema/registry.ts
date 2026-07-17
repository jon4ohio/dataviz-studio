/**
 * Visualization Registry — metadata only (not rendering).
 * Meaning: docs/architecture/domain-model.md
 *
 * Public Platform API (stable after SPEC-003): registry lookup / defaults.
 * Changes require an ADR or an approved breaking-change proposal.
 */

import type { Dataset } from "./data";
import {
  VISUALIZATION_SPEC_VERSION,
  type ChartType,
  type Encoding,
  type Layer,
  type MarkType,
  type VisualizationFamily,
  type VisualizationSpec
} from "./visualization";

export interface VisualizationKindMeta {
  readonly kind: ChartType;
  readonly family: VisualizationFamily;
  readonly label: string;
  /** When false, kind is listed but has no full default preset yet. */
  readonly hasDefaults: boolean;
  readonly supportedChannels: readonly (keyof Encoding)[];
  readonly defaultMark: MarkType;
  readonly capabilities: {
    readonly multiSeries: boolean;
    readonly requiresCategory: boolean;
    readonly requiresTwoMeasures: boolean;
  };
}

const KIND_META: readonly VisualizationKindMeta[] = [
  {
    kind: "bar",
    family: "cartesian",
    label: "Bar",
    hasDefaults: true,
    supportedChannels: ["category", "y", "color"],
    defaultMark: "bar",
    capabilities: { multiSeries: true, requiresCategory: true, requiresTwoMeasures: false }
  },
  {
    kind: "column",
    family: "cartesian",
    label: "Column",
    hasDefaults: true,
    supportedChannels: ["category", "y", "color"],
    defaultMark: "bar",
    capabilities: { multiSeries: true, requiresCategory: true, requiresTwoMeasures: false }
  },
  {
    kind: "line",
    family: "cartesian",
    label: "Line",
    hasDefaults: true,
    supportedChannels: ["x", "y", "color"],
    defaultMark: "line",
    capabilities: { multiSeries: true, requiresCategory: false, requiresTwoMeasures: false }
  },
  {
    kind: "area",
    family: "cartesian",
    label: "Area",
    hasDefaults: true,
    supportedChannels: ["x", "y", "color"],
    defaultMark: "area",
    capabilities: { multiSeries: true, requiresCategory: false, requiresTwoMeasures: false }
  },
  {
    kind: "scatter",
    family: "cartesian",
    label: "Scatter",
    hasDefaults: true,
    supportedChannels: ["x", "y", "color", "size"],
    defaultMark: "point",
    capabilities: { multiSeries: true, requiresCategory: false, requiresTwoMeasures: true }
  },
  {
    kind: "mixed",
    family: "cartesian",
    label: "Mixed",
    hasDefaults: true,
    supportedChannels: ["x", "y", "category", "color"],
    defaultMark: "bar",
    capabilities: { multiSeries: true, requiresCategory: false, requiresTwoMeasures: false }
  },
  {
    kind: "pie",
    family: "circular",
    label: "Pie",
    hasDefaults: false,
    supportedChannels: ["angle", "color", "category"],
    defaultMark: "arc",
    capabilities: { multiSeries: false, requiresCategory: true, requiresTwoMeasures: false }
  },
  {
    kind: "doughnut",
    family: "circular",
    label: "Doughnut",
    hasDefaults: false,
    supportedChannels: ["angle", "color", "category"],
    defaultMark: "arc",
    capabilities: { multiSeries: false, requiresCategory: true, requiresTwoMeasures: false }
  }
];

const BY_KIND = new Map(KIND_META.map((m) => [m.kind, m]));

export function listVisualizationKinds(): readonly VisualizationKindMeta[] {
  return KIND_META;
}

export function getVisualizationKind(kind: ChartType): VisualizationKindMeta | undefined {
  return BY_KIND.get(kind);
}

export function isRegisteredKind(kind: string): kind is ChartType {
  return BY_KIND.has(kind as ChartType);
}

function sampleCartesianDataset(): Dataset {
  return {
    id: "sample",
    fields: [
      { id: "category", name: "Category", role: "dimension", valueType: "string" },
      { id: "value", name: "Value", role: "measure", valueType: "number" }
    ],
    rows: [
      ["A", 12],
      ["B", 19],
      ["C", 8],
      ["D", 15]
    ],
    series: [{ id: "s1", name: "Series 1", fieldIds: ["value"] }]
  };
}

function sampleScatterDataset(): Dataset {
  return {
    id: "sample-scatter",
    fields: [
      { id: "x", name: "X", role: "measure", valueType: "number" },
      { id: "y", name: "Y", role: "measure", valueType: "number" }
    ],
    rows: [
      [1, 4],
      [2, 7],
      [3, 5],
      [4, 9]
    ]
  };
}

function defaultEncoding(kind: ChartType): Encoding {
  switch (kind) {
    case "bar":
    case "column":
      return {
        category: { fieldId: "category", scaleKind: "category" },
        y: { fieldId: "value", scaleKind: "linear" }
      };
    case "line":
    case "area":
    case "mixed":
      return {
        x: { fieldId: "category", scaleKind: "category" },
        y: { fieldId: "value", scaleKind: "linear" }
      };
    case "scatter":
      return {
        x: { fieldId: "x", scaleKind: "linear" },
        y: { fieldId: "y", scaleKind: "linear" }
      };
    case "pie":
    case "doughnut":
      return {
        category: { fieldId: "category", scaleKind: "category" },
        angle: { fieldId: "value", scaleKind: "linear" }
      };
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

function defaultLayers(kind: ChartType, meta: VisualizationKindMeta): Layer[] {
  return [{ id: "primary", mark: meta.defaultMark, encoding: defaultEncoding(kind) }];
}

/** Build a default VisualizationSpec for kinds with `hasDefaults`. */
export function createDefaultVisualizationSpec(
  kind: ChartType,
  overrides?: Partial<Pick<VisualizationSpec, "id" | "title">>
): VisualizationSpec {
  const meta = getVisualizationKind(kind);
  if (!meta?.hasDefaults) {
    throw new Error(`No default preset for visualization kind: ${kind}`);
  }
  const dataset = kind === "scatter" ? sampleScatterDataset() : sampleCartesianDataset();
  const encoding = defaultEncoding(kind);
  return {
    version: VISUALIZATION_SPEC_VERSION,
    id: overrides?.id ?? `viz-${kind}`,
    title: overrides?.title ?? meta.label,
    kind,
    dataset,
    encoding,
    layers: defaultLayers(kind, meta),
    annotations: [],
    layout: { width: 640, height: 400 },
    style: { showGrid: true },
    themeId: null,
    legend: { show: true, position: "bottom" },
    metadata: {}
  };
}
