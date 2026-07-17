# SPEC-006: Milestone 5 — Data Pipeline

**Contract:** Specification  
**Problem coordinated:** How do users get data into the visualization model without writing configuration?

## Requirements

### Sources

- Manual table editing
- CSV (paste / import)
- JSON
- Excel (in scope for first usable release only if it does not delay delivery)
- Google Sheets (deferred unless explicitly pulled forward in SPEC-001)

### Processing

- Type inference
- Date parsing
- Number parsing
- Aggregation, sorting, filtering as needed for registered kinds

### Mapping

- Dimension
- Measure
- Series

Output of the pipeline is platform data that populates / validates against `VisualizationSpec`—not engine config.

## Acceptance

- [ ] Users can import or paste common tabular data and map it into the model
- [ ] Invalid or empty datasets fail with recoverable UX (no broken SVG/document insert)
- [ ] Pipeline never writes ECharts-specific fields into `VisualizationSpec`

## References

- [Architecture Contract](../architecture/contract.md)
- [SPEC-001](SPEC-001-v1-product-scope.md)
- [SPEC-003](SPEC-003-canonical-schema.md)
- `domain/import/`, `ui/`
