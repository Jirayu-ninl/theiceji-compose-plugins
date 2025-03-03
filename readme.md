<p align="center">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://orion.theiceji.com/TheIceJi_icon_whiteBg.png">
        <img width="140" alt="Logo for A1" src="https://orion.theiceji.com/TheIceJi_icon_blackBg.png">
    </picture>
</p>

# Next Compose Plugins (TS)

A utility to compose and manage Next.js plugins with advanced phase control. <br />
( original from [next-compose-plugins](https://github.com/cyrilwanner/next-compose-plugins) - javascript version )

Note: requires `typescript` and `next 15` or higher for supporting `next.config.ts`

## Installation

```bash
npm install @theiceji/compose-plugins
# or
yarn add @theiceji/compose-plugins
```

## Overview

`@theiceji/compose-plugins` is a utility for Next.js that simplifies plugin management, allowing you to:

- Compose multiple plugins together
- Apply plugins conditionally based on Next.js build phases
- Make plugins optional
- Extend existing configurations

Why Use `@theiceji/compose-plugins`?

- **Declarative Composition:** Manage multiple plugins cleanly.
- **Phase-Based Loading:** Control when plugins are applied.
- **Optional Plugins:** Avoid errors if a plugin isn't installed.
- **Improved Readability:** Keep your next.config.ts structure and maintainability.

## Basic Usage

```typescript
// next.config.ts
import { withPlugins } from '@theiceji/compose-plugins'
import { withSentryConfig } from '@sentry/nextjs'
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const sentryWebpackPluginOptions = {
    // Additional config options for the Sentry Webpack plugin.
}

export default withPlugins([
  [withSentryConfig, sentryWebpackPluginOptions],
  withBundleAnalyzer,
  // Add more plugins here
  // Example: [withMDX, { extension: /\.mdx?$/ }]
], {
  // Your Next.js config options here
  distDir: 'build',
})
```

## Advanced Usage

### Phase-Based Plugin Loading

You can control when plugins are applied based on Next.js build phases:

```javascript
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants'
import { withPlugins } from '@theiceji/compose-plugins'
import { withSentryConfig } from '@sentry/nextjs'
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const sentryWebpackPluginOptions = {
    // Additional config options for the Sentry Webpack plugin.
}

export default withPlugins([
  // Apply in all phases
  [withSentryConfig, sentryWebpackPluginOptions],
  
  // Only apply in development
  [withBundleAnalyzer, {}, [PHASE_DEVELOPMENT_SERVER]],
]);
```

### Optional Plugins

Make plugins optional (useful for plugins that might not be installed):

```javascript
import { withPlugins } from '@theiceji/compose-plugins'
import { markOptional } from '@theiceji/compose-plugins/optional'

// This plugin will be skipped if the package isn't available
const withMDX = markOptional(() => import('@next/mdx').then(mod => mod.default))

export default withPlugins([
  withMDX,
  // Other plugins...
])
```

### Extending Configurations

You can extend an existing configuration:

```javascript
import { withPlugins, extend } from '@theiceji/compose-plugins'
import withMDX from '@next/mdx';

const baseConfig = withPlugins([
  withMDX,
])

// Later, extend the base config
export default extend(baseConfig).withPlugins([
  // More plugins to add on top
])
```

## Types

```typescript
// Plugin types
type Plugin = Function | object
type PluginArray = [Plugin] | [Plugin, any] | [Plugin, any, string[]]

// The main withPlugins function type
type WithPluginsFunction = (phase: string, options: NextOptions) => any

// Optional plugin type
interface OptionalPlugin extends Function {
  [OPTIONAL_SYMBOL]?: boolean
}
```

## API Reference

### `withPlugins(plugins, nextConfig)`

Composes multiple plugins together.

- `plugins`: An array of plugins or plugin configurations
- `nextConfig`: Optional Next.js configuration object

### `extend(baseConfig)`

Extends a base configuration with additional plugins.

- `baseConfig`: A configuration created with `withPlugins`

### `markOptional(pluginLoader)`

Marks a plugin as optional, so it won't cause errors if unavailable.

- `pluginLoader`: A function that returns a plugin

## Plugin Configuration Format

Plugins can be specified in several formats:

1. Plain plugin: `withCSS`
2. Plugin with config: `[withCSS, { cssModules: true }]`
3. Plugin with config and phases: `[withCSS, { cssModules: true }, [PHASE_DEVELOPMENT_SERVER]]`

## License

MIT