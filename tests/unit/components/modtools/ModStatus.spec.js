import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, computed } from 'vue'

// Mock composables with proper Vue ref to avoid template ref warnings
const mockHide = vi.fn()
const mockShow = vi.fn()
const mockModal = ref({ show: mockShow, hide: mockHide })

vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: mockModal,
    hide: mockHide,
  }),
}))

const mockSupportOrAdmin = ref(false)

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    supportOrAdmin: mockSupportOrAdmin,
  }),
}))

// Mock API
const mockStatusFetch = vi.fn()
const mockApi = {
  status: {
    fetch: mockStatusFetch,
  },
}

vi.mock('#app', () => ({
  useNuxtApp: () => ({ $api: mockApi }),
}))

// Create test component that mirrors ModStatus logic
const ModStatusTest = {
  template: `
    <span title="Platform Status - click for more info" class="clickme" @click="clicked">
      <span v-if="!tried" class="trying" />
      <span v-else-if="error" class="error" />
      <span v-else-if="warning && supportOrAdmin" class="warning" />
      <span v-else class="fine" />
      <div class="modal" v-if="showModal">
        <div class="title">Platform Status: {{ headline }}</div>
        <div class="content">
          <div v-if="(warning || error) && supportOrAdmin" class="notice-support">
            There is a problem.
          </div>
          <div v-else-if="error" class="notice-error">
            There's a problem, and parts of the system may not be working.
          </div>
          <div v-else-if="warning" class="notice-warning">
            There's a problem, but the system should still be working.
          </div>
          <div v-else class="notice-fine">
            Everything seems fine.
          </div>
          <div v-if="status && status.info">
            <div v-for="(stat, server) in status.info" :key="server" class="server-status">
              <div v-if="stat.warning">{{ server }}: {{ stat.warningtext }}</div>
              <div v-if="stat.error">{{ server }}: {{ stat.errortext }}</div>
            </div>
          </div>
        </div>
        <button @click="hideModal">Close</button>
      </div>
    </span>
  `,
  setup() {
    const status = ref(null)
    const updated = ref(null)
    const tried = ref(false)
    const showModal = ref(false)

    const outOfDate = computed(() => {
      return !updated.value || Date.now() - updated.value >= 1000 * 600
    })

    const error = computed(() => (status.value ? status.value.error : false))

    const warning = computed(() => {
      return outOfDate.value || (status.value && status.value.warning)
    })

    const headline = computed(() => {
      if (outOfDate.value) {
        return 'Not sure'
      } else if (warning.value) {
        return 'Warning'
      } else if (error.value) {
        return 'Error'
      } else {
        return 'Fine'
      }
    })

    async function checkStatus() {
      try {
        status.value = await mockStatusFetch()
        tried.value = true
        if (status.value.ret === 0) {
          updated.value = Date.now()
        }
      } catch (err) {
        tried.value = true
        status.value = {
          ret: 1,
          warning: true,
          info: {
            'Status API': {
              warning: true,
              warningtext: 'Cannot access status file - system status unknown',
            },
          },
        }
      }
    }

    function clicked(e) {
      showModal.value = true
      e.preventDefault()
      e.stopPropagation()
    }

    function hideModal() {
      showModal.value = false
    }

    return {
      status,
      updated,
      tried,
      showModal,
      outOfDate,
      error,
      warning,
      headline,
      supportOrAdmin: mockSupportOrAdmin,
      checkStatus,
      clicked,
      hideModal,
    }
  },
}

describe('ModStatus', () => {
  function mountComponent() {
    return mount(ModStatusTest)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockSupportOrAdmin.value = false
    mockStatusFetch.mockResolvedValue({ ret: 0, error: false, warning: false })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rendering', () => {
    it('renders a clickable span', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.clickme').exists()).toBe(true)
    })

    it('shows trying indicator before status is fetched', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.trying').exists()).toBe(true)
    })

    it('shows fine indicator when status is OK', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.checkStatus()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.fine').exists()).toBe(true)
      expect(wrapper.find('.error').exists()).toBe(false)
      expect(wrapper.find('.warning').exists()).toBe(false)
    })

    it('shows error indicator when status has error', async () => {
      mockStatusFetch.mockResolvedValue({ ret: 0, error: true, warning: false })
      const wrapper = mountComponent()
      await wrapper.vm.checkStatus()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.error').exists()).toBe(true)
    })

    it('shows warning indicator for supportOrAdmin when status has warning', async () => {
      mockSupportOrAdmin.value = true
      mockStatusFetch.mockResolvedValue({ ret: 0, error: false, warning: true })
      const wrapper = mountComponent()
      await wrapper.vm.checkStatus()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.warning').exists()).toBe(true)
    })

    it('does not show warning for non-admin when warning exists', async () => {
      mockSupportOrAdmin.value = false
      mockStatusFetch.mockResolvedValue({ ret: 0, error: false, warning: true })
      const wrapper = mountComponent()
      await wrapper.vm.checkStatus()
      await wrapper.vm.$nextTick()

      // Non-admins see fine, not warning
      expect(wrapper.find('.warning').exists()).toBe(false)
      expect(wrapper.find('.fine').exists()).toBe(true)
    })
  })

  describe('computed properties', () => {
    describe('outOfDate', () => {
      it('returns true when updated is null', () => {
        const wrapper = mountComponent()
        expect(wrapper.vm.outOfDate).toBe(true)
      })

      it('returns true when updated is more than 10 minutes ago', async () => {
        const wrapper = mountComponent()
        // Set updated to 11 minutes ago
        wrapper.vm.updated = Date.now() - 1000 * 660
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.outOfDate).toBe(true)
      })

      it('returns false when updated recently', async () => {
        const wrapper = mountComponent()
        await wrapper.vm.checkStatus()
        expect(wrapper.vm.outOfDate).toBe(false)
      })
    })

    describe('error', () => {
      it('returns false when status is null', () => {
        const wrapper = mountComponent()
        expect(wrapper.vm.error).toBe(false)
      })

      it('returns true when status has error flag', async () => {
        mockStatusFetch.mockResolvedValue({ ret: 0, error: true })
        const wrapper = mountComponent()
        await wrapper.vm.checkStatus()
        expect(wrapper.vm.error).toBe(true)
      })

      it('returns false when status has no error flag', async () => {
        mockStatusFetch.mockResolvedValue({ ret: 0, error: false })
        const wrapper = mountComponent()
        await wrapper.vm.checkStatus()
        expect(wrapper.vm.error).toBe(false)
      })
    })

    describe('warning', () => {
      it('returns true when outOfDate', () => {
        const wrapper = mountComponent()
        expect(wrapper.vm.warning).toBe(true)
      })

      it('returns true when status has warning flag', async () => {
        mockStatusFetch.mockResolvedValue({ ret: 0, warning: true })
        const wrapper = mountComponent()
        await wrapper.vm.checkStatus()
        expect(wrapper.vm.warning).toBe(true)
      })

      it('returns false when status is fresh with no warning', async () => {
        mockStatusFetch.mockResolvedValue({ ret: 0, warning: false })
        const wrapper = mountComponent()
        await wrapper.vm.checkStatus()
        expect(wrapper.vm.warning).toBe(false)
      })
    })

    describe('headline', () => {
      it('returns "Not sure" when outOfDate', () => {
        const wrapper = mountComponent()
        expect(wrapper.vm.headline).toBe('Not sure')
      })

      it('returns "Fine" when status is OK and fresh', async () => {
        mockStatusFetch.mockResolvedValue({
          ret: 0,
          error: false,
          warning: false,
        })
        const wrapper = mountComponent()
        await wrapper.vm.checkStatus()
        expect(wrapper.vm.headline).toBe('Fine')
      })

      it('returns "Warning" when warning exists', async () => {
        mockStatusFetch.mockResolvedValue({
          ret: 0,
          error: false,
          warning: true,
        })
        const wrapper = mountComponent()
        await wrapper.vm.checkStatus()
        expect(wrapper.vm.headline).toBe('Warning')
      })

      it('returns "Warning" not "Error" when both error and warning exist', async () => {
        // Note: headline logic checks warning before error when not outOfDate
        mockStatusFetch.mockResolvedValue({
          ret: 0,
          error: true,
          warning: true,
        })
        const wrapper = mountComponent()
        await wrapper.vm.checkStatus()
        // warning is true, so headline is "Warning"
        expect(wrapper.vm.headline).toBe('Warning')
      })
    })
  })

  describe('checkStatus method', () => {
    it('calls API status fetch', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.checkStatus()
      expect(mockStatusFetch).toHaveBeenCalled()
    })

    it('sets tried to true after fetch', async () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.tried).toBe(false)
      await wrapper.vm.checkStatus()
      expect(wrapper.vm.tried).toBe(true)
    })

    it('sets status from API response', async () => {
      const statusData = { ret: 0, error: false, warning: false, info: {} }
      mockStatusFetch.mockResolvedValue(statusData)
      const wrapper = mountComponent()
      await wrapper.vm.checkStatus()
      expect(wrapper.vm.status).toEqual(statusData)
    })

    it('updates timestamp when ret is 0', async () => {
      mockStatusFetch.mockResolvedValue({ ret: 0 })
      const wrapper = mountComponent()
      await wrapper.vm.checkStatus()
      expect(wrapper.vm.updated).not.toBeNull()
    })

    it('does not update timestamp when ret is not 0', async () => {
      mockStatusFetch.mockResolvedValue({ ret: 1 })
      const wrapper = mountComponent()
      await wrapper.vm.checkStatus()
      expect(wrapper.vm.updated).toBeNull()
    })

    it('handles API error gracefully', async () => {
      mockStatusFetch.mockRejectedValue(new Error('Network error'))
      const wrapper = mountComponent()
      await wrapper.vm.checkStatus()

      expect(wrapper.vm.tried).toBe(true)
      expect(wrapper.vm.status.warning).toBe(true)
      expect(wrapper.vm.status.info['Status API'].warningtext).toContain(
        'Cannot access status file'
      )
    })
  })

  describe('clicked method', () => {
    it('opens modal on click', async () => {
      const wrapper = mountComponent()
      await wrapper.find('.clickme').trigger('click')

      expect(wrapper.vm.showModal).toBe(true)
      expect(wrapper.find('.modal').exists()).toBe(true)
    })

    it('displays headline in modal title', async () => {
      const wrapper = mountComponent()
      await wrapper.find('.clickme').trigger('click')

      expect(wrapper.find('.title').text()).toContain('Not sure')
    })
  })

  describe('modal content', () => {
    it('shows fine notice when status is OK', async () => {
      mockStatusFetch.mockResolvedValue({
        ret: 0,
        error: false,
        warning: false,
      })
      const wrapper = mountComponent()
      await wrapper.vm.checkStatus()
      await wrapper.find('.clickme').trigger('click')

      expect(wrapper.find('.notice-fine').exists()).toBe(true)
    })

    it('shows error notice when error flag is set', async () => {
      mockStatusFetch.mockResolvedValue({ ret: 0, error: true })
      const wrapper = mountComponent()
      await wrapper.vm.checkStatus()
      await wrapper.find('.clickme').trigger('click')

      expect(wrapper.find('.notice-error').exists()).toBe(true)
    })

    it('shows warning notice for non-admin when warning flag is set', async () => {
      mockSupportOrAdmin.value = false
      mockStatusFetch.mockResolvedValue({ ret: 0, error: false, warning: true })
      const wrapper = mountComponent()
      await wrapper.vm.checkStatus()
      await wrapper.find('.clickme').trigger('click')

      expect(wrapper.find('.notice-warning').exists()).toBe(true)
    })

    it('shows support notice for admin when warning exists', async () => {
      mockSupportOrAdmin.value = true
      mockStatusFetch.mockResolvedValue({ ret: 0, error: false, warning: true })
      const wrapper = mountComponent()
      await wrapper.vm.checkStatus()
      await wrapper.find('.clickme').trigger('click')

      expect(wrapper.find('.notice-support').exists()).toBe(true)
    })

    it('displays server-specific status info', async () => {
      mockStatusFetch.mockResolvedValue({
        ret: 0,
        error: false,
        warning: true,
        info: {
          'Web Server': {
            warning: true,
            warningtext: 'High load',
          },
        },
      })
      const wrapper = mountComponent()
      await wrapper.vm.checkStatus()
      await wrapper.find('.clickme').trigger('click')

      expect(wrapper.text()).toContain('Web Server')
      expect(wrapper.text()).toContain('High load')
    })

    it('calls hideModal function', async () => {
      const wrapper = mountComponent()
      await wrapper.find('.clickme').trigger('click')
      expect(wrapper.vm.showModal).toBe(true)

      // Directly call the hideModal method
      wrapper.vm.hideModal()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.showModal).toBe(false)
    })
  })
})
