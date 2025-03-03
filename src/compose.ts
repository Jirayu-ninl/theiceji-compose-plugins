import type {
  PluginFunction,
  Plugin,
  PluginArray,
  NextComposePluginsParam,
  ParsedPluginConfig,
  OptionalPlugin,
} from './_header'
import { isInCurrentPhase, mergePhaseConfiguration } from './phases'
import { isOptional, resolveOptionalPlugin } from './optional'

/**
 * Plugins can be added to `withPlugins` in multiple ways.
 * All possibilities are handled here and returned in a standardized way.
 *
 * @param {PluginArray|Plugin} plugin - plugin configuration
 */
export const parsePluginConfig = (
  plugin: PluginArray | Plugin,
): ParsedPluginConfig => {
  // it can only depend on phases if it has specific configuration
  if (plugin instanceof Array) {
    // if the plugin array contains 3 values, it always depends on phases
    // [plugin: function, config: object, phases: array]
    if (plugin.length > 2) {
      return {
        pluginFunction: plugin[0],
        pluginConfig: plugin[1],
        phases: plugin[2] as string[],
      }
    }

    // if the plugin array contains 2 values and the second one is an array, it depends on phases
    // [plugin: function, phases: array]
    if (plugin.length > 1 && plugin[1] instanceof Array) {
      return {
        pluginFunction: plugin[0],
        pluginConfig: {},
        phases: plugin[1] as string[],
      }
    }

    // plugin does not contain phase specific config but could have plugin configuration
    // [plugin: function, config?: object]
    return {
      pluginFunction: plugin[0],
      pluginConfig: plugin[1] || {},
      phases: null,
    }
  }

  return {
    pluginFunction: plugin,
    pluginConfig: {},
    phases: null,
  }
}

/**
 * Composes all plugins
 *
 * @param {string} phase - current phase
 * @param {Array<PluginArray|Plugin>} plugins - all plugins
 * @param {object} initialConfig - initial configuration
 */
export const composePlugins = (
  phase: string,
  plugins: Array<PluginArray | Plugin>,
  initialConfig: any,
): any => {
  const nextComposePluginsParam: NextComposePluginsParam = {
    nextComposePlugins: true,
    phase,
  }
  let config = mergePhaseConfiguration(phase, { ...initialConfig })

  plugins.forEach((plugin) => {
    const { pluginFunction, pluginConfig, phases } = parsePluginConfig(plugin)

    // check if the plugin should not get executed in the current phase
    if (phases !== null) {
      if (!isInCurrentPhase(phase, phases)) {
        return
      }
    }

    let resolvedPlugin: unknown = pluginFunction

    if (isOptional(pluginFunction)) {
      resolvedPlugin = resolveOptionalPlugin(pluginFunction as OptionalPlugin)
    }

    const mergedPluginConfig = mergePhaseConfiguration(phase, pluginConfig)
    let updatedConfig: any

    if (typeof resolvedPlugin === 'function') {
      updatedConfig = (resolvedPlugin as PluginFunction)(
        {
          ...config,
          ...mergedPluginConfig,
        },
        nextComposePluginsParam,
      )
    } else if (typeof resolvedPlugin === 'object') {
      updatedConfig = resolvedPlugin
    } else {
      throw new Error(
        'Incompatible plugin: plugin needs to export either a function or an object!',
      )
    }

    // check if the plugin itself has defined in phases it should run
    // and the user did not overwrite it
    if (phases === null && updatedConfig.phases) {
      if (!isInCurrentPhase(phase, updatedConfig.phases)) {
        return
      }
    }

    // delete plugin specific phases array so it doesn't propagate to the next plugin
    if (updatedConfig.phases) {
      delete updatedConfig.phases
    }

    // merge config back to the main one
    config = { ...config, ...updatedConfig }
  })

  return config
}
