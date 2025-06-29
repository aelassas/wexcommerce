import { jest } from '@jest/globals'

jest.unstable_mockModule('@sentry/node', () => ({
  init: jest.fn(),
}))

describe('instrument.ts ESM', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('should initialize Sentry when enabled', async () => {
    jest.unstable_mockModule('../src/config/env.config.js', () => ({
      ENABLE_SENTRY: true,
      SENTRY_DSN_BACKEND: 'https://example@dsn.io/123',
      SENTRY_TRACES_SAMPLE_RATE: 0.5,
    }))

    const logger = {
      info: jest.fn(),
      success: jest.fn(),
    }
    jest.unstable_mockModule('../src/common/logger.js', () => logger)

    await jest.isolateModulesAsync(async () => {
      // Import Sentry AFTER mocks applied
      const Sentry = await import('@sentry/node')
      await import('../src/instrument.js')

      expect(Sentry.init).toHaveBeenCalledWith(expect.objectContaining({
        dsn: 'https://example@dsn.io/123',
        tracesSampleRate: 0.5,
      }))
      expect(logger.success).toHaveBeenCalledWith('[Sentry] Initialized with DSN:', 'https://example@dsn.io/123')
    })
  })

  it('should initialize Sentry without tracing', async () => {
    jest.unstable_mockModule('../src/config/env.config.js', () => ({
      ENABLE_SENTRY: true,
      SENTRY_DSN_BACKEND: 'https://example@dsn.io/123',
      SENTRY_TRACES_SAMPLE_RATE: 0,
    }))

    const logger = {
      info: jest.fn(),
      success: jest.fn(),
    }
    jest.unstable_mockModule('../src/common/logger.js', () => logger)

    await jest.isolateModulesAsync(async () => {
      const Sentry = await import('@sentry/node')
      await import('../src/instrument.js')

      expect(Sentry.init).toHaveBeenCalledWith(expect.objectContaining({
        dsn: 'https://example@dsn.io/123',
        tracesSampleRate: 0,
      }))
      expect(logger.info).toHaveBeenCalledWith('[Sentry] Traces sample rate is set to 0, no transactions will be sent.')
      expect(logger.success).toHaveBeenCalledWith('[Sentry] Initialized with DSN:', 'https://example@dsn.io/123')
    })
  })

  it('should test process.env.NODE_ENV = "production"', async () => {
    process.env.NODE_ENV = 'production'

    jest.unstable_mockModule('../src/config/env.config.js', () => ({
      ENABLE_SENTRY: true,
      SENTRY_DSN_BACKEND: 'https://example@dsn.io/123',
      SENTRY_TRACES_SAMPLE_RATE: 1.0,
    }))

    const logger = {
      info: jest.fn(),
      success: jest.fn(),
    }
    jest.unstable_mockModule('../src/common/logger.js', () => logger)

    await jest.isolateModulesAsync(async () => {
      const Sentry = await import('@sentry/node')
      await import('../src/instrument.js')

      expect(Sentry.init).toHaveBeenCalledWith(expect.objectContaining({
        environment: 'production',
      }))
      expect(logger.success).toHaveBeenCalledWith('[Sentry] Initialized with DSN:', 'https://example@dsn.io/123')
    })
  })

  it('should test process.env.NODE_ENV = "development"', async () => {
    process.env.NODE_ENV = 'development'

    jest.unstable_mockModule('../src/config/env.config.js', () => ({
      ENABLE_SENTRY: true,
      SENTRY_DSN_BACKEND: 'https://example@dsn.io/123',
      SENTRY_TRACES_SAMPLE_RATE: 1.0,
    }))

    const logger = {
      info: jest.fn(),
      success: jest.fn(),
    }
    jest.unstable_mockModule('../src/common/logger.js', () => logger)

    await jest.isolateModulesAsync(async () => {
      const Sentry = await import('@sentry/node')
      await import('../src/instrument.js')

      expect(Sentry.init).toHaveBeenCalledWith(expect.objectContaining({
        environment: 'development',
      }))
      expect(logger.success).toHaveBeenCalledWith('[Sentry] Initialized with DSN:', 'https://example@dsn.io/123')
    })
  })

  it('should test process.env.NODE_ENV not set', async () => {
    process.env.NODE_ENV = ''

    jest.unstable_mockModule('../src/config/env.config.js', () => ({
      ENABLE_SENTRY: true,
      SENTRY_DSN_BACKEND: 'https://example@dsn.io/123',
      SENTRY_TRACES_SAMPLE_RATE: 1.0,
    }))

    const logger = {
      info: jest.fn(),
      success: jest.fn(),
    }
    jest.unstable_mockModule('../src/common/logger.js', () => logger)

    await jest.isolateModulesAsync(async () => {
      const Sentry = await import('@sentry/node')
      await import('../src/instrument.js')

      expect(Sentry.init).toHaveBeenCalledWith(expect.objectContaining({
        environment: 'development',
      }))
      expect(logger.success).toHaveBeenCalledWith('[Sentry] Initialized with DSN:', 'https://example@dsn.io/123')
    })
  })

  it('should skip Sentry when disabled', async () => {
    jest.unstable_mockModule('../src/config/env.config.js', () => ({
      ENABLE_SENTRY: false,
      SENTRY_DSN_BACKEND: '',
      SENTRY_TRACES_SAMPLE_RATE: 1,
    }))

    const logger = {
      info: jest.fn(),
      success: jest.fn(),
    }
    jest.unstable_mockModule('../src/common/logger.js', () => logger)

    await jest.isolateModulesAsync(async () => {
      await import('../src/instrument.js')
      expect(logger.info).toHaveBeenCalledWith('[Sentry] Skipped: Disabled or missing DSN.')
    })
  })
})
