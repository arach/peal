// App-owned prompt/tool contract. Inference adapters and their registry live
// in Hudson; SFX supplies only the tools its own UI knows how to apply.
export interface ToolsetDefinition {
  system: string
  context: (ctx: Record<string, unknown>) => string
  tools: (ctx: Record<string, unknown>) => Record<string, unknown>
}
