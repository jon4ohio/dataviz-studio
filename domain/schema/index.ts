/**
 * Canonical visualization schema — Public Platform API surface.
 *
 * Stable after SPEC-003. Changes require an ADR or an approved
 * breaking-change proposal. Meaning: docs/architecture/domain-model.md
 *
 * Public contracts re-exported here:
 * - Dataset (+ Field, Value, Series)
 * - VisualizationSpec
 * - Visualization Registry helpers
 * - parse / validate / normalize / serialize / deserialize
 *
 * VisualizationRenderer / RenderResult live in domain/renderers/.
 */

export {
  assertDatasetStructure,
  createEmptyDataset,
  type CellValue,
  type Dataset,
  type Field,
  type FieldRole,
  type FieldValueType,
  type Series
} from "./data";

export {
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
  type VisualizationFamily,
  type VisualizationSpec
} from "./visualization";

export {
  createDefaultVisualizationSpec,
  getVisualizationKind,
  isRegisteredKind,
  listVisualizationKinds,
  type VisualizationKindMeta
} from "./registry";

export {
  createValidatedDefault,
  normalizeVisualizationSpec,
  parseVisualizationSpec,
  validateSemantics,
  validateStructure,
  validateVisualizationSpec,
  type ValidationIssue,
  type ValidationResult,
  type ValidationSeverity
} from "./validate";

export {
  deserializeLoose,
  deserializeVisualizationSpec,
  serializeVisualizationSpec
} from "./codec";
