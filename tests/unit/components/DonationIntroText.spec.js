import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DonationIntroText from '~/components/DonationIntroText.vue'

describe('DonationIntroText', () => {
  function createWrapper(props = {}) {
    return mount(DonationIntroText, {
      props: {
        groupname: 'Test Freegle',
        ...props,
      },
    })
  }

  describe('rendering', () => {
    it('displays group name', () => {
      const wrapper = createWrapper({ groupname: 'Local Freegle' })
      expect(wrapper.text()).toContain('Local Freegle')
    })

    it('mentions being a charity', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('charity')
    })

    it('mentions free to use but not free to run', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('free to use')
      expect(wrapper.text()).toContain('not free to run')
    })

    it('displays target amount', () => {
      const wrapper = createWrapper({ target: 3000 })
      expect(wrapper.text()).toContain('£3000')
    })

    it('asks to please donate', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('please donate')
    })
  })

  describe('props', () => {
    it('defaults target to 2000', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('target')).toBe(2000)
    })

    it('accepts custom target', () => {
      const wrapper = createWrapper({ target: 5000 })
      expect(wrapper.props('target')).toBe(5000)
    })
  })

  describe('conditional text', () => {
    it('shows previous donor message when donated is set', () => {
      const wrapper = createWrapper({ donated: '2024-01-01' })
      expect(wrapper.text()).toContain("You've donated before")
      expect(wrapper.text()).toContain('donate again')
    })

    it('does not show previous donor message when not donated', () => {
      const wrapper = createWrapper({ donated: null })
      expect(wrapper.text()).not.toContain("You've donated before")
    })

    it('shows "for this community" when groupid set and target not met', () => {
      const wrapper = createWrapper({ groupid: 123, targetMet: false })
      expect(wrapper.text()).toContain('for this community')
    })

    it('shows "across the UK" when no groupid', () => {
      const wrapper = createWrapper({ groupid: null })
      expect(wrapper.text()).toContain('across the UK')
    })

    it('shows "across the UK" when target is met', () => {
      const wrapper = createWrapper({ groupid: 123, targetMet: true })
      expect(wrapper.text()).toContain('across the UK')
    })
  })

  describe('hideIntro', () => {
    it('hides content when hideIntro is true', () => {
      const wrapper = createWrapper({ hideIntro: true })
      // Component should be mostly empty
      expect(wrapper.text()).toBe('')
    })

    it('shows content when hideIntro is false', () => {
      const wrapper = createWrapper({ hideIntro: false })
      expect(wrapper.text()).toContain('please donate')
    })
  })
})
