import { describe, test, expect, beforeEach, mock } from 'bun:test'
import { withPlugins, extend } from '@/index'
import { composePlugins } from '@/compose'
import { markOptional, isOptional, resolveOptionalPlugin } from '@/optional'
import { isInCurrentPhase, mergePhaseConfiguration } from '@/phases'

// Mock Next.js phases
const PHASE_DEVELOPMENT_SERVER = 'phase-development-server'
const PHASE_PRODUCTION_BUILD = 'phase-production-build'

type Config = Record<string, any>

describe('@theiceji/compose-plugins', () => {
  // Basic plugin testing
  describe('withPlugins', () => {
    test('should compose plugins correctly', () => {
      // Create mock plugins
      const withCSS = (config: Config) => ({ ...config, css: true })
      const withImages = (config: Config) => ({ ...config, images: true })

      const config = withPlugins([withCSS, withImages], { distDir: 'build' })

      // Test execution with Next.js phase
      const result = config(PHASE_DEVELOPMENT_SERVER, { defaultConfig: {} })

      expect(result).toEqual({
        distDir: 'build',
        css: true,
        images: true
      })
    })

    test('should handle plugin configurations', () => {
      const withCSS = (config: Config) => ({
        ...config,
        css: config.cssModules
      })

      const config = withPlugins([[withCSS, { cssModules: true }]])

      const result = config(PHASE_DEVELOPMENT_SERVER, { defaultConfig: {} })

      expect(result).toEqual({
        css: true,
        cssModules: true
      })
    })
  })

  // Phase testing
  describe('phases', () => {
    test('isInCurrentPhase should determine phases correctly', () => {
      // Test inclusion
      expect(
        isInCurrentPhase(PHASE_DEVELOPMENT_SERVER, [PHASE_DEVELOPMENT_SERVER])
      ).toBe(true)
      expect(
        isInCurrentPhase(PHASE_DEVELOPMENT_SERVER, PHASE_DEVELOPMENT_SERVER)
      ).toBe(true)

      // Test exclusion
      expect(
        isInCurrentPhase(PHASE_DEVELOPMENT_SERVER, [PHASE_PRODUCTION_BUILD])
      ).toBe(false)
      expect(
        isInCurrentPhase(PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD)
      ).toBe(false)

      // Test negation
      expect(
        isInCurrentPhase(PHASE_DEVELOPMENT_SERVER, `!${PHASE_PRODUCTION_BUILD}`)
      ).toBe(true)
      expect(
        isInCurrentPhase(
          PHASE_DEVELOPMENT_SERVER,
          `!${PHASE_DEVELOPMENT_SERVER}`
        )
      ).toBe(false)
    })

    test('mergePhaseConfiguration should merge configs based on phase', () => {
      const config = {
        cssModules: false,
        [`phase-${PHASE_DEVELOPMENT_SERVER}`]: {
          cssModules: true,
          sourceMap: true
        },
        [`phase-${PHASE_PRODUCTION_BUILD}`]: {
          minimize: true
        }
      }

      const devResult = mergePhaseConfiguration(
        PHASE_DEVELOPMENT_SERVER,
        config
      )
      expect(devResult).toEqual({
        cssModules: true,
        sourceMap: true
      })

      const prodResult = mergePhaseConfiguration(PHASE_PRODUCTION_BUILD, config)
      expect(prodResult).toEqual({
        cssModules: false,
        minimize: true
      })
    })

    test('should only run plugins in specified phases', () => {
      const withCSS = (config: Config) => ({ ...config, css: true })
      const withMinifier = (config: Config) => ({ ...config, minified: true })

      const config = withPlugins([
        withCSS,
        [withMinifier, {}, [PHASE_PRODUCTION_BUILD]]
      ])

      const devResult = config(PHASE_DEVELOPMENT_SERVER, { defaultConfig: {} })
      expect(devResult).toEqual({
        css: true
      })

      const prodResult = config(PHASE_PRODUCTION_BUILD, { defaultConfig: {} })
      expect(prodResult).toEqual({
        css: true,
        minified: true
      })
    })
  })

  // Optional plugins testing
  describe('optional plugins', () => {
    test('markOptional should mark a plugin as optional', () => {
      const plugin = () => ({})
      const optionalPlugin = markOptional(plugin)

      expect(isOptional(optionalPlugin)).toBe(true)
      expect(isOptional(plugin)).toBe(false)
    })

    test('optional plugins should resolve correctly', () => {
      const plugin = mock(() => ({ worked: true }))
      const optionalPlugin = markOptional(plugin)

      const result = resolveOptionalPlugin(optionalPlugin)
      expect(result).toEqual({ worked: true })
      expect(plugin).toHaveBeenCalled()
    })

    test('withPlugins should handle optional plugins', () => {
      const withCSS = (config: Config) => ({ ...config, css: true })
      const withTypeScript = markOptional(() => (config: Config) => ({
        ...config,
        typescript: true
      }))

      const config = withPlugins([withCSS, withTypeScript])

      const result = config(PHASE_DEVELOPMENT_SERVER, { defaultConfig: {} })
      expect(result).toEqual({
        css: true,
        typescript: true
      })
    })
  })

  // Extension testing
  describe('extend', () => {
    test('should correctly extend base configurations', () => {
      const withCSS = (config: Config) => ({ ...config, css: true })
      const withImages = (config: Config) => ({ ...config, images: true })

      const baseConfig = withPlugins([withCSS])
      const extendedConfig = extend(baseConfig).withPlugins([withImages])

      const result = extendedConfig(PHASE_DEVELOPMENT_SERVER, {
        defaultConfig: {}
      })

      expect(result).toEqual({
        css: true,
        images: true
      })
    })
  })

  // Error cases
  describe('error handling', () => {
    test('should throw error for invalid plugin type', () => {
      const invalidPlugin = 'not a function or object'

      expect(() => {
        composePlugins(PHASE_DEVELOPMENT_SERVER, [invalidPlugin as any], {})
      }).toThrow()
    })
  })
})
