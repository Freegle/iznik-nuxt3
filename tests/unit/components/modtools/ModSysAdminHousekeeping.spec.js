import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

import ModSysAdminHousekeeping from '~/modtools/components/ModSysAdminHousekeeping.vue'

const mockFetchTasks = vi.fn()
const mockCompleteTask = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    housekeeper: {
      fetchTasks: mockFetchTasks,
      completeTask: mockCompleteTask,
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

const sampleTasks = [
  {
    id: 1,
    task_key: 'facebook-deletion',
    name: 'Facebook Data Deletion',
    description: 'Download pending deletion requests',
    interval_hours: 168,
    enabled: true,
    placeholder: false,
    last_run_at: '2026-04-09T10:00:00Z',
    last_status: 'success',
    last_summary: 'Processed 5 IDs: 3 marked for deletion, 2 not found',
    last_log:
      'Processing 5 Facebook user ID(s)\nFB 123 → user #456: marked for deletion',
    overdue: false,
  },
  {
    id: 2,
    task_key: 'paypal-giving-fund',
    name: 'PayPal Giving Fund',
    description: 'Process donation reports',
    interval_hours: 720,
    enabled: false,
    placeholder: true,
    last_run_at: null,
    last_status: null,
    last_summary: null,
    last_log: null,
    overdue: false,
  },
  {
    id: 3,
    task_key: 'failed-task',
    name: 'Failed Task',
    description: 'A task that failed',
    interval_hours: 24,
    enabled: true,
    placeholder: false,
    last_run_at: '2026-04-09T08:00:00Z',
    last_status: 'failure',
    last_summary: 'Could not find button',
    last_log: null,
    overdue: false,
  },
]

describe('ModSysAdminHousekeeping', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent() {
    return mount(ModSysAdminHousekeeping, {
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
          'b-button': {
            template:
              '<button :class="variant" :disabled="disabled" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['variant', 'size', 'disabled'],
          },
          'b-spinner': { template: '<div class="spinner" />' },
        },
      },
    })
  }

  it('shows spinner while loading', () => {
    mockFetchTasks.mockReturnValue(new Promise(() => {}))
    const wrapper = mountComponent()
    expect(wrapper.find('.spinner').exists()).toBe(true)
  })

  it('renders tasks after loading', async () => {
    mockFetchTasks.mockResolvedValue(sampleTasks)
    const wrapper = mountComponent()
    await flushPromises()

    expect(wrapper.text()).toContain('Facebook Data Deletion')
    expect(wrapper.text()).toContain('PayPal Giving Fund')
    expect(wrapper.text()).toContain('Failed Task')
  })

  it('shows Manual badge for placeholder tasks', async () => {
    mockFetchTasks.mockResolvedValue(sampleTasks)
    const wrapper = mountComponent()
    await flushPromises()

    const badges = wrapper.findAll('.badge')
    const badgeTexts = badges.map((b) => b.text())

    expect(badgeTexts).toContain('Manual')
  })

  it('shows Mark Done button for placeholder tasks', async () => {
    mockFetchTasks.mockResolvedValue(sampleTasks)
    const wrapper = mountComponent()
    await flushPromises()

    const buttons = wrapper.findAll('button')
    const markDoneBtn = buttons.find((b) => b.text().includes('Mark Done'))
    expect(markDoneBtn).toBeTruthy()
  })

  it('shows grey dash for disabled/placeholder tasks, tick for OK, cross for failed', async () => {
    mockFetchTasks.mockResolvedValue(sampleTasks)
    const wrapper = mountComponent()
    await flushPromises()

    // facebook-deletion is OK → green tick
    expect(wrapper.findAll('.text-success').length).toBeGreaterThanOrEqual(1)
    // paypal-giving-fund is placeholder → grey dash
    expect(wrapper.findAll('.text-muted.fs-5').length).toBeGreaterThanOrEqual(1)
    // failed-task → red cross
    expect(wrapper.findAll('.text-danger').length).toBeGreaterThanOrEqual(1)
  })

  it('shows summary text for tasks with results', async () => {
    mockFetchTasks.mockResolvedValue(sampleTasks)
    const wrapper = mountComponent()
    await flushPromises()

    expect(wrapper.text()).toContain('Processed 5 IDs')
    expect(wrapper.text()).toContain('Could not find button')
  })

  it('shows empty state when no tasks', async () => {
    mockFetchTasks.mockResolvedValue([])
    const wrapper = mountComponent()
    await flushPromises()

    expect(wrapper.text()).toContain('No housekeeping tasks registered yet')
  })

  it('shows error on API failure', async () => {
    mockFetchTasks.mockRejectedValue(new Error('Network error'))
    const wrapper = mountComponent()
    await flushPromises()

    expect(wrapper.text()).toContain('Network error')
  })

  it('formats interval hours correctly', async () => {
    mockFetchTasks.mockResolvedValue(sampleTasks)
    const wrapper = mountComponent()
    await flushPromises()

    expect(wrapper.text()).toContain('Weekly') // 168h
    expect(wrapper.text()).toContain('Monthly') // 720h
    expect(wrapper.text()).toContain('Every 1d') // 24h
  })

  it('highlights failed tasks with danger row class', async () => {
    mockFetchTasks.mockResolvedValue(sampleTasks)
    const wrapper = mountComponent()
    await flushPromises()

    const rows = wrapper.findAll('tr')
    const failedRow = rows.find((r) => r.text().includes('Failed Task'))
    expect(failedRow.classes()).toContain('table-danger')
  })
})
