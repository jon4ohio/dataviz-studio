/**
 * Data category — schema representation of Dataset / Field / Value / Series.
 * Meaning: docs/architecture/domain-model.md
 *
 * Public Platform API (stable after SPEC-003): Dataset (and nested Data types).
 * Changes require an ADR or an approved breaking-change proposal.
 */

export type FieldRole = "dimension" | "measure" | "none";

export type FieldValueType = "string" | "number" | "boolean" | "datetime" | "unknown";

/** A single cell value. */
export type CellValue = string | number | boolean | null;

export interface Field {
  readonly id: string;
  readonly name: string;
  readonly role: FieldRole;
  readonly valueType: FieldValueType;
}

/**
 * Named grouping of related measure fields (or a logical series identity).
 * Optional on Dataset; encodings may also imply series.
 */
export interface Series {
  readonly id: string;
  readonly name: string;
  /** Field ids (typically measures) that belong to this series. */
  readonly fieldIds: readonly string[];
}

export interface Dataset {
  readonly id: string;
  readonly fields: readonly Field[];
  /** Row-major values; each row length must match `fields.length`. */
  readonly rows: readonly (readonly CellValue[])[];
  readonly series?: readonly Series[];
}

export function createEmptyDataset(id = "dataset"): Dataset {
  return { id, fields: [], rows: [] };
}

/** Structural check: field ids unique; row widths match field count. */
export function assertDatasetStructure(dataset: Dataset): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const field of dataset.fields) {
    if (!field.id) errors.push("Field id is required");
    if (ids.has(field.id)) errors.push(`Duplicate field id: ${field.id}`);
    ids.add(field.id);
  }
  const width = dataset.fields.length;
  dataset.rows.forEach((row, i) => {
    if (row.length !== width) {
      errors.push(`Row ${i} has ${row.length} values; expected ${width}`);
    }
  });
  if (dataset.series) {
    const seriesIds = new Set<string>();
    for (const s of dataset.series) {
      if (seriesIds.has(s.id)) errors.push(`Duplicate series id: ${s.id}`);
      seriesIds.add(s.id);
      for (const fid of s.fieldIds) {
        if (!ids.has(fid)) errors.push(`Series ${s.id} references unknown field ${fid}`);
      }
    }
  }
  return errors;
}
