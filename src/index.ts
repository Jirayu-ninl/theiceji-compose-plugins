import type { NextConfig } from 'next'
import { composePlugins } from './compose'

// Define types for the plugin system
type Plugin = Function | object
type PluginArray = [Plugin] | [Plugin, any] | [Plugin, any, string[]]
type Phase = string

interface NextOptions {
  defaultConfig: NextConfig
  [key: string]: any
}

type WithPluginsFunction = (phase: Phase, options: NextOptions) => any

/**
 * Composes all plugins together.
 *
 * @param {Array<PluginArray|Plugin>} plugins - all plugins to load and initialize
 * @param {object} nextConfig - direct configuration for next.js (optional)
 */
const withPlugins = (
  plugins: Array<PluginArray | Plugin>,
  nextConfig: NextConfig = {},
): WithPluginsFunction => {
  return (phase: Phase, { defaultConfig, ...rest }: NextOptions): any => {
    const config = {
      ...defaultConfig,
      ...nextConfig,
    }

    return composePlugins(phase, plugins, config)
  }
}

/**
 * Extends a base next config.
 *
 * @param {WithPluginsFunction} baseConfig - basic configuration
 */
const extend = (baseConfig: WithPluginsFunction) => ({
  withPlugins: (
    plugins: Array<PluginArray | Plugin>,
    nextConfig: NextConfig = {},
  ): WithPluginsFunction => {
    return (phase: Phase, nextOptions: NextOptions): any => {
      const processedBaseConfig = baseConfig(phase, nextOptions)

      return withPlugins(plugins, nextConfig)(phase, {
        ...nextOptions,
        defaultConfig: processedBaseConfig,
      })
    }
  },
})

// define exports
export { withPlugins, extend }
export default withPlugins
