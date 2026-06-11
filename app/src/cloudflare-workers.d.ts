/* minimal typing for the workerd-provided module — we deliberately avoid
   @cloudflare/workers-types because its globals collide with lib.dom in this
   mixed client/server tsconfig. Callers narrow env per binding. */
declare module 'cloudflare:workers' {
  export const env: Record<string, unknown>
}
