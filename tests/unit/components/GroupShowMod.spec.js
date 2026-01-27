import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GroupShowMod from '~/components/GroupShowMod.vue'

describe('GroupShowMod', () => {
  const mockMod = {
    displayname: 'Test Moderator',
    profile: {
      paththumb: '/images/test-avatar.jpg',
    },
  }

  function createWrapper(props = {}) {
    return mount(GroupShowMod, {
      props: { modtoshow: mockMod, ...props },
      global: {
        stubs: {
          ProfileImage: {
            template:
              '<div class="profile-image" :data-image="image" :data-alt="altText" :data-size="size"></div>',
            props: [
              'image',
              'isThumbnail',
              'size',
              'altText',
              'large',
              'border',
            ],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders a ProfileImage component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.profile-image').exists()).toBe(true)
    })

    it('sets title attribute to mod displayname', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('div').attributes('title')).toBe('Test Moderator')
    })

    it('passes correct image path to ProfileImage', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.profile-image').attributes('data-image')).toBe(
        '/images/test-avatar.jpg'
      )
    })

    it('passes displayname as alt text', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.profile-image').attributes('data-alt')).toBe(
        'Test Moderator'
      )
    })

    it('sets size to md', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.profile-image').attributes('data-size')).toBe('md')
    })
  })

  describe('props', () => {
    it('modtoshow prop is Object type', () => {
      const props = GroupShowMod.props
      expect(props.modtoshow.type).toBe(Object)
    })
  })

  describe('different mod data', () => {
    it('displays different mod name', () => {
      const mod = {
        displayname: 'Another Mod',
        profile: { paththumb: '/other.jpg' },
      }
      const wrapper = createWrapper({ modtoshow: mod })
      expect(wrapper.find('div').attributes('title')).toBe('Another Mod')
    })

    it('displays different profile image', () => {
      const mod = {
        displayname: 'Another Mod',
        profile: { paththumb: '/different-image.png' },
      }
      const wrapper = createWrapper({ modtoshow: mod })
      expect(wrapper.find('.profile-image').attributes('data-image')).toBe(
        '/different-image.png'
      )
    })
  })
})
