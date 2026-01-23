import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NoticeboardCheck from '~/components/NoticeboardCheck.vue'

describe('NoticeboardCheck', () => {
  const mockNoticeboard = {
    id: 1,
    name: 'Test Noticeboard',
  }

  const mockUser = {
    displayname: 'John Smith',
  }

  function createWrapper(check) {
    return mount(NoticeboardCheck, {
      props: {
        noticeboard: mockNoticeboard,
        check,
      },
    })
  }

  describe('rendering', () => {
    it('mounts successfully', () => {
      const wrapper = createWrapper({
        checkedat: '2026-01-15',
        inactive: true,
      })
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('inactive check', () => {
    it('shows inactive message', () => {
      const wrapper = createWrapper({
        checkedat: '2026-01-15',
        inactive: true,
      })
      expect(wrapper.text()).toContain('Marked as no longer active')
    })

    it('shows user name when available', () => {
      const wrapper = createWrapper({
        checkedat: '2026-01-15',
        inactive: true,
        user: mockUser,
      })
      expect(wrapper.text()).toContain('by John Smith')
    })

    it('shows formatted date', () => {
      const wrapper = createWrapper({
        checkedat: '2026-01-15',
        inactive: true,
      })
      // dayjs outputs ordinal format - just verify month and year are present
      expect(wrapper.text()).toContain('January, 2026')
    })
  })

  describe('refreshed check', () => {
    it('shows poster put up message', () => {
      const wrapper = createWrapper({
        checkedat: '2026-03-20',
        refreshed: true,
      })
      expect(wrapper.text()).toContain('Poster put up')
    })

    it('shows user name when available', () => {
      const wrapper = createWrapper({
        checkedat: '2026-03-20',
        refreshed: true,
        user: mockUser,
      })
      expect(wrapper.text()).toContain('by John Smith')
    })
  })

  describe('check with comments', () => {
    it('shows comment text', () => {
      const wrapper = createWrapper({
        checkedat: '2026-02-10',
        comments: 'Noticeboard is full',
      })
      expect(wrapper.text()).toContain('Noticeboard is full')
    })

    it('shows user name when available', () => {
      const wrapper = createWrapper({
        checkedat: '2026-02-10',
        comments: 'Some comment',
        user: mockUser,
      })
      expect(wrapper.text()).toContain('by John Smith')
    })
  })

  describe('props', () => {
    it('requires noticeboard prop', () => {
      const props = NoticeboardCheck.props
      expect(props.noticeboard.required).toBe(true)
    })

    it('noticeboard prop is Object type', () => {
      const props = NoticeboardCheck.props
      expect(props.noticeboard.type).toBe(Object)
    })

    it('requires check prop', () => {
      const props = NoticeboardCheck.props
      expect(props.check.required).toBe(true)
    })

    it('check prop is Object type', () => {
      const props = NoticeboardCheck.props
      expect(props.check.type).toBe(Object)
    })
  })

  describe('computed checkedat', () => {
    it('formats different dates correctly', () => {
      const wrapper = createWrapper({
        checkedat: '2026-12-25',
        inactive: true,
      })
      // dayjs outputs ordinal format - just verify month and year are present
      expect(wrapper.text()).toContain('December, 2026')
    })
  })
})
