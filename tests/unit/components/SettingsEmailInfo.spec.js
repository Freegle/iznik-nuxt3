import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SettingsEmailInfo from '~/components/SettingsEmailInfo.vue'

describe('SettingsEmailInfo', () => {
  function createWrapper(props = {}) {
    return mount(SettingsEmailInfo, {
      props: {
        simpleEmailSetting: 'Basic',
        ...props,
      },
      global: {
        stubs: {
          'b-button': {
            template:
              '<button :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size'],
            emits: ['click'],
          },
        },
      },
    })
  }

  describe('initial state', () => {
    it('shows "Click to see the emails" link by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Click to see the emails we send')
    })

    it('does not show email lists initially', () => {
      const wrapper = createWrapper()
      expect(wrapper.findAll('ul')).toHaveLength(0)
    })
  })

  describe('expand functionality', () => {
    it('shows email info when button clicked', async () => {
      const wrapper = createWrapper()
      await wrapper.find('button').trigger('click')
      expect(wrapper.findAll('ul').length).toBeGreaterThan(0)
    })

    it('hides "Click to see" button after click', async () => {
      const wrapper = createWrapper()
      await wrapper.find('button').trigger('click')
      expect(wrapper.text()).not.toContain('Click to see the emails we send')
    })
  })

  describe('Basic email setting', () => {
    it('shows what user will receive', async () => {
      const wrapper = createWrapper({ simpleEmailSetting: 'Basic' })
      await wrapper.find('button').trigger('click')
      expect(wrapper.text()).toContain('You will also receive')
      expect(wrapper.text()).toContain('Chat replies from other freeglers')
    })

    it('shows what user will NOT receive', async () => {
      const wrapper = createWrapper({ simpleEmailSetting: 'Basic' })
      await wrapper.find('button').trigger('click')
      expect(wrapper.text()).toContain('You will not receive')
      expect(wrapper.text()).toContain('Community Event emails')
      expect(wrapper.text()).toContain('Volunteer Opportunity emails')
      expect(wrapper.text()).toContain('Emails about ChitChat posts')
    })
  })

  describe('non-Basic email setting', () => {
    it('shows expanded list of what user will receive', async () => {
      const wrapper = createWrapper({ simpleEmailSetting: 'Full' })
      await wrapper.find('button').trigger('click')
      expect(wrapper.text()).toContain('You will also receive')
      expect(wrapper.text()).toContain('Community Event emails')
      expect(wrapper.text()).toContain('Volunteer Opportunity emails')
    })

    it('does NOT show "You will not receive" section', async () => {
      const wrapper = createWrapper({ simpleEmailSetting: 'Full' })
      await wrapper.find('button').trigger('click')
      expect(wrapper.text()).not.toContain('You will not receive')
    })
  })

  describe('props', () => {
    it('requires simpleEmailSetting prop', () => {
      const wrapper = createWrapper({ simpleEmailSetting: 'Basic' })
      expect(wrapper.props('simpleEmailSetting')).toBe('Basic')
    })
  })
})
