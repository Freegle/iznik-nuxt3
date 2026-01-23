import { describe, it, expect, vi, beforeEach } from 'vitest'
import { icon, variant } from '~/modtools/composables/useStdMsgs'

// This component uses auto-imported functions (icon, variant) from useStdMsgs.
// Since Vitest doesn't have Nuxt's auto-import system, we test the composable
// functions directly. The component's behavior is tested via e2e tests.
describe('ModSettingsStandardMessageButton - useStdMsgs composable', () => {
  describe('icon function', () => {
    it('returns check for Approve action', () => {
      expect(icon({ action: 'Approve' })).toBe('check')
    })

    it('returns times for Reject action', () => {
      expect(icon({ action: 'Reject' })).toBe('times')
    })

    it('returns envelope for Leave action', () => {
      expect(icon({ action: 'Leave' })).toBe('envelope')
    })

    it('returns envelope for Leave Approved Message action', () => {
      expect(icon({ action: 'Leave Approved Message' })).toBe('envelope')
    })

    it('returns envelope for Leave Approved Member action', () => {
      expect(icon({ action: 'Leave Approved Member' })).toBe('envelope')
    })

    it('returns trash-alt for Delete action', () => {
      expect(icon({ action: 'Delete' })).toBe('trash-alt')
    })

    it('returns trash-alt for Delete Approved Message action', () => {
      expect(icon({ action: 'Delete Approved Message' })).toBe('trash-alt')
    })

    it('returns trash-alt for Delete Approved Member action', () => {
      expect(icon({ action: 'Delete Approved Member' })).toBe('trash-alt')
    })

    it('returns pen for Edit action', () => {
      expect(icon({ action: 'Edit' })).toBe('pen')
    })

    it('returns pause for Hold Message action', () => {
      expect(icon({ action: 'Hold Message' })).toBe('pause')
    })

    it('returns check as default for unknown action', () => {
      expect(icon({ action: 'UnknownAction' })).toBe('check')
    })

    it('returns check for undefined action', () => {
      expect(icon({})).toBe('check')
    })
  })

  describe('variant function', () => {
    it('returns primary for Approve action', () => {
      expect(variant({ action: 'Approve' })).toBe('primary')
    })

    it('returns warning for Reject action', () => {
      expect(variant({ action: 'Reject' })).toBe('warning')
    })

    it('returns primary for Leave action', () => {
      expect(variant({ action: 'Leave' })).toBe('primary')
    })

    it('returns primary for Leave Approved Message action', () => {
      expect(variant({ action: 'Leave Approved Message' })).toBe('primary')
    })

    it('returns primary for Leave Approved Member action', () => {
      expect(variant({ action: 'Leave Approved Member' })).toBe('primary')
    })

    it('returns danger for Delete action', () => {
      expect(variant({ action: 'Delete' })).toBe('danger')
    })

    it('returns danger for Delete Approved Message action', () => {
      expect(variant({ action: 'Delete Approved Message' })).toBe('danger')
    })

    it('returns danger for Delete Approved Member action', () => {
      expect(variant({ action: 'Delete Approved Member' })).toBe('danger')
    })

    it('returns primary for Edit action', () => {
      expect(variant({ action: 'Edit' })).toBe('primary')
    })

    it('returns warning for Hold Message action', () => {
      expect(variant({ action: 'Hold Message' })).toBe('warning')
    })

    it('returns white as default for unknown action', () => {
      expect(variant({ action: 'UnknownAction' })).toBe('white')
    })

    it('returns white for undefined action', () => {
      expect(variant({})).toBe('white')
    })
  })
})
