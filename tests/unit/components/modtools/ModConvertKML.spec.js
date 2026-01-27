import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ModConvertKML from '~/modtools/components/ModConvertKML.vue'

// Mock the location store
const mockConvertKML = vi.fn()

vi.mock('@/stores/location', () => ({
  useLocationStore: () => ({
    convertKML: mockConvertKML,
  }),
}))

describe('ModConvertKML', () => {
  function mountComponent() {
    return mount(ModConvertKML, {
      global: {
        plugins: [createPinia()],
        stubs: {
          'b-card': {
            template: '<div class="card"><slot /></div>',
          },
          'b-card-header': {
            template: '<div class="card-header"><slot /></div>',
          },
          'b-card-body': {
            template: '<div class="card-body"><slot /></div>',
          },
          'b-form-textarea': {
            template:
              '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'rows', 'placeholder'],
          },
          'b-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockConvertKML.mockResolvedValue('POLYGON ((0 0, 0 1, 1 1, 1 0, 0 0))')
  })

  describe('rendering', () => {
    it('renders card header', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('KML Converter')
    })

    it('renders description text', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('This converts KML to WKT')
    })

    it('renders input textarea', () => {
      const wrapper = mountComponent()
      expect(wrapper.findAll('textarea').length).toBeGreaterThanOrEqual(1)
    })

    it('renders Convert button', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Convert')
    })

    it('does not render wkt textarea initially', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.wkt).toBe(null)
    })

    it('renders wkt textarea when wkt has value', async () => {
      const wrapper = mountComponent()
      wrapper.vm.wkt = 'POLYGON ((0 0, 0 1, 1 1, 1 0, 0 0))'
      await wrapper.vm.$nextTick()
      expect(wrapper.findAll('textarea')).toHaveLength(2)
    })
  })

  describe('data', () => {
    it('has kml initialized to null', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.kml).toBe(null)
    })

    it('has wkt initialized to null', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.wkt).toBe(null)
    })
  })

  describe('methods', () => {
    it('convert calls locationStore.convertKML', async () => {
      const wrapper = mountComponent()
      wrapper.vm.kml = '<kml>test</kml>'
      await wrapper.vm.convert()
      expect(mockConvertKML).toHaveBeenCalledWith('<kml>test</kml>')
    })

    it('convert sets wkt from store response', async () => {
      const wrapper = mountComponent()
      wrapper.vm.kml = '<kml>test</kml>'
      await wrapper.vm.convert()
      expect(wrapper.vm.wkt).toBe('POLYGON ((0 0, 0 1, 1 1, 1 0, 0 0))')
    })

    it('clicking Convert button triggers convert', async () => {
      const wrapper = mountComponent()
      wrapper.vm.kml = '<kml>test</kml>'
      await wrapper.find('button').trigger('click')
      expect(mockConvertKML).toHaveBeenCalled()
    })
  })
})
