import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import NewsLocation from '~/components/NewsLocation.vue'

const { mockMe } = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockMe: ref({
      settings: {
        newsfeedarea: 'nearby',
        mylocation: {
          area: { name: 'London' },
          areaid: 123,
        },
      },
    }),
  }
})

const mockAuthStore = {
  saveAndGet: vi.fn().mockResolvedValue(undefined),
}

const mockLocationStore = {
  fetchv2: vi.fn().mockResolvedValue({ name: 'London' }),
}

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

vi.mock('~/stores/location', () => ({
  useLocationStore: () => mockLocationStore,
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: mockMe,
  }),
}))

describe('NewsLocation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMe.value = {
      settings: {
        newsfeedarea: 'nearby',
        mylocation: {
          area: { name: 'London' },
          areaid: 123,
        },
      },
    }
  })

  function createWrapper() {
    return mount(NewsLocation, {
      global: {
        stubs: {
          'b-card': {
            template: '<div class="b-card"><slot /></div>',
            props: ['noBody'],
          },
          'b-card-text': {
            template: '<div class="b-card-text"><slot /></div>',
          },
          'b-form-select': {
            template:
              '<select class="form-select" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.text }}</option></select>',
            props: ['modelValue', 'options'],
            emits: ['update:modelValue'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
        },
        directives: {
          'b-tooltip': {},
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders card container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-card').exists()).toBe(true)
    })

    it('renders area selector', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.form-select').exists()).toBe(true)
    })

    it('displays location name', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('London')
    })

    it('shows map marker icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="map-marker-alt"]').exists()).toBe(
        true
      )
    })
  })

  describe('area options', () => {
    it('includes nearby option', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Show chitchat from nearby')
    })

    it('includes distance options', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Show chitchat within 1 mile')
      expect(wrapper.text()).toContain('Show chitchat within 5 miles')
      expect(wrapper.text()).toContain('Show chitchat within 10 miles')
    })

    it('includes anywhere option', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Show chitchat from anywhere')
    })
  })

  describe('selectedArea computed', () => {
    it('returns newsfeedarea from settings', () => {
      mockMe.value.settings.newsfeedarea = 8046
      const wrapper = createWrapper()
      expect(wrapper.vm.selectedArea).toBe(8046)
    })

    it('returns 0 when newsfeedarea is not set', () => {
      mockMe.value.settings.newsfeedarea = null
      const wrapper = createWrapper()
      expect(wrapper.vm.selectedArea).toBe(0)
    })

    it('saves settings when changed', async () => {
      const wrapper = createWrapper()

      await wrapper.find('.form-select').setValue('8046')
      await flushPromises()

      expect(mockAuthStore.saveAndGet).toHaveBeenCalled()
    })

    it('emits changed event when area changes', async () => {
      const wrapper = createWrapper()

      await wrapper.find('.form-select').setValue('8046')
      await flushPromises()

      expect(wrapper.emitted('changed')).toHaveLength(1)
    })
  })

  describe('location initialization', () => {
    it('fetches location when areaname is missing but areaid exists', async () => {
      mockMe.value.settings.mylocation.area = null
      mockMe.value.settings.mylocation.areaid = 456
      createWrapper()
      await flushPromises()

      expect(mockLocationStore.fetchv2).toHaveBeenCalledWith(456)
    })

    it('does not fetch when areaname exists', async () => {
      mockMe.value.settings.mylocation.area = { name: 'Manchester' }
      createWrapper()
      await flushPromises()

      expect(mockLocationStore.fetchv2).not.toHaveBeenCalled()
    })
  })

  describe('responsive layout', () => {
    it('has mobile-specific layout classes', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.d-block.d-sm-none').exists()).toBe(true)
    })

    it('has desktop-specific layout classes', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.d-none.d-sm-flex').exists()).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles missing me value', () => {
      mockMe.value = null
      const wrapper = createWrapper()
      expect(wrapper.find('.b-card').exists()).toBe(true)
    })

    it('handles missing settings', () => {
      mockMe.value = { settings: null }
      const wrapper = createWrapper()
      expect(wrapper.vm.selectedArea).toBe(0)
    })
  })
})
