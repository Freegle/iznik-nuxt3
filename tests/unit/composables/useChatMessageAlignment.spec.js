import { describe, it, expect } from 'vitest'

// We test the messageIsFromCurrentUser logic directly without mounting components.
// This mirrors the logic in composables/useChat.js and modtools/composables/useChatMT.js.

function makeAlignmentFn({ myid, chattype, user1, user2, pov }) {
  // Reproduces the messageIsFromCurrentUser computed from useChat.js
  return function isFromCurrentUser(messageUserid) {
    const u1 = user1
    const u2 = user2
    const isParticipant = myid === u1 || myid === u2

    if (chattype === 'User2Mod') {
      if (myid === u1) {
        return messageUserid === myid
      }
      return u1 !== messageUserid
    }

    if (chattype === 'User2User') {
      if (pov) {
        if (pov === u1) {
          return messageUserid === u1
        } else {
          return messageUserid !== u1
        }
      }
      if (!isParticipant) {
        return u1 !== messageUserid
      }
    }

    return messageUserid === myid
  }
}

function makeMTAlignmentFn({ chattype, user1, pov }) {
  // Reproduces the messageIsFromCurrentUser computed from useChatMT.js
  return function isFromCurrentUser(messageUserid) {
    const u1 = user1

    if (chattype === 'User2Mod') {
      return u1 !== messageUserid
    }

    if (chattype === 'User2User') {
      if (pov) {
        if (pov === u1) {
          return messageUserid === u1
        } else {
          return messageUserid !== u1
        }
      }
      return u1 !== messageUserid
    }

    return u1 !== messageUserid
  }
}

describe('Chat message alignment (useChat.js)', () => {
  describe('User2User — participant viewing', () => {
    it('user1 (Alice) sees own messages on right', () => {
      const fn = makeAlignmentFn({
        myid: 1,
        chattype: 'User2User',
        user1: 1,
        user2: 2,
        pov: null,
      })
      expect(fn(1)).toBe(true) // Alice's msg → RIGHT
      expect(fn(2)).toBe(false) // Bob's msg → LEFT
    })

    it('user2 (Bob) sees own messages on right', () => {
      const fn = makeAlignmentFn({
        myid: 2,
        chattype: 'User2User',
        user1: 1,
        user2: 2,
        pov: null,
      })
      expect(fn(2)).toBe(true) // Bob's msg → RIGHT
      expect(fn(1)).toBe(false) // Alice's msg → LEFT
    })
  })

  describe('User2User — mod viewing from chat review (no pov, non-participant)', () => {
    it('user1 messages on left, user2 on right', () => {
      const fn = makeAlignmentFn({
        myid: 99,
        chattype: 'User2User',
        user1: 1,
        user2: 2,
        pov: null,
      })
      expect(fn(1)).toBe(false) // user1 → LEFT
      expect(fn(2)).toBe(true) // user2 → RIGHT
    })
  })

  describe('User2User — support viewing with pov', () => {
    it('pov=user2: user1 left, user2 right', () => {
      const fn = makeAlignmentFn({
        myid: 99,
        chattype: 'User2User',
        user1: 1,
        user2: 2,
        pov: 2,
      })
      expect(fn(1)).toBe(false) // user1 → LEFT
      expect(fn(2)).toBe(true) // user2 → RIGHT
    })

    it('pov=user1: user1 right, user2 left', () => {
      const fn = makeAlignmentFn({
        myid: 99,
        chattype: 'User2User',
        user1: 1,
        user2: 2,
        pov: 1,
      })
      expect(fn(1)).toBe(true) // user1 → RIGHT
      expect(fn(2)).toBe(false) // user2 → LEFT
    })
  })

  describe('User2Mod — member (user1) viewing on Freegle site', () => {
    it('member sees own messages on right, mod messages on left', () => {
      const fn = makeAlignmentFn({
        myid: 1,
        chattype: 'User2Mod',
        user1: 1,
        user2: 0,
        pov: null,
      })
      expect(fn(1)).toBe(true) // member's msg → RIGHT
      expect(fn(50)).toBe(false) // mod A's msg → LEFT
      expect(fn(51)).toBe(false) // mod B's msg → LEFT
    })
  })

  describe('User2Mod — mod viewing (not user1)', () => {
    it('member messages left, ALL mod messages right', () => {
      const fn = makeAlignmentFn({
        myid: 50,
        chattype: 'User2Mod',
        user1: 1,
        user2: 0,
        pov: null,
      })
      expect(fn(1)).toBe(false) // member → LEFT
      expect(fn(50)).toBe(true) // mod A (self) → RIGHT
      expect(fn(51)).toBe(true) // mod B (other mod) → RIGHT
    })
  })

  describe('User2Mod — different mod who never posted, just viewing', () => {
    it('same alignment as any mod viewer', () => {
      const fn = makeAlignmentFn({
        myid: 52,
        chattype: 'User2Mod',
        user1: 1,
        user2: 0,
        pov: null,
      })
      expect(fn(1)).toBe(false) // member → LEFT
      expect(fn(50)).toBe(true) // mod A → RIGHT
      expect(fn(51)).toBe(true) // mod B → RIGHT
    })
  })
})

describe('Chat message alignment (useChatMT.js — ModTools)', () => {
  describe('User2Mod in ModTools', () => {
    it('member left, all mods right', () => {
      const fn = makeMTAlignmentFn({
        chattype: 'User2Mod',
        user1: 1,
        pov: null,
      })
      expect(fn(1)).toBe(false) // member → LEFT
      expect(fn(50)).toBe(true) // mod A → RIGHT
      expect(fn(51)).toBe(true) // mod B → RIGHT
    })
  })

  describe('User2User in ModTools chat review — no pov', () => {
    it('user1 left, user2 right', () => {
      const fn = makeMTAlignmentFn({
        chattype: 'User2User',
        user1: 1,
        pov: null,
      })
      expect(fn(1)).toBe(false) // user1 → LEFT
      expect(fn(2)).toBe(true) // user2 → RIGHT
    })
  })

  describe('User2User in ModTools — with pov', () => {
    it('pov=user1: user1 right, user2 left', () => {
      const fn = makeMTAlignmentFn({ chattype: 'User2User', user1: 1, pov: 1 })
      expect(fn(1)).toBe(true) // user1 → RIGHT
      expect(fn(2)).toBe(false) // user2 → LEFT
    })

    it('pov=user2: user1 left, user2 right', () => {
      const fn = makeMTAlignmentFn({ chattype: 'User2User', user1: 1, pov: 2 })
      expect(fn(1)).toBe(false) // user1 → LEFT
      expect(fn(2)).toBe(true) // user2 → RIGHT
    })
  })
})
