/**
 * Staged validation: parse → structural → semantic → normalize.
 * Meaning: docs/architecture/domain-model.md
 */

import { assertDatasetStructure, type CellValue, type Dataset, type Field, type Series } from "./data";
import { createDefaultVisualizationSpec, getVisualizationKind, isRegisteredKind } from "./registry";
import {
  VISUALIZATION_SPEC_VERSION,
  type Annotation,
  type ChannelEncoding,
  type ChartType,
  type Encoding,
  type Layer,
  type LegendSpec,
  type LayoutSpec,
  type MarkType,
  type ScaleKind,
  type StyleSpec,
  type VisualizationSpec
} from "./visualization";

export type ValidationSeverity = "error" | "warning";

export interface ValidationIssue {
  readonly path: string;
  readonly message: string;
  readonly severity: ValidationSeverity;
}

export interface ValidationResult {
  readonly ok: boolean;
  readonly issues: readonly ValidationIssue[];
  readonly value?: VisualizationSpec;
}

const FORBIDDEN_TOP_KEYS = new Set([
  "renderer",
  "rendererId",
  "engine",
  "echarts",
  "option",
  "svg",
  "nodeId",
  "figmaNodeId"
]);

function err(path: string, message: string): ValidationIssue {
  return { path, message, severity: "error" };
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isCellValue(v: unknown): v is CellValue {
  return v === null || typeof v === "string" || typeof v === "number" || typeof v === "boolean";
}

const SCALE_KINDS: readonly ScaleKind[] = ["linear", "category", "time", "ordinal"];
const MARK_TYPES: readonly MarkType[] = ["bar", "line", "area", "point", "arc", "rule"];

function parseChannel(raw: unknown, path: string, issues: ValidationIssue[]): ChannelEncoding | undefined {
  if (raw === undefined) return undefined;
  if (!isPlainObject(raw)) {
    issues.push(err(path, "Channel encoding must be an object"));
    return undefined;
  }
  if (typeof raw.fieldId !== "string" || !raw.fieldId) {
    issues.push(err(`${path}.fieldId`, "fieldId must be a non-empty string"));
    return undefined;
  }
  if (raw.scaleKind !== undefined) {
    if (typeof raw.scaleKind !== "string" || !SCALE_KINDS.includes(raw.scaleKind as ScaleKind)) {
      issues.push(err(`${path}.scaleKind`, `Invalid scaleKind`));
      return undefined;
    }
  }
  return {
    fieldId: raw.fieldId,
    ...(typeof raw.scaleKind === "string" ? { scaleKind: raw.scaleKind as ScaleKind } : {})
  };
}

function parseEncoding(raw: unknown, path: string, issues: ValidationIssue[]): Encoding {
  if (raw === undefined) return {};
  if (!isPlainObject(raw)) {
    issues.push(err(path, "encoding must be an object"));
    return {};
  }
  return {
    x: parseChannel(raw.x, `${path}.x`, issues),
    y: parseChannel(raw.y, `${path}.y`, issues),
    color: parseChannel(raw.color, `${path}.color`, issues),
    size: parseChannel(raw.size, `${path}.size`, issues),
    angle: parseChannel(raw.angle, `${path}.angle`, issues),
    category: parseChannel(raw.category, `${path}.category`, issues)
  };
}

function parseField(raw: unknown, path: string, issues: ValidationIssue[]): Field | null {
  if (!isPlainObject(raw)) {
    issues.push(err(path, "Field must be an object"));
    return null;
  }
  const roles = ["dimension", "measure", "none"] as const;
  const types = ["string", "number", "boolean", "datetime", "unknown"] as const;
  if (typeof raw.id !== "string" || !raw.id) {
    issues.push(err(`${path}.id`, "id required"));
    return null;
  }
  if (typeof raw.name !== "string") {
    issues.push(err(`${path}.name`, "name required"));
    return null;
  }
  if (!roles.includes(raw.role as (typeof roles)[number])) {
    issues.push(err(`${path}.role`, "invalid role"));
    return null;
  }
  if (!types.includes(raw.valueType as (typeof types)[number])) {
    issues.push(err(`${path}.valueType`, "invalid valueType"));
    return null;
  }
  return {
    id: raw.id,
    name: raw.name,
    role: raw.role as Field["role"],
    valueType: raw.valueType as Field["valueType"]
  };
}

function parseDataset(raw: unknown, path: string, issues: ValidationIssue[]): Dataset | null {
  if (!isPlainObject(raw)) {
    issues.push(err(path, "dataset must be an object"));
    return null;
  }
  if (typeof raw.id !== "string" || !raw.id) {
    issues.push(err(`${path}.id`, "id required"));
    return null;
  }
  if (!Array.isArray(raw.fields)) {
    issues.push(err(`${path}.fields`, "fields must be an array"));
    return null;
  }
  if (!Array.isArray(raw.rows)) {
    issues.push(err(`${path}.rows`, "rows must be an array"));
    return null;
  }
  const fields: Field[] = [];
  raw.fields.forEach((f, i) => {
    const parsed = parseField(f, `${path}.fields[${i}]`, issues);
    if (parsed) fields.push(parsed);
  });
  const rows: CellValue[][] = [];
  raw.rows.forEach((row, i) => {
    if (!Array.isArray(row)) {
      issues.push(err(`${path}.rows[${i}]`, "row must be an array"));
      return;
    }
    const cells: CellValue[] = [];
    row.forEach((cell, j) => {
      if (!isCellValue(cell)) {
        issues.push(err(`${path}.rows[${i}][${j}]`, "invalid cell value"));
      } else {
        cells.push(cell);
      }
    });
    rows.push(cells);
  });
  let series: Series[] | undefined;
  if (raw.series !== undefined) {
    if (!Array.isArray(raw.series)) {
      issues.push(err(`${path}.series`, "series must be an array"));
    } else {
      series = [];
      raw.series.forEach((s, i) => {
        if (!isPlainObject(s)) {
          issues.push(err(`${path}.series[${i}]`, "series entry must be an object"));
          return;
        }
        if (typeof s.id !== "string" || typeof s.name !== "string" || !Array.isArray(s.fieldIds)) {
          issues.push(err(`${path}.series[${i}]`, "invalid series shape"));
          return;
        }
        if (!s.fieldIds.every((id) => typeof id === "string")) {
          issues.push(err(`${path}.series[${i}].fieldIds`, "fieldIds must be strings"));
          return;
        }
        series!.push({ id: s.id, name: s.name, fieldIds: s.fieldIds as string[] });
      });
    }
  }
  return { id: raw.id, fields, rows, ...(series ? { series } : {}) };
}

function parseLayer(raw: unknown, path: string, issues: ValidationIssue[]): Layer | null {
  if (!isPlainObject(raw)) {
    issues.push(err(path, "layer must be an object"));
    return null;
  }
  if (typeof raw.id !== "string" || !raw.id) {
    issues.push(err(`${path}.id`, "id required"));
    return null;
  }
  if (typeof raw.mark !== "string" || !MARK_TYPES.includes(raw.mark as MarkType)) {
    issues.push(err(`${path}.mark`, "invalid mark"));
    return null;
  }
  return {
    id: raw.id,
    mark: raw.mark as MarkType,
    ...(raw.encoding !== undefined ? { encoding: parseEncoding(raw.encoding, `${path}.encoding`, issues) } : {}),
    ...(typeof raw.seriesId === "string" ? { seriesId: raw.seriesId } : {})
  };
}

function parseAnnotation(raw: unknown, path: string, issues: ValidationIssue[]): Annotation | null {
  if (!isPlainObject(raw)) {
    issues.push(err(path, "annotation must be an object"));
    return null;
  }
  const kinds = ["note", "reference-line", "label"] as const;
  if (typeof raw.id !== "string" || !raw.id) {
    issues.push(err(`${path}.id`, "id required"));
    return null;
  }
  if (!kinds.includes(raw.kind as (typeof kinds)[number])) {
    issues.push(err(`${path}.kind`, "invalid kind"));
    return null;
  }
  return {
    id: raw.id,
    kind: raw.kind as Annotation["kind"],
    ...(typeof raw.text === "string" ? { text: raw.text } : {}),
    ...(raw.channel === "x" || raw.channel === "y" ? { channel: raw.channel } : {}),
    ...(typeof raw.value === "string" || typeof raw.value === "number" ? { value: raw.value } : {})
  };
}

function parseLayout(raw: unknown, path: string, issues: ValidationIssue[]): LayoutSpec | null {
  if (!isPlainObject(raw)) {
    issues.push(err(path, "layout must be an object"));
    return null;
  }
  if (typeof raw.width !== "number" || typeof raw.height !== "number") {
    issues.push(err(path, "width and height must be numbers"));
    return null;
  }
  return {
    width: raw.width,
    height: raw.height,
    ...(isPlainObject(raw.padding)
      ? {
          padding: {
            ...(typeof raw.padding.top === "number" ? { top: raw.padding.top } : {}),
            ...(typeof raw.padding.right === "number" ? { right: raw.padding.right } : {}),
            ...(typeof raw.padding.bottom === "number" ? { bottom: raw.padding.bottom } : {}),
            ...(typeof raw.padding.left === "number" ? { left: raw.padding.left } : {})
          }
        }
      : {})
  };
}

function parseStyle(raw: unknown, path: string, issues: ValidationIssue[]): StyleSpec {
  if (raw === undefined) return {};
  if (!isPlainObject(raw)) {
    issues.push(err(path, "style must be an object"));
    return {};
  }
  const colorPalette =
    Array.isArray(raw.colorPalette) && raw.colorPalette.every((c) => typeof c === "string")
      ? (raw.colorPalette as string[])
      : undefined;
  if (raw.colorPalette !== undefined && !colorPalette) {
    issues.push(err(`${path}.colorPalette`, "must be string[]"));
  }
  return {
    ...(colorPalette ? { colorPalette } : {}),
    ...(typeof raw.showGrid === "boolean" ? { showGrid: raw.showGrid } : {}),
    ...(typeof raw.cornerRadius === "number" ? { cornerRadius: raw.cornerRadius } : {})
  };
}

function parseLegend(raw: unknown, path: string, issues: ValidationIssue[]): LegendSpec | null {
  if (!isPlainObject(raw)) {
    issues.push(err(path, "legend must be an object"));
    return null;
  }
  const positions = ["top", "bottom", "left", "right"] as const;
  if (typeof raw.show !== "boolean") {
    issues.push(err(`${path}.show`, "show must be boolean"));
    return null;
  }
  if (!positions.includes(raw.position as (typeof positions)[number])) {
    issues.push(err(`${path}.position`, "invalid position"));
    return null;
  }
  return { show: raw.show, position: raw.position as LegendSpec["position"] };
}

/**
 * Parse unknown JSON into a loosely shaped VisualizationSpec candidate.
 * Does not run semantic rules or normalization.
 */
export function parseVisualizationSpec(input: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isPlainObject(input)) {
    return { ok: false, issues: [err("", "Root must be an object")] };
  }
  for (const key of Object.keys(input)) {
    if (FORBIDDEN_TOP_KEYS.has(key)) {
      issues.push(err(key, `Forbidden implementation field: ${key}`));
    }
  }
  if (input.version !== VISUALIZATION_SPEC_VERSION) {
    issues.push(err("version", `Expected version ${VISUALIZATION_SPEC_VERSION}`));
  }
  if (typeof input.id !== "string" || !input.id) {
    issues.push(err("id", "id required"));
  }
  if (typeof input.title !== "string") {
    issues.push(err("title", "title must be a string"));
  }
  if (typeof input.kind !== "string" || !isRegisteredKind(input.kind)) {
    issues.push(err("kind", "unknown or missing chart kind"));
  }
  const dataset = parseDataset(input.dataset, "dataset", issues);
  const encoding = parseEncoding(input.encoding, "encoding", issues);
  const layers: Layer[] = [];
  if (!Array.isArray(input.layers)) {
    issues.push(err("layers", "layers must be an array"));
  } else {
    input.layers.forEach((l, i) => {
      const layer = parseLayer(l, `layers[${i}]`, issues);
      if (layer) layers.push(layer);
    });
  }
  const annotations: Annotation[] = [];
  if (input.annotations === undefined) {
    // ok — treat as empty after normalize
  } else if (!Array.isArray(input.annotations)) {
    issues.push(err("annotations", "annotations must be an array"));
  } else {
    input.annotations.forEach((a, i) => {
      const ann = parseAnnotation(a, `annotations[${i}]`, issues);
      if (ann) annotations.push(ann);
    });
  }
  const layout = parseLayout(input.layout, "layout", issues);
  const style = parseStyle(input.style, "style", issues);
  const legend = parseLegend(input.legend, "legend", issues);
  if (input.themeId !== null && input.themeId !== undefined && typeof input.themeId !== "string") {
    issues.push(err("themeId", "themeId must be string or null"));
  }
  let metadata: Record<string, string | number | boolean | null> = {};
  if (input.metadata !== undefined) {
    if (!isPlainObject(input.metadata)) {
      issues.push(err("metadata", "metadata must be an object"));
    } else {
      for (const [k, v] of Object.entries(input.metadata)) {
        if (v !== null && typeof v !== "string" && typeof v !== "number" && typeof v !== "boolean") {
          issues.push(err(`metadata.${k}`, "metadata values must be string | number | boolean | null"));
        } else {
          metadata[k] = v;
        }
      }
    }
  }

  if (issues.some((i) => i.severity === "error")) {
    return { ok: false, issues };
  }

  const value: VisualizationSpec = {
    version: VISUALIZATION_SPEC_VERSION,
    id: input.id as string,
    title: input.title as string,
    kind: input.kind as ChartType,
    dataset: dataset!,
    encoding,
    layers,
    annotations,
    layout: layout!,
    style,
    themeId: (input.themeId as string | null | undefined) ?? null,
    legend: legend!,
    metadata
  };
  return { ok: true, issues, value };
}

/** Structural validation on an already-parsed spec. */
export function validateStructure(spec: VisualizationSpec): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const msg of assertDatasetStructure(spec.dataset)) {
    issues.push(err("dataset", msg));
  }
  if (spec.layout.width <= 0 || spec.layout.height <= 0) {
    issues.push(err("layout", "width and height must be positive"));
  }
  if (spec.layers.length === 0) {
    issues.push(err("layers", "at least one layer is required"));
  }
  const fieldIds = new Set(spec.dataset.fields.map((f) => f.id));
  const checkEnc = (enc: Encoding | undefined, path: string) => {
    if (!enc) return;
    for (const [channel, ch] of Object.entries(enc) as [keyof Encoding, ChannelEncoding | undefined][]) {
      if (!ch) continue;
      if (!fieldIds.has(ch.fieldId)) {
        issues.push(err(`${path}.${channel}`, `Unknown fieldId: ${ch.fieldId}`));
      }
    }
  };
  checkEnc(spec.encoding, "encoding");
  spec.layers.forEach((layer, i) => checkEnc(layer.encoding, `layers[${i}].encoding`));
  return issues;
}

/** Semantic rules based on registry capabilities. */
export function validateSemantics(spec: VisualizationSpec): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const meta = getVisualizationKind(spec.kind);
  if (!meta) {
    issues.push(err("kind", `Unregistered kind: ${spec.kind}`));
    return issues;
  }
  const fieldById = new Map(spec.dataset.fields.map((f) => [f.id, f]));
  const enc = spec.encoding;

  if (meta.capabilities.requiresCategory) {
    const cat = enc.category ?? enc.x;
    if (!cat) {
      issues.push(err("encoding", `${spec.kind} requires a category (or x) encoding`));
    } else {
      const field = fieldById.get(cat.fieldId);
      if (field && field.role === "measure") {
        issues.push(err("encoding.category", "Category channel should map to a dimension field"));
      }
    }
  }

  if (meta.capabilities.requiresTwoMeasures) {
    const x = enc.x;
    const y = enc.y;
    if (!x || !y) {
      issues.push(err("encoding", "scatter requires x and y encodings"));
    } else {
      const xf = fieldById.get(x.fieldId);
      const yf = fieldById.get(y.fieldId);
      if (xf && xf.role !== "measure") {
        issues.push(err("encoding.x", "scatter x should be a measure"));
      }
      if (yf && yf.role !== "measure") {
        issues.push(err("encoding.y", "scatter y should be a measure"));
      }
    }
  }

  if (meta.family === "cartesian" && !meta.capabilities.requiresTwoMeasures) {
    if (!enc.y && !enc.angle) {
      issues.push(err("encoding.y", `${spec.kind} typically requires a y (measure) encoding`));
    }
  }

  return issues;
}

/** Fill defaults from registry; ensure primary layer exists. */
export function normalizeVisualizationSpec(spec: VisualizationSpec): VisualizationSpec {
  const meta = getVisualizationKind(spec.kind);
  let layers = [...spec.layers];
  if (layers.length === 0 && meta) {
    layers = [{ id: "primary", mark: meta.defaultMark, encoding: spec.encoding }];
  }
  const title = spec.title.trim() || meta?.label || spec.kind;
  const themeId = spec.themeId === "" ? null : spec.themeId;
  return {
    ...spec,
    title,
    themeId,
    layers,
    annotations: spec.annotations ?? [],
    style: {
      showGrid: spec.style.showGrid ?? true,
      ...spec.style
    },
    legend: spec.legend ?? { show: true, position: "bottom" },
    metadata: spec.metadata ?? {}
  };
}

/**
 * Full pipeline: parse → structural → semantic → normalize.
 * Returns normalized spec when ok.
 */
export function validateVisualizationSpec(input: unknown): ValidationResult {
  const parsed = parseVisualizationSpec(input);
  if (!parsed.ok || !parsed.value) return parsed;

  const structural = validateStructure(parsed.value);
  if (structural.length > 0) {
    return { ok: false, issues: [...parsed.issues, ...structural] };
  }

  const semantic = validateSemantics(parsed.value);
  if (semantic.some((i) => i.severity === "error")) {
    return { ok: false, issues: [...parsed.issues, ...semantic] };
  }

  const normalized = normalizeVisualizationSpec(parsed.value);
  return { ok: true, issues: [...parsed.issues, ...semantic], value: normalized };
}

/** Convenience: default Cartesian bar preset, fully validated. */
export function createValidatedDefault(kind: ChartType = "bar"): VisualizationSpec {
  const draft = createDefaultVisualizationSpec(kind);
  const result = validateVisualizationSpec(draft);
  if (!result.ok || !result.value) {
    throw new Error(`Default spec for ${kind} failed validation`);
  }
  return result.value;
}
