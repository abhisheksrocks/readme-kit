/**
 * Represents the response format for health check endpoints.
 *
 * This interface defines the structure returned by health monitoring endpoints,
 * providing a standardized way to communicate service availability. The status
 * is currently a literal type 'ok', indicating the service is operational.
 *
 * @example
 * ```typescript
 * const healthResponse: HealthResponse = { status: 'ok' };
 * ```
 *
 * @example
 * ```typescript
 * // Used in controller return type
 * async function healthController(): Promise<HealthResponse> {
 *   return { status: 'ok' };
 * }
 * ```
 */
export interface HealthResponse {
  /**
   * The health status of the service, always 'ok' when responding successfully.
   */
  status: 'ok';
}
