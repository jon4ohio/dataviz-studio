/**
 * Visualization + Presentation schema representation.
 * Meaning: docs/architecture/domain-model.md
 *
 * Public Platform API (stable after SPEC-003): VisualizationSpec.
 * Changes require an ADR or an approved breaking-change proposal.
 */

import type { Dataset } from "./data";

export type ChartType =
  | "line"
  | "bar"
  | "column"
  | "area"
  | "pie"
  | "doughnut"
  | "scatter"
  | "mixed";

export type VisualizationFamily = "cartesian" | "circular" | "hierarchy" | "flow" | "statistical" | "geographic";

export type ScaleKind = "linear" | "category" | "time" | "ordinal";

export type MarkType = "bar" | "line" | "area" | "point" | "arc" | "rule";

export interface ChannelEncoding {
  readonly fieldId: string;
  readonly scaleKind?: ScaleKind;
}

/** Mapping of fields to visual channels. */
export interface Encoding {
  readonly x?: ChannelEncoding;
  readonly y?: ChannelEncoding;
  readonly color?: ChannelEncoding;
  readonly size?: ChannelEncoding;
  readonly angle?: ChannelEncoding;
  readonly category?: ChannelEncoding;
}

/**
 * Composable mark unit within one visualization.
 * V1 may use a single primary layer; multi-layer is reserved vocabulary.
 */
export interface Layer {
  readonly id: string;
  readonly mark: MarkType;
  readonly encoding?: Encoding;
  readonly seriesId?: string;
}

export interface Annotation {
  readonly id: string;
  readonly kind: "note" | "reference-line" | "label";
  readonly text?: string;
  /** Intent only — renderer interprets placement. */
  readonly channel?: "x" | "y";
  readonly value?: string | number;
}

export interface LayoutSpec {
  readonly width: number;
  readonly height: number;
  readonly padding?: {
    readonly top?: number;
    readonly right?: number;
    readonly bottom?: number;
    readonly left?: number;
  };
}

export interface StyleSpec {
  readonly colorPalette?: readonly string[];
  readonly showGrid?: boolean;
  readonly cornerRadius?: number;
}

export interface LegendSpec {
  readonly show: boolean;
  readonly position: "top" | "bottom" | "left" | "right";
}

export const VISUALIZATION_SPEC_VERSION = 1 as const;

/**
 * Schema representation of a Visualization (Domain Model).
 * Must not contain renderer identity, SVG, or Figma node ids.
 */
export interface VisualizationSpec {
  readonly version: typeof VISUALIZATION_SPEC_VERSION;
  readonly id: string;
  readonly title: string;
  readonly kind: ChartType;
  readonly dataset: Dataset;
  readonly encoding: Encoding;
  readonly layers: readonly Layer[];
  readonly annotations: readonly Annotation[];
  readonly layout: LayoutSpec;
  readonly style: StyleSpec;
  readonly themeId: string | null;
  readonly legend: LegendSpec;
  /** Opaque platform metadata only — never engine config or SVG. */
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
}
