/** Constants and static defaults for the ECharts Renderer (SPEC-004). */

export const ECHARTS_RENDERER_ID = "echarts" as const;

/** Renderer package version — bump when adapter behavior changes. */
export const ECHARTS_RENDERER_VERSION = "0.1.0-slice2" as const;

/**
 * Static ECharts option defaults only.
 * No runtime, random, or clock-dependent values (SPEC-004 determinism).
 */
export const BAR_OPTION_DEFAULTS = {
  animation: false,
  progressive: 0,
  toolbox: { show: false },
  tooltip: { show: false }
} as const;
