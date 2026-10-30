/**
 * Host half of the DeepSeek Peak Indicator bundle.
 *
 * The feature is entirely browser-side: the Client half reads the wall clock and
 * the local holiday table, so the Host has nothing to compute, serve, or store.
 * This empty `apply` exists only so the plugin occupies a Loader row and appears
 * in the plugin inventory with its display metadata.
 */

/** Host plugin body — deliberately empty. */
export function apply() {}
