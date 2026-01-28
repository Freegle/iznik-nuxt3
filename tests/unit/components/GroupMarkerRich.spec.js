import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GroupMarkerRich from '~/components/GroupMarkerRich.vue'

describe('GroupMarkerRich', () => {
  const mockGroup = {
    namedisplay: 'Test Freegle Group',
    profile: '/images/test-group.jpg',
  }

  function createWrapper(props = {}) {
    return mount(GroupMarkerRich, {
      props: { group: mockGroup, ...props },
      global: {
        stubs: {
          'group-profile-image': {
            template:
              '<div class="group-profile-image" :data-image="image" :data-alt="altText" :data-size="size"></div>',
            props: ['image', 'altText', 'size'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders group profile image', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.group-profile-image').exists()).toBe(true)
    })

    it('displays group name', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('h6').text()).toBe('Test Freegle Group')
    })

    it('has styling classes on name', () => {
      const wrapper = createWrapper()
      const h6 = wrapper.find('h6')
      expect(h6.classes()).toContain('text-success')
      expect(h6.classes()).toContain('border-success')
    })
  })

  describe('profile image', () => {
    it('passes group profile image', () => {
      const wrapper = createWrapper()
      expect(
        wrapper.find('.group-profile-image').attributes('data-image')
      ).toBe('/images/test-group.jpg')
    })

    it('uses default icon when no profile', () => {
      const group = { namedisplay: 'No Profile Group', profile: null }
      const wrapper = createWrapper({ group })
      expect(
        wrapper.find('.group-profile-image').attributes('data-image')
      ).toBe('/icon.png')
    })

    it('passes alt text with group name', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.group-profile-image').attributes('data-alt')).toBe(
        'Profile picture for Test Freegle Group'
      )
    })

    it('uses sm size', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.group-profile-image').attributes('data-size')).toBe(
        'sm'
      )
    })
  })

  describe('props', () => {
    it('group prop is Object type', () => {
      const props = GroupMarkerRich.props
      expect(props.group.type).toBe(Object)
    })
  })

  describe('different groups', () => {
    it('displays different group name', () => {
      const group = { namedisplay: 'Another Group', profile: '/other.jpg' }
      const wrapper = createWrapper({ group })
      expect(wrapper.find('h6').text()).toBe('Another Group')
    })
  })
})
