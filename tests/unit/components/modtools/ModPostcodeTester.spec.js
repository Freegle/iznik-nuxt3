import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import ModPostcodeTester from '~/modtools/components/ModPostcodeTester.vue'

describe('ModPostcodeTester', () => {
  // Create a proper PostCode stub component
  const PostCodeStub = defineComponent({
    name: 'PostCode',
    props: {
      find: {
        type: Boolean,
        default: true,
      },
    },
    emits: ['selected', 'cleared'],
    template: '<div class="postcode-stub" data-testid="postcode" />',
  })

  function mountComponent(stubs = {}) {
    return mount(ModPostcodeTester, {
      global: {
        stubs: {
          'b-card': {
            template:
              '<div class="b-card"><slot name="header" /><slot /></div>',
            props: ['noBody'],
          },
          'b-card-header': {
            template: '<div class="b-card-header"><slot /></div>',
            props: ['class'],
          },
          'b-card-body': {
            template: '<div class="b-card-body"><slot /></div>',
          },
          PostCode: PostCodeStub,
          ...stubs,
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders a card component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.b-card').exists()).toBe(true)
    })

    it('renders a card header with "Postcode Tester" title', () => {
      const wrapper = mountComponent()
      const header = wrapper.find('.b-card-header')
      expect(header.exists()).toBe(true)
      expect(header.text()).toContain('Postcode Tester')
    })

    it('renders a card body', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.b-card-body').exists()).toBe(true)
    })

    it('renders the PostCode component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('[data-testid="postcode"]').exists()).toBe(true)
    })

    it('renders explanatory text about postcode mapping', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'You can see which community and area a postcode will map to'
      )
    })

    it('renders bold warning about postcode changes timing', () => {
      const wrapper = mountComponent()
      const boldText = wrapper.find('b')
      expect(boldText.exists()).toBe(true)
      expect(boldText.text()).toContain(
        'Postcode changes within an area you change should take effect immediately'
      )
    })

    it('passes find=false prop to PostCode component', () => {
      const wrapper = mountComponent()
      const postcodeStub = wrapper.findComponent(PostCodeStub)
      expect(postcodeStub.props('find')).toBe(false)
    })
  })

  describe('initial state', () => {
    it('does not show community/area info when no postcode selected', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).not.toContain('Community:')
      expect(wrapper.text()).not.toContain('Area:')
    })

    it('has postcode ref initialized to null', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.postcode).toBeNull()
    })
  })

  describe('postcodeSelect method', () => {
    it('updates postcode ref when PostCode emits selected event', async () => {
      const wrapper = mountComponent()
      const postcodeData = {
        name: 'EH1 1AA',
        groupsnear: [{ namedisplay: 'Edinburgh Freegle' }],
        areaname: 'Edinburgh Central',
      }

      const postcodeComponent = wrapper.findComponent(PostCodeStub)
      await postcodeComponent.vm.$emit('selected', postcodeData)

      expect(wrapper.vm.postcode).toEqual(postcodeData)
    })

    it('can handle postcode without groupsnear', async () => {
      const wrapper = mountComponent()
      const postcodeData = {
        name: 'ZZ1 1AA',
        groupsnear: null,
        areaname: 'Remote Area',
      }

      const postcodeComponent = wrapper.findComponent(PostCodeStub)
      await postcodeComponent.vm.$emit('selected', postcodeData)

      expect(wrapper.vm.postcode).toEqual(postcodeData)
    })

    it('can handle postcode without areaname', async () => {
      const wrapper = mountComponent()
      const postcodeData = {
        name: 'EH1 1AA',
        groupsnear: [{ namedisplay: 'Edinburgh Freegle' }],
        areaname: null,
      }

      const postcodeComponent = wrapper.findComponent(PostCodeStub)
      await postcodeComponent.vm.$emit('selected', postcodeData)

      expect(wrapper.vm.postcode).toEqual(postcodeData)
    })
  })

  describe('postcode display - with community', () => {
    it('shows Community section after postcode is selected', async () => {
      const wrapper = mountComponent()
      const postcodeData = {
        name: 'EH1 1AA',
        groupsnear: [{ namedisplay: 'Edinburgh Freegle' }],
        areaname: 'Edinburgh Central',
      }

      const postcodeComponent = wrapper.findComponent(PostCodeStub)
      await postcodeComponent.vm.$emit('selected', postcodeData)

      expect(wrapper.text()).toContain('Community:')
    })

    it('displays community name when groupsnear has entries', async () => {
      const wrapper = mountComponent()
      const postcodeData = {
        name: 'EH1 1AA',
        groupsnear: [{ namedisplay: 'Edinburgh Freegle' }],
        areaname: 'Edinburgh Central',
      }

      const postcodeComponent = wrapper.findComponent(PostCodeStub)
      await postcodeComponent.vm.$emit('selected', postcodeData)

      expect(wrapper.text()).toContain('Edinburgh Freegle')
    })

    it('displays first community when multiple groups are near', async () => {
      const wrapper = mountComponent()
      const postcodeData = {
        name: 'EH1 1AA',
        groupsnear: [
          { namedisplay: 'Edinburgh Freegle' },
          { namedisplay: 'Leith Freegle' },
        ],
        areaname: 'Edinburgh Central',
      }

      const postcodeComponent = wrapper.findComponent(PostCodeStub)
      await postcodeComponent.vm.$emit('selected', postcodeData)

      expect(wrapper.text()).toContain('Edinburgh Freegle')
      expect(wrapper.text()).not.toContain('Leith Freegle')
    })
  })

  describe('postcode display - no community', () => {
    it('shows "No community found" when groupsnear is empty array', async () => {
      const wrapper = mountComponent()
      const postcodeData = {
        name: 'ZZ1 1AA',
        groupsnear: [],
        areaname: 'Remote Area',
      }

      const postcodeComponent = wrapper.findComponent(PostCodeStub)
      await postcodeComponent.vm.$emit('selected', postcodeData)

      expect(wrapper.text()).toContain('No community found')
    })

    it('shows "No community found" when groupsnear is null', async () => {
      const wrapper = mountComponent()
      const postcodeData = {
        name: 'ZZ1 1AA',
        groupsnear: null,
        areaname: 'Remote Area',
      }

      const postcodeComponent = wrapper.findComponent(PostCodeStub)
      await postcodeComponent.vm.$emit('selected', postcodeData)

      expect(wrapper.text()).toContain('No community found')
    })

    it('shows "No community found" when groupsnear is undefined', async () => {
      const wrapper = mountComponent()
      const postcodeData = {
        name: 'ZZ1 1AA',
        areaname: 'Remote Area',
      }

      const postcodeComponent = wrapper.findComponent(PostCodeStub)
      await postcodeComponent.vm.$emit('selected', postcodeData)

      expect(wrapper.text()).toContain('No community found')
    })
  })

  describe('postcode display - with area', () => {
    it('shows Area section after postcode is selected', async () => {
      const wrapper = mountComponent()
      const postcodeData = {
        name: 'EH1 1AA',
        groupsnear: [{ namedisplay: 'Edinburgh Freegle' }],
        areaname: 'Edinburgh Central',
      }

      const postcodeComponent = wrapper.findComponent(PostCodeStub)
      await postcodeComponent.vm.$emit('selected', postcodeData)

      expect(wrapper.text()).toContain('Area:')
    })

    it('displays area name when areaname is present', async () => {
      const wrapper = mountComponent()
      const postcodeData = {
        name: 'EH1 1AA',
        groupsnear: [{ namedisplay: 'Edinburgh Freegle' }],
        areaname: 'Edinburgh Central',
      }

      const postcodeComponent = wrapper.findComponent(PostCodeStub)
      await postcodeComponent.vm.$emit('selected', postcodeData)

      expect(wrapper.text()).toContain('Edinburgh Central')
    })
  })

  describe('postcode display - no area', () => {
    it('shows "No area found" when areaname is null', async () => {
      const wrapper = mountComponent()
      const postcodeData = {
        name: 'EH1 1AA',
        groupsnear: [{ namedisplay: 'Edinburgh Freegle' }],
        areaname: null,
      }

      const postcodeComponent = wrapper.findComponent(PostCodeStub)
      await postcodeComponent.vm.$emit('selected', postcodeData)

      expect(wrapper.text()).toContain('No area found')
    })

    it('shows "No area found" when areaname is undefined', async () => {
      const wrapper = mountComponent()
      const postcodeData = {
        name: 'EH1 1AA',
        groupsnear: [{ namedisplay: 'Edinburgh Freegle' }],
      }

      const postcodeComponent = wrapper.findComponent(PostCodeStub)
      await postcodeComponent.vm.$emit('selected', postcodeData)

      expect(wrapper.text()).toContain('No area found')
    })

    it('shows "No area found" when areaname is empty string', async () => {
      const wrapper = mountComponent()
      const postcodeData = {
        name: 'EH1 1AA',
        groupsnear: [{ namedisplay: 'Edinburgh Freegle' }],
        areaname: '',
      }

      const postcodeComponent = wrapper.findComponent(PostCodeStub)
      await postcodeComponent.vm.$emit('selected', postcodeData)

      expect(wrapper.text()).toContain('No area found')
    })
  })

  describe('user interactions', () => {
    it('selecting different postcodes updates display', async () => {
      const wrapper = mountComponent()
      const postcodeComponent = wrapper.findComponent(PostCodeStub)

      // First selection
      const firstPostcode = {
        name: 'EH1 1AA',
        groupsnear: [{ namedisplay: 'Edinburgh Freegle' }],
        areaname: 'Edinburgh Central',
      }
      await postcodeComponent.vm.$emit('selected', firstPostcode)
      expect(wrapper.text()).toContain('Edinburgh Freegle')

      // Second selection
      const secondPostcode = {
        name: 'G1 1AA',
        groupsnear: [{ namedisplay: 'Glasgow Freegle' }],
        areaname: 'Glasgow City Centre',
      }
      await postcodeComponent.vm.$emit('selected', secondPostcode)
      expect(wrapper.text()).toContain('Glasgow Freegle')
      expect(wrapper.text()).toContain('Glasgow City Centre')
      expect(wrapper.text()).not.toContain('Edinburgh Freegle')
    })
  })

  describe('component structure', () => {
    it('has mt-2 class on results div when postcode is selected', async () => {
      const wrapper = mountComponent()
      const postcodeData = {
        name: 'EH1 1AA',
        groupsnear: [{ namedisplay: 'Edinburgh Freegle' }],
        areaname: 'Edinburgh Central',
      }

      const postcodeComponent = wrapper.findComponent(PostCodeStub)
      await postcodeComponent.vm.$emit('selected', postcodeData)

      expect(wrapper.find('.mt-2').exists()).toBe(true)
    })

    it('has font-weight-bold class on Community label', async () => {
      const wrapper = mountComponent()
      const postcodeData = {
        name: 'EH1 1AA',
        groupsnear: [{ namedisplay: 'Edinburgh Freegle' }],
        areaname: 'Edinburgh Central',
      }

      const postcodeComponent = wrapper.findComponent(PostCodeStub)
      await postcodeComponent.vm.$emit('selected', postcodeData)

      const boldElements = wrapper.findAll('.font-weight-bold')
      const communityLabel = boldElements.find((el) =>
        el.text().includes('Community:')
      )
      expect(communityLabel).toBeTruthy()
    })

    it('has font-weight-bold class on Area label', async () => {
      const wrapper = mountComponent()
      const postcodeData = {
        name: 'EH1 1AA',
        groupsnear: [{ namedisplay: 'Edinburgh Freegle' }],
        areaname: 'Edinburgh Central',
      }

      const postcodeComponent = wrapper.findComponent(PostCodeStub)
      await postcodeComponent.vm.$emit('selected', postcodeData)

      const boldElements = wrapper.findAll('.font-weight-bold')
      const areaLabel = boldElements.find((el) => el.text().includes('Area:'))
      expect(areaLabel).toBeTruthy()
    })
  })

  describe('edge cases', () => {
    it('handles postcode with empty object for groupsnear entry', async () => {
      const wrapper = mountComponent()
      const postcodeData = {
        name: 'EH1 1AA',
        groupsnear: [{}],
        areaname: 'Edinburgh Central',
      }

      const postcodeComponent = wrapper.findComponent(PostCodeStub)
      await postcodeComponent.vm.$emit('selected', postcodeData)

      // Should not throw, should render (though namedisplay will be undefined)
      expect(wrapper.vm.postcode).toEqual(postcodeData)
    })

    it('handles selecting null as postcode', async () => {
      const wrapper = mountComponent()

      // First select a valid postcode
      const postcodeData = {
        name: 'EH1 1AA',
        groupsnear: [{ namedisplay: 'Edinburgh Freegle' }],
        areaname: 'Edinburgh Central',
      }
      const postcodeComponent = wrapper.findComponent(PostCodeStub)
      await postcodeComponent.vm.$emit('selected', postcodeData)
      expect(wrapper.text()).toContain('Community:')

      // Then select null (simulating clearing)
      await postcodeComponent.vm.$emit('selected', null)
      expect(wrapper.vm.postcode).toBeNull()
      expect(wrapper.text()).not.toContain('Community:')
    })
  })
})
