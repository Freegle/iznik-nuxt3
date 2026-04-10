import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

import ModSysAdminCronJobs from '~/modtools/components/ModSysAdminCronJobs.vue'

const mockFetchCronJobs = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    housekeeper: {
      fetchCronJobs: mockFetchCronJobs,
    },
  }),
}))

vi.mock('#app', () => ({
  useRuntimeConfig: () => ({ public: { apiUrl: 'http://test' } }),
}))

vi.mock('~/composables/useTimeFormat', () => ({
  timeago: vi.fn((val) => {
    if (!val) return ''
    const d = new Date(val)
    const diffMs = Date.now() - d.getTime()
    const diffH = Math.floor(diffMs / 3600000)
    if (diffH < 24) return `${diffH} hours ago`
    return `${Math.floor(diffH / 24)} days ago`
  }),
}))

const sampleCronJobs = [
  {
    command: 'deploy:watch',
    name: 'Deployment Watcher',
    description: 'Detects code updates and auto-refreshes application',
    schedule: 'Every minute',
    interval_minutes: 1,
    category: 'System',
    active: true,
    last_run_at: new Date(Date.now() - 5000).toISOString(),
    last_finished_at: new Date(Date.now() - 4000).toISOString(),
    last_exit_code: 0,
    last_output: 'Version unchanged',
  },
  {
    command: 'mail:chat:user2user',
    name: 'Chat: User to User',
    description: 'Sends email notifications for user-to-user chat messages',
    schedule: 'Every minute',
    interval_minutes: 1,
    category: 'Email — Chat',
    active: true,
    last_run_at: null,
    last_finished_at: null,
    last_exit_code: null,
    last_output: null,
  },
  {
    command: 'data:update-cpi',
    name: 'CPI Data Update',
    description: 'Fetches UK CPI inflation data from ONS',
    schedule: 'Monthly',
    interval_minutes: 43200,
    category: 'Data',
    active: true,
    last_run_at: '2026-04-01T04:00:00Z',
    last_finished_at: '2026-04-01T04:00:05Z',
    last_exit_code: 1,
    last_output: 'ONS API returned 503',
  },
]

describe('ModSysAdminCronJobs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent() {
    return mount(ModSysAdminCronJobs, {
      global: {
        stubs: {
          'b-table-simple': {
            template: '<table><slot /></table>',
          },
          'b-thead': { template: '<thead><slot /></thead>' },
          'b-tbody': { template: '<tbody><slot /></tbody>' },
          'b-tr': { template: '<tr><slot /></tr>' },
          'b-th': { template: '<th><slot /></th>' },
          'b-td': { template: '<td><slot /></td>' },
          'b-badge': {
            template: '<span class="badge" :class="variant"><slot /></span>',
            props: ['variant'],
          },
          'b-spinner': { template: '<div class="spinner" />' },
        },
      },
    })
  }

  it('shows spinner while loading', () => {
    mockFetchCronJobs.mockReturnValue(new Promise(() => {}))
    const wrapper = mountComponent()
    expect(wrapper.find('.spinner').exists()).toBe(true)
  })

  it('renders cron jobs with category headers in a single table', async () => {
    mockFetchCronJobs.mockResolvedValue(sampleCronJobs)
    const wrapper = mountComponent()
    await flushPromises()

    expect(wrapper.text()).toContain('System')
    expect(wrapper.text()).toContain('Email — Chat')
    expect(wrapper.text()).toContain('Data')

    const tables = wrapper.findAll('table')
    expect(tables).toHaveLength(1)
  })

  it('shows job details including command and description', async () => {
    mockFetchCronJobs.mockResolvedValue(sampleCronJobs)
    const wrapper = mountComponent()
    await flushPromises()

    expect(wrapper.text()).toContain('deploy:watch')
    expect(wrapper.text()).toContain('Detects code updates')
    expect(wrapper.text()).toContain('Every minute')
  })

  it('shows Never for jobs that have not run', async () => {
    mockFetchCronJobs.mockResolvedValue(sampleCronJobs)
    const wrapper = mountComponent()
    await flushPromises()

    expect(wrapper.text()).toContain('Never')
  })

  it('shows tick for OK jobs and cross for problems', async () => {
    mockFetchCronJobs.mockResolvedValue(sampleCronJobs)
    const wrapper = mountComponent()
    await flushPromises()

    const text = wrapper.text()

    // deploy:watch is OK (exit code 0) → should have tick character
    // data:update-cpi has exit code 1 → should have cross character
    // mail:chat:user2user never run → should have cross character
    // Check the status indicators render (tick = ✓, cross = ✗)
    expect(text).toContain('\u2713') // tick
    expect(text).toContain('\u2717') // cross
  })

  it('highlights failed jobs with danger row class', async () => {
    mockFetchCronJobs.mockResolvedValue(sampleCronJobs)
    const wrapper = mountComponent()
    await flushPromises()

    const rows = wrapper.findAll('tr')
    const failedRow = rows.find((r) => r.text().includes('data:update-cpi'))
    expect(failedRow.classes()).toContain('table-danger')
  })

  it('toggles log panel on row click', async () => {
    mockFetchCronJobs.mockResolvedValue(sampleCronJobs)
    const wrapper = mountComponent()
    await flushPromises()

    const rows = wrapper.findAll('tr.job-row')
    const deployRow = rows.find((r) => r.text().includes('deploy:watch'))
    await deployRow.trigger('click')

    expect(wrapper.text()).toContain('Version unchanged')

    await deployRow.trigger('click')
    expect(wrapper.text()).not.toContain('Version unchanged')
  })

  it('shows error on API failure', async () => {
    mockFetchCronJobs.mockRejectedValue(new Error('Server error'))
    const wrapper = mountComponent()
    await flushPromises()

    expect(wrapper.text()).toContain('Server error')
  })
})
