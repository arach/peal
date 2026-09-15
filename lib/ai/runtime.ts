/**
 * True for the static GitHub Pages build (no /api/* routes).
 * NEXT_PUBLIC_BUILD_STATIC is set by `bun run build:static`; basePath is a
 * secondary signal for Pages-style subpath deploys.
 */
export function isPealStaticRuntime(): boolean {
  return (
    process.env.NEXT_PUBLIC_BUILD_STATIC === 'true'
    || Boolean(process.env.NEXT_PUBLIC_BASE_PATH)
  )
}
