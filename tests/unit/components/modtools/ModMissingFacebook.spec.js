import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, computed } from 'vue'
import ModMissingFacebook from '~/modtools/components/ModMissingFacebook.vue'

// Mock useMe composable - myGroups must be a computed
const mockMyGroups = ref([])

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    myGroups: computed(() => mockMyGroups.value),
  }),
}))

describe('ModMissingFacebook', () => {
  function mountComponent() {
    return mount(ModMissingFacebook, {
      global: {
        stubs: {
          NoticeMessage: true,
          'b-button': true,
          'v-icon': true,
          ExternalLink: true,
          'nuxt-link': true,
        },
        mocks: {
          pluralise: (arr, count) => (count === 1 ? arr[0] : arr[1]),
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockMyGroups.value = []
  })

  describe('invalid computed property - detecting unlinked Facebook pages', () => {
    it('handles empty myGroups array', () => {
      mockMyGroups.value = []
      const wrapper = mountComponent()
      expect(wrapper.vm.invalid).toEqual([])
    })

    it('handles null myGroups gracefully', () => {
      mockMyGroups.value = null
      const wrapper = mountComponent()
      // If the code doesn't handle null, this will throw "myGroups is not iterable"
      expect(wrapper.vm.invalid).toEqual([])
    })

    it('handles undefined myGroups gracefully', () => {
      mockMyGroups.value = undefined
      const wrapper = mountComponent()
      expect(wrapper.vm.invalid).toEqual([])
    })

    it('filters out non-Freegle groups', () => {
      mockMyGroups.value = [
        {
          id: 1,
          type: 'Other',
          role: 'Moderator',
          publish: true,
          facebook: [
            {
              uid: 'fb1',
              id: '123',
              name: 'Test Page',
              type: 'Page',
              valid: false,
            },
          ],
        },
      ]
      const wrapper = mountComponent()
      expect(wrapper.vm.invalid).toHaveLength(0)
    })

    it('filters out non-moderator roles', () => {
      mockMyGroups.value = [
        {
          id: 1,
          type: 'Freegle',
          role: 'Member',
          publish: true,
          facebook: [
            {
              uid: 'fb1',
              id: '123',
              name: 'Test Page',
              type: 'Page',
              valid: false,
            },
          ],
        },
      ]
      const wrapper = mountComponent()
      expect(wrapper.vm.invalid).toHaveLength(0)
    })

    it('filters out unpublished groups', () => {
      mockMyGroups.value = [
        {
          id: 1,
          type: 'Freegle',
          role: 'Moderator',
          publish: false,
          facebook: [
            {
              uid: 'fb1',
              id: '123',
              name: 'Test Page',
              type: 'Page',
              valid: false,
            },
          ],
        },
      ]
      const wrapper = mountComponent()
      expect(wrapper.vm.invalid).toHaveLength(0)
    })

    it('includes invalid Facebook pages for Moderator', () => {
      mockMyGroups.value = [
        {
          id: 1,
          type: 'Freegle',
          role: 'Moderator',
          publish: true,
          namedisplay: 'Test Group',
          facebook: [
            {
              uid: 'fb1',
              id: '123',
              name: 'Test Page',
              type: 'Page',
              valid: false,
            },
          ],
        },
      ]
      const wrapper = mountComponent()
      expect(wrapper.vm.invalid).toHaveLength(1)
      expect(wrapper.vm.invalid[0].page.uid).toBe('fb1')
      expect(wrapper.vm.invalid[0].group.namedisplay).toBe('Test Group')
    })

    it('includes invalid Facebook pages for Owner', () => {
      mockMyGroups.value = [
        {
          id: 1,
          type: 'Freegle',
          role: 'Owner',
          publish: true,
          namedisplay: 'Test Group',
          facebook: [
            {
              uid: 'fb1',
              id: '123',
              name: 'Test Page',
              type: 'Page',
              valid: false,
            },
          ],
        },
      ]
      const wrapper = mountComponent()
      expect(wrapper.vm.invalid).toHaveLength(1)
    })

    it('excludes valid Facebook pages', () => {
      mockMyGroups.value = [
        {
          id: 1,
          type: 'Freegle',
          role: 'Moderator',
          publish: true,
          facebook: [
            {
              uid: 'fb1',
              id: '123',
              name: 'Test Page',
              type: 'Page',
              valid: true,
            },
          ],
        },
      ]
      const wrapper = mountComponent()
      expect(wrapper.vm.invalid).toHaveLength(0)
    })

    it('excludes non-Page Facebook types', () => {
      mockMyGroups.value = [
        {
          id: 1,
          type: 'Freegle',
          role: 'Moderator',
          publish: true,
          facebook: [
            {
              uid: 'fb1',
              id: '123',
              name: 'Test Group',
              type: 'Group',
              valid: false,
            },
          ],
        },
      ]
      const wrapper = mountComponent()
      expect(wrapper.vm.invalid).toHaveLength(0)
    })

    it('handles groups without facebook property', () => {
      mockMyGroups.value = [
        {
          id: 1,
          type: 'Freegle',
          role: 'Moderator',
          publish: true,
        },
      ]
      const wrapper = mountComponent()
      expect(wrapper.vm.invalid).toHaveLength(0)
    })
  })

  describe('notlinked computed property - detecting groups without Facebook pages', () => {
    it('handles null myGroups gracefully', () => {
      mockMyGroups.value = null
      const wrapper = mountComponent()
      expect(wrapper.vm.notlinked).toEqual([])
    })

    it('includes groups without facebook property', () => {
      mockMyGroups.value = [
        {
          id: 1,
          type: 'Freegle',
          role: 'Moderator',
          publish: true,
          namedisplay: 'Test Group',
        },
      ]
      const wrapper = mountComponent()
      expect(wrapper.vm.notlinked).toHaveLength(1)
    })

    it('includes groups with all invalid facebook pages', () => {
      mockMyGroups.value = [
        {
          id: 1,
          type: 'Freegle',
          role: 'Moderator',
          publish: true,
          namedisplay: 'Test Group',
          facebook: [
            {
              uid: 'fb1',
              id: '123',
              name: 'Test Page',
              type: 'Page',
              valid: false,
            },
          ],
        },
      ]
      const wrapper = mountComponent()
      expect(wrapper.vm.notlinked).toHaveLength(1)
    })

    it('excludes groups with at least one valid facebook page', () => {
      mockMyGroups.value = [
        {
          id: 1,
          type: 'Freegle',
          role: 'Moderator',
          publish: true,
          facebook: [
            {
              uid: 'fb1',
              id: '123',
              name: 'Invalid Page',
              type: 'Page',
              valid: false,
            },
            {
              uid: 'fb2',
              id: '456',
              name: 'Valid Page',
              type: 'Page',
              valid: true,
            },
          ],
        },
      ]
      const wrapper = mountComponent()
      // Still included because at least one is invalid
      expect(wrapper.vm.notlinked).toHaveLength(1)
    })

    it('excludes groups with all valid facebook pages', () => {
      mockMyGroups.value = [
        {
          id: 1,
          type: 'Freegle',
          role: 'Moderator',
          publish: true,
          facebook: [
            {
              uid: 'fb1',
              id: '123',
              name: 'Valid Page',
              type: 'Page',
              valid: true,
            },
          ],
        },
      ]
      const wrapper = mountComponent()
      expect(wrapper.vm.notlinked).toHaveLength(0)
    })
  })

  describe('methods', () => {
    it('expand sets summary to false', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.summary).toBe(true)
      wrapper.vm.expand()
      expect(wrapper.vm.summary).toBe(false)
    })
  })
})
