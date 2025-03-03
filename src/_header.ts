export type PluginFunction = (
  config: any,
  options: NextComposePluginsParam,
) => any
export type Plugin = PluginFunction | object
export type PluginArray = [Plugin] | [Plugin, any] | [Plugin, any, string[]]

export interface ParsedPluginConfig {
  pluginFunction: Plugin
  pluginConfig: any
  phases: string[] | null
}

export interface NextComposePluginsParam {
  nextComposePlugins: boolean
  phase: string
}

export const OPTIONAL_SYMBOL = Symbol('__NEXT_COMPOSE_PLUGINS_OPTIONAL')

export interface OptionalPlugin extends Function {
  [OPTIONAL_SYMBOL]?: boolean
}