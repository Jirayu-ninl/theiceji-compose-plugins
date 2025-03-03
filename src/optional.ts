import type { OptionalPlugin, Plugin } from './_header'
import { OPTIONAL_SYMBOL } from './_header'

/**
 * Marks a plugin as optional
 *
 * @param {OptionalPlugin} plugin - function which requires a plugin
 */
export const markOptional = (plugin: OptionalPlugin): OptionalPlugin => {
  const wrappedPlugin = (...args: any[]) => plugin(...args)
  wrappedPlugin[OPTIONAL_SYMBOL] = true
  return wrappedPlugin
}

/**
 * Check if a plugin has been marked as optional before
 *
 * @param {unknown} plugin - plugin to check
 */
export const isOptional = (plugin: unknown): boolean => {
  return (
    typeof plugin === 'function' &&
    (plugin as OptionalPlugin)[OPTIONAL_SYMBOL] === true
  )
}

/**
 * Resolve an optional plugin
 *
 * @param {OptionalPlugin} plugin - function which requires a plugin
 */
export const resolveOptionalPlugin = (plugin: OptionalPlugin): unknown =>
  plugin()
