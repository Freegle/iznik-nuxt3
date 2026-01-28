import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
// Import the mocked modules (resolved via vitest.config.mts aliases)
import { Preferences } from '@capacitor/preferences'
import { BarcodeScanner } from '@aspect/aspectra'
import DevConnectScreen from '~/components/DevConnectScreen.vue'

// Mock fetch
global.fetch = vi.fn()

describe('DevConnectScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Preferences.get.mockResolvedValue({ value: null })
    global.fetch.mockResolvedValue({ ok: true })
  })

  function createWrapper() {
    return mount(DevConnectScreen, {
      global: {
        stubs: {
          'v-icon': {
            template:
              '<span class="v-icon" :data-icon="icon" :class="{ spin }" />',
            props: ['icon', 'spin'],
          },
          'b-spinner': {
            template: '<span class="b-spinner" />',
            props: ['small'],
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'block', 'disabled'],
            emits: ['click'],
          },
          'b-form-group': {
            template: '<div class="b-form-group"><slot /></div>',
            props: ['label'],
          },
          'b-form-input': {
            template:
              '<input class="b-form-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @keyup="$emit(\'keyup\', $event)" />',
            props: ['modelValue', 'placeholder'],
            emits: ['update:modelValue', 'keyup'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders dev connect container', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.dev-connect').exists()).toBe(true)
    })

    it('shows header', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('h1').text()).toBe('Freegle Dev')
    })

    it('shows subtitle', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Connect to your development server')
    })

    it('shows QR code section', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Scan QR Code')
    })

    it('shows manual URL section', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Enter URL Manually')
    })

    it('shows troubleshooting section', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Troubleshooting')
    })
  })

  describe('saved URL', () => {
    it('loads saved URL on mount', async () => {
      Preferences.get.mockResolvedValue({ value: 'http://saved.url:3002' })
      const wrapper = createWrapper()
      await flushPromises()
      expect(Preferences.get).toHaveBeenCalledWith({
        key: 'dev_server_url',
      })
      expect(wrapper.text()).toContain('http://saved.url:3002')
    })

    it('shows reconnect button when saved URL exists', async () => {
      Preferences.get.mockResolvedValue({ value: 'http://saved.url:3002' })
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Reconnect')
    })

    it('does not show Last Server when no saved URL', async () => {
      Preferences.get.mockResolvedValue({ value: null })
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).not.toContain('Last Server')
    })
  })

  describe('connection states', () => {
    it('shows idle state initially (no status card)', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.status-card').exists()).toBe(false)
    })

    it('shows connecting state', async () => {
      // Make fetch take time
      global.fetch.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ ok: true }), 100)
          })
      )

      const wrapper = createWrapper()
      await flushPromises()

      const input = wrapper.find('.b-form-input')
      await input.setValue('http://test.url:3002')

      const connectBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Connect'))
      await connectBtn.trigger('click')

      // Should show connecting state
      expect(wrapper.find('.status-card.checking').exists()).toBe(true)
      expect(wrapper.text()).toContain('Connecting...')
    })

    it('shows connected state on successful connection', async () => {
      global.fetch.mockResolvedValue({ ok: true })

      const wrapper = createWrapper()
      await flushPromises()

      const input = wrapper.find('.b-form-input')
      await input.setValue('http://success.url:3002')

      const connectBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Connect'))
      await connectBtn.trigger('click')
      await flushPromises()

      expect(wrapper.find('.status-card.success').exists()).toBe(true)
      expect(wrapper.text()).toContain('Connected!')
    })

    it('shows failed state on connection error', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'))

      const wrapper = createWrapper()
      await flushPromises()

      const input = wrapper.find('.b-form-input')
      await input.setValue('http://fail.url:3002')

      const connectBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Connect'))
      await connectBtn.trigger('click')
      await flushPromises()

      expect(wrapper.find('.status-card.error').exists()).toBe(true)
      expect(wrapper.text()).toContain('Connection Failed')
    })

    it('shows timeout message on abort', async () => {
      const abortError = new Error('Aborted')
      abortError.name = 'AbortError'
      global.fetch.mockRejectedValue(abortError)

      const wrapper = createWrapper()
      await flushPromises()

      const input = wrapper.find('.b-form-input')
      await input.setValue('http://timeout.url:3002')

      const connectBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Connect'))
      await connectBtn.trigger('click')
      await flushPromises()

      expect(wrapper.text()).toContain('timed out')
    })
  })

  describe('manual connection', () => {
    it('connects with manual URL', async () => {
      global.fetch.mockResolvedValue({ ok: true })

      const wrapper = createWrapper()
      await flushPromises()

      const input = wrapper.find('.b-form-input')
      await input.setValue('http://manual.url:3002')

      const connectBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Connect'))
      await connectBtn.trigger('click')
      await flushPromises()

      expect(global.fetch).toHaveBeenCalledWith(
        'http://manual.url:3002',
        expect.objectContaining({ method: 'HEAD', mode: 'no-cors' })
      )
    })

    it('adds http:// if missing', async () => {
      global.fetch.mockResolvedValue({ ok: true })

      const wrapper = createWrapper()
      await flushPromises()

      const input = wrapper.find('.b-form-input')
      await input.setValue('192.168.1.100:3002')

      const connectBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Connect'))
      await connectBtn.trigger('click')
      await flushPromises()

      expect(global.fetch).toHaveBeenCalledWith(
        'http://192.168.1.100:3002',
        expect.anything()
      )
    })

    it('connect button is disabled when no URL', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const connectBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Connect'))
      expect(connectBtn.attributes('disabled')).toBeDefined()
    })
  })

  describe('reconnect', () => {
    it('reconnects with saved URL', async () => {
      Preferences.get.mockResolvedValue({ value: 'http://saved.url:3002' })
      global.fetch.mockResolvedValue({ ok: true })

      const wrapper = createWrapper()
      await flushPromises()

      const reconnectBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Reconnect'))
      await reconnectBtn.trigger('click')
      await flushPromises()

      expect(global.fetch).toHaveBeenCalledWith(
        'http://saved.url:3002',
        expect.anything()
      )
    })
  })

  describe('QR scanning', () => {
    it('shows scan button', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Scan QR Code')
    })

    it('requests camera permission on scan', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const scanBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Scan QR'))
      await scanBtn.trigger('click')
      await flushPromises()

      expect(BarcodeScanner.checkPermission).toHaveBeenCalledWith({
        force: true,
      })
    })

    it('shows error when permission denied', async () => {
      BarcodeScanner.checkPermission.mockResolvedValue({ granted: false })

      const wrapper = createWrapper()
      await flushPromises()

      const scanBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Scan QR'))
      await scanBtn.trigger('click')
      await flushPromises()

      expect(wrapper.text()).toContain('Camera permission required')
    })

    it('connects with scanned URL', async () => {
      BarcodeScanner.checkPermission.mockResolvedValue({ granted: true })
      BarcodeScanner.startScan.mockResolvedValue({
        hasContent: true,
        content: 'http://scanned.url:3002',
      })
      global.fetch.mockResolvedValue({ ok: true })

      const wrapper = createWrapper()
      await flushPromises()

      const scanBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Scan QR'))
      await scanBtn.trigger('click')
      await flushPromises()

      expect(global.fetch).toHaveBeenCalledWith(
        'http://scanned.url:3002',
        expect.anything()
      )
    })

    it('shows error for invalid QR content', async () => {
      BarcodeScanner.checkPermission.mockResolvedValue({ granted: true })
      BarcodeScanner.startScan.mockResolvedValue({
        hasContent: true,
        content: 'not-a-url',
      })

      const wrapper = createWrapper()
      await flushPromises()

      const scanBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Scan QR'))
      await scanBtn.trigger('click')
      await flushPromises()

      expect(wrapper.text()).toContain('Invalid QR code')
    })

    it('stops scan after completion', async () => {
      BarcodeScanner.checkPermission.mockResolvedValue({ granted: true })
      BarcodeScanner.startScan.mockResolvedValue({ hasContent: false })

      const wrapper = createWrapper()
      await flushPromises()

      const scanBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Scan QR'))
      await scanBtn.trigger('click')
      await flushPromises()

      expect(BarcodeScanner.stopScan).toHaveBeenCalled()
    })
  })

  describe('emitted events', () => {
    it('emits connected event on success', async () => {
      global.fetch.mockResolvedValue({ ok: true })

      const wrapper = createWrapper()
      await flushPromises()

      const input = wrapper.find('.b-form-input')
      await input.setValue('http://test.url:3002')

      const connectBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Connect'))
      await connectBtn.trigger('click')
      await flushPromises()

      expect(wrapper.emitted('connected')).toBeTruthy()
      expect(wrapper.emitted('connected')[0]).toEqual(['http://test.url:3002'])
    })
  })

  describe('saving URL', () => {
    it('saves URL to preferences on successful connection', async () => {
      global.fetch.mockResolvedValue({ ok: true })

      const wrapper = createWrapper()
      await flushPromises()

      const input = wrapper.find('.b-form-input')
      await input.setValue('http://save.url:3002')

      const connectBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Connect'))
      await connectBtn.trigger('click')
      await flushPromises()

      expect(Preferences.set).toHaveBeenCalledWith({
        key: 'dev_server_url',
        value: 'http://save.url:3002',
      })
    })
  })

  describe('help section', () => {
    it('shows WiFi requirement', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('same WiFi')
    })

    it('shows docker requirement', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('docker-compose up')
    })

    it('shows firewall note', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('firewall')
    })
  })
})
