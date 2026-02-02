import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

// Import the component after mocking
import ModSupportCheckVolunteers from '~/modtools/components/ModSupportCheckVolunteers.vue'

// Mock user store
const mockUserStore = {
  clear: vi.fn(),
  fetchMT: vi.fn(),
}

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

describe('ModSupportCheckVolunteers', () => {
  function mountComponent() {
    return mount(ModSupportCheckVolunteers, {
      global: {
        stubs: {
          'b-form-textarea': {
            template:
              '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'rows'],
          },
          'b-button': {
            template:
              '<button :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUserStore.fetchMT.mockResolvedValue([])
  })

  describe('rendering', () => {
    it('displays the instructions', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Paste in email addresses, one per line')
      expect(wrapper.text()).toContain('check whether they are still')
      expect(wrapper.text()).toContain('volunteers')
    })

    it('renders a textarea for email input', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('textarea').exists()).toBe(true)
    })

    it('renders a Check button', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.find('button').text()).toContain('Check')
    })

    it('has primary variant on the button', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('button').classes()).toContain('primary')
    })
  })

  describe('initial state', () => {
    it('starts with emails as null', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.emails).toBeNull()
    })

    it('starts with empty results array', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.results).toEqual([])
    })
  })

  describe('results display', () => {
    it('does not show results section when results are empty', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('h2').exists()).toBe(false)
    })

    it('shows results section when results have items', async () => {
      const wrapper = mountComponent()
      wrapper.vm.results = [
        { text: 'test@example.com: Volunteer', error: false },
      ]
      await wrapper.vm.$nextTick()

      expect(wrapper.find('h2').exists()).toBe(true)
      expect(wrapper.find('h2').text()).toBe('Results')
    })

    it('displays results with text-danger class for errors', async () => {
      const wrapper = mountComponent()
      wrapper.vm.results = [
        { text: 'test@example.com: Not found', error: true },
      ]
      await wrapper.vm.$nextTick()

      const resultDiv = wrapper.find('.text-danger')
      expect(resultDiv.exists()).toBe(true)
      expect(resultDiv.text()).toContain('Not found')
    })

    it('displays results without error styling for volunteers', async () => {
      const wrapper = mountComponent()
      wrapper.vm.results = [
        { text: 'test@example.com: Volunteer', error: false },
      ]
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.text-danger').exists()).toBe(false)
      expect(wrapper.text()).toContain('Volunteer')
    })
  })

  describe('check function', () => {
    it('clears previous results when check is called', () => {
      const wrapper = mountComponent()
      wrapper.vm.results = [{ text: 'old result', error: false }]
      wrapper.vm.emails = 'test@example.com'

      mockUserStore.fetchMT.mockResolvedValue([])

      wrapper.vm.check()
      expect(wrapper.vm.results).toEqual([])
    })

    it('calls userStore.clear before fetching', async () => {
      const wrapper = mountComponent()
      wrapper.vm.emails = 'test@example.com'

      mockUserStore.fetchMT.mockResolvedValue([])

      wrapper.vm.check()
      await flushPromises()

      expect(mockUserStore.clear).toHaveBeenCalled()
    })

    it('calls userStore.fetchMT with email and emailhistory=false', async () => {
      const wrapper = mountComponent()
      wrapper.vm.emails = 'test@example.com'

      mockUserStore.fetchMT.mockResolvedValue([])

      wrapper.vm.check()
      await flushPromises()

      expect(mockUserStore.fetchMT).toHaveBeenCalledWith({
        search: 'test@example.com',
        emailhistory: false,
      })
    })

    it('marks Admin users as volunteers', async () => {
      const wrapper = mountComponent()
      wrapper.vm.emails = 'admin@example.com'

      mockUserStore.fetchMT.mockResolvedValue([
        { id: 1, email: 'admin@example.com', systemrole: 'Admin' },
      ])

      wrapper.vm.check()
      await flushPromises()

      expect(wrapper.vm.results).toContainEqual({
        text: 'admin@example.com: Volunteer',
        error: false,
      })
    })

    it('marks Moderator users as volunteers', async () => {
      const wrapper = mountComponent()
      wrapper.vm.emails = 'mod@example.com'

      mockUserStore.fetchMT.mockResolvedValue([
        { id: 2, email: 'mod@example.com', systemrole: 'Moderator' },
      ])

      wrapper.vm.check()
      await flushPromises()

      expect(wrapper.vm.results).toContainEqual({
        text: 'mod@example.com: Volunteer',
        error: false,
      })
    })

    it('marks Support users as volunteers', async () => {
      const wrapper = mountComponent()
      wrapper.vm.emails = 'support@example.com'

      mockUserStore.fetchMT.mockResolvedValue([
        { id: 3, email: 'support@example.com', systemrole: 'Support' },
      ])

      wrapper.vm.check()
      await flushPromises()

      expect(wrapper.vm.results).toContainEqual({
        text: 'support@example.com: Volunteer',
        error: false,
      })
    })

    it('marks regular users as not volunteers', async () => {
      const wrapper = mountComponent()
      wrapper.vm.emails = 'user@example.com'

      mockUserStore.fetchMT.mockResolvedValue([
        { id: 4, email: 'user@example.com', systemrole: 'User' },
      ])

      wrapper.vm.check()
      await flushPromises()

      expect(wrapper.vm.results).toContainEqual({
        text: 'user@example.com: Not a volunteer',
        error: true,
      })
    })

    it('handles multiple matches as an error', async () => {
      const wrapper = mountComponent()
      wrapper.vm.emails = 'multi@example.com'

      mockUserStore.fetchMT.mockResolvedValue([
        { id: 5, email: 'multi@example.com', systemrole: 'User' },
        { id: 6, email: 'multi@example.com', systemrole: 'Moderator' },
      ])

      wrapper.vm.check()
      await flushPromises()

      expect(wrapper.vm.results).toContainEqual({
        text: 'multi@example.com: More than 1 match found - check email',
        error: true,
      })
    })

    it('handles not found emails', async () => {
      const wrapper = mountComponent()
      wrapper.vm.emails = 'notfound@example.com'

      mockUserStore.fetchMT.mockResolvedValue([])

      wrapper.vm.check()
      await flushPromises()

      expect(wrapper.vm.results).toContainEqual({
        text: 'notfound@example.com: Not found',
        error: true,
      })
    })

    it('handles multiple emails separated by newlines', async () => {
      const wrapper = mountComponent()
      wrapper.vm.emails = 'first@example.com\nsecond@example.com'

      mockUserStore.fetchMT
        .mockResolvedValueOnce([
          { id: 1, email: 'first@example.com', systemrole: 'Admin' },
        ])
        .mockResolvedValueOnce([
          { id: 2, email: 'second@example.com', systemrole: 'User' },
        ])

      wrapper.vm.check()
      await flushPromises()

      expect(mockUserStore.fetchMT).toHaveBeenCalledTimes(2)
    })

    it('trims whitespace from emails', async () => {
      const wrapper = mountComponent()
      wrapper.vm.emails = '  trimmed@example.com  '

      mockUserStore.fetchMT.mockResolvedValue([])

      wrapper.vm.check()
      await flushPromises()

      expect(mockUserStore.fetchMT).toHaveBeenCalledWith({
        search: 'trimmed@example.com',
        emailhistory: false,
      })
    })

    it('skips empty lines', async () => {
      const wrapper = mountComponent()
      wrapper.vm.emails = 'first@example.com\n\n\nsecond@example.com'

      mockUserStore.fetchMT.mockResolvedValue([])

      wrapper.vm.check()
      await flushPromises()

      // Should only call fetchMT for non-empty lines
      expect(mockUserStore.fetchMT).toHaveBeenCalledTimes(2)
    })
  })

  describe('button click', () => {
    it('calls userStore.fetchMT when button is clicked', async () => {
      const wrapper = mountComponent()
      wrapper.vm.emails = 'click@example.com'
      mockUserStore.fetchMT.mockResolvedValue([])

      await wrapper.find('button').trigger('click')
      await flushPromises()

      expect(mockUserStore.fetchMT).toHaveBeenCalledWith({
        search: 'click@example.com',
        emailhistory: false,
      })
    })
  })

  describe('v-model binding', () => {
    it('updates emails when textarea value changes', async () => {
      const wrapper = mountComponent()
      const textarea = wrapper.find('textarea')

      await textarea.setValue('new@example.com')

      expect(wrapper.vm.emails).toBe('new@example.com')
    })
  })
})
