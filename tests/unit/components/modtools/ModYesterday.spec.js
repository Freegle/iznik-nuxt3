import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ModYesterday from '~/modtools/components/ModYesterday.vue'

describe('ModYesterday', () => {
  let mockFetch

  function mountComponent() {
    return mount(ModYesterday, {
      global: {
        stubs: {},
      },
    })
  }

  function mockRestoreResponse(data) {
    return {
      ok: true,
      json: () => Promise.resolve(data),
    }
  }

  function mockCurrentBackupResponse(data) {
    return {
      ok: true,
      json: () => Promise.resolve(data),
    }
  }

  function mockFailedResponse() {
    return {
      ok: false,
    }
  }

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
    mockFetch = vi.fn()
    global.fetch = mockFetch
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('rendering', () => {
    it('renders nothing when latestMessage is null', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).toContain('Cannot reach Yesterday server')
    })

    it('renders alert when latestMessage is set', async () => {
      mockFetch
        .mockResolvedValueOnce(mockRestoreResponse({ status: 'idle' }))
        .mockResolvedValueOnce(
          mockCurrentBackupResponse({ date: '20240114', backup_time: '10:30' })
        )
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('.alert').exists()).toBe(true)
    })
  })

  describe('restore in progress', () => {
    it('shows restoring message when inProgress is true', async () => {
      mockFetch.mockResolvedValueOnce(
        mockRestoreResponse({
          inProgress: true,
          backupDate: '20240114',
        })
      )
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).toContain('Restoring backup from')
      expect(wrapper.text()).toContain('14 Jan 2024')
    })

    it('sets warning status during restore', async () => {
      mockFetch.mockResolvedValueOnce(
        mockRestoreResponse({
          inProgress: true,
          backupDate: '20240114',
        })
      )
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('.alert-warning').exists()).toBe(true)
    })

    it('sets isRestoring to true during restore', async () => {
      mockFetch.mockResolvedValueOnce(
        mockRestoreResponse({
          inProgress: true,
          backupDate: '20240114',
        })
      )
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).toContain('Backup is currently restoring')
    })
  })

  describe('backup status - idle/completed', () => {
    it('shows formatted backup date', async () => {
      mockFetch
        .mockResolvedValueOnce(mockRestoreResponse({ status: 'idle' }))
        .mockResolvedValueOnce(
          mockCurrentBackupResponse({ date: '20240114', backup_time: '08:45' })
        )
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).toContain('14 Jan 2024')
      expect(wrapper.text()).toContain('08:45')
    })

    it('shows success alert for recent backup', async () => {
      mockFetch
        .mockResolvedValueOnce(mockRestoreResponse({ status: 'idle' }))
        .mockResolvedValueOnce(mockCurrentBackupResponse({ date: '20240114' }))
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('.alert-success').exists()).toBe(true)
    })

    it('handles missing backup_time gracefully', async () => {
      mockFetch
        .mockResolvedValueOnce(mockRestoreResponse({ status: 'idle' }))
        .mockResolvedValueOnce(mockCurrentBackupResponse({ date: '20240114' }))
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).toContain('14 Jan 2024')
    })
  })

  describe('stale backup detection', () => {
    it('shows danger alert when backup is over 2 days old', async () => {
      mockFetch
        .mockResolvedValueOnce(mockRestoreResponse({ status: 'idle' }))
        .mockResolvedValueOnce(mockCurrentBackupResponse({ date: '20240110' }))
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('.alert-danger').exists()).toBe(true)
      expect(wrapper.text()).toContain('Backup is over 2 days old')
    })

    it('shows success alert when backup is exactly 2 days old', async () => {
      mockFetch
        .mockResolvedValueOnce(mockRestoreResponse({ status: 'idle' }))
        .mockResolvedValueOnce(mockCurrentBackupResponse({ date: '20240113' }))
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('.alert-success').exists()).toBe(true)
    })
  })

  describe('restore failed status', () => {
    it('shows restore-failed message when status is failed', async () => {
      mockFetch
        .mockResolvedValueOnce(mockRestoreResponse({ status: 'failed' }))
        .mockResolvedValueOnce(mockCurrentBackupResponse({ date: '20240114' }))
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('.alert-danger').exists()).toBe(true)
      expect(wrapper.text()).toContain('Latest restore attempt failed')
    })
  })

  describe('error handling', () => {
    it('shows unreachable message on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).toContain('Cannot reach Yesterday server')
      expect(wrapper.find('.alert-danger').exists()).toBe(true)
    })

    it('shows warning when restore API returns non-ok', async () => {
      mockFetch.mockResolvedValueOnce(mockFailedResponse())
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).toContain('Yesterday API unavailable')
      expect(wrapper.find('.alert-warning').exists()).toBe(true)
    })

    it('shows warning when current-backup API returns non-ok', async () => {
      mockFetch
        .mockResolvedValueOnce(mockRestoreResponse({ status: 'idle' }))
        .mockResolvedValueOnce(mockFailedResponse())
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).toContain('Could not fetch backup info')
      expect(wrapper.find('.alert-warning').exists()).toBe(true)
    })

    it('shows warning when current-backup fetch throws', async () => {
      mockFetch
        .mockResolvedValueOnce(mockRestoreResponse({ status: 'idle' }))
        .mockRejectedValueOnce(new Error('Fetch error'))
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).toContain('Could not fetch backup info')
      expect(wrapper.find('.alert-warning').exists()).toBe(true)
    })

    it('shows warning for missing date in current-backup response', async () => {
      mockFetch
        .mockResolvedValueOnce(mockRestoreResponse({ status: 'idle' }))
        .mockResolvedValueOnce(mockCurrentBackupResponse({}))
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).toContain('Unknown backup date')
      expect(wrapper.find('.alert-warning').exists()).toBe(true)
    })

    it('shows warning for unknown restore status', async () => {
      mockFetch.mockResolvedValueOnce(
        mockRestoreResponse({ status: 'unknown_status' })
      )
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).toContain('Unknown backup status')
      expect(wrapper.find('.alert-warning').exists()).toBe(true)
    })
  })

  describe('API endpoints', () => {
    it('calls restore-status API first', async () => {
      mockFetch.mockResolvedValueOnce(mockRestoreResponse({ status: 'idle' }))
      mockFetch.mockResolvedValueOnce(
        mockCurrentBackupResponse({ date: '20240114' })
      )
      mountComponent()
      await flushPromises()
      expect(mockFetch).toHaveBeenCalledWith(
        'https://yesterday.ilovefreegle.org:8444/api/restore-status'
      )
    })

    it('calls current-backup API for idle/completed/failed status', async () => {
      mockFetch
        .mockResolvedValueOnce(mockRestoreResponse({ status: 'completed' }))
        .mockResolvedValueOnce(mockCurrentBackupResponse({ date: '20240114' }))
      mountComponent()
      await flushPromises()
      expect(mockFetch).toHaveBeenCalledWith(
        'https://yesterday.ilovefreegle.org:8444/api/current-backup'
      )
    })
  })

  describe('alert CSS classes', () => {
    it('applies alert-success for good backup', async () => {
      mockFetch
        .mockResolvedValueOnce(mockRestoreResponse({ status: 'idle' }))
        .mockResolvedValueOnce(mockCurrentBackupResponse({ date: '20240114' }))
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('.alert-success').exists()).toBe(true)
    })

    it('applies alert-warning for in-progress restore', async () => {
      mockFetch.mockResolvedValueOnce(
        mockRestoreResponse({ inProgress: true, backupDate: '20240114' })
      )
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('.alert-warning').exists()).toBe(true)
    })

    it('applies alert-danger for stale backup', async () => {
      mockFetch
        .mockResolvedValueOnce(mockRestoreResponse({ status: 'idle' }))
        .mockResolvedValueOnce(mockCurrentBackupResponse({ date: '20240101' }))
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('.alert-danger').exists()).toBe(true)
    })

    it('applies alert-danger for unreachable server', async () => {
      mockFetch.mockRejectedValue(new Error('Failed'))
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('.alert-danger').exists()).toBe(true)
    })
  })

  describe('date formatting', () => {
    it('formats backup date correctly', async () => {
      mockFetch
        .mockResolvedValueOnce(mockRestoreResponse({ status: 'idle' }))
        .mockResolvedValueOnce(mockCurrentBackupResponse({ date: '20241225' }))
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).toContain('25 Dec 2024')
    })

    it('formats restoring backup date correctly', async () => {
      mockFetch.mockResolvedValueOnce(
        mockRestoreResponse({ inProgress: true, backupDate: '20240704' })
      )
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).toContain('4 Jul 2024')
    })
  })

  describe('content messages', () => {
    it('shows System backed up on Yesterday header', async () => {
      mockFetch
        .mockResolvedValueOnce(mockRestoreResponse({ status: 'idle' }))
        .mockResolvedValueOnce(mockCurrentBackupResponse({ date: '20240114' }))
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).toContain('System backed up on Yesterday up to')
    })
  })
})
