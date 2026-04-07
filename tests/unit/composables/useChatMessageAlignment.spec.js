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

// ---------------------------------------------------------------------------
// Regression tests for pov=0 bug (User2Mod community modmail, DB user2=NULL)
// ---------------------------------------------------------------------------
// When a User2Mod chat has user2=NULL in the DB, the Go API returns user2=0.
// The chat store's touserid hydration skips 0 (falsy), so message.touser is
// never set either.  chatPov therefore resolves to 0 (not null).
//
// The old code used `if (pov)` which treats 0 as "no pov", falling through to
// `userid === myid`.  Since the reviewing mod is never a chat participant, ALL
// messages returned false → both sides landed on the left → looked like one
// person talking to themselves.
//
// The fix is `if (pov !== null)` so that pov=0 still enters the User2Mod
// branch (which does not use the pov value itself, only needs it to be
// non-null to know we are in a modtools viewing context).

function makeUseChatPovFn({ myid, chattype, user1, pov }) {
  // Mirrors useChat.js useChatMessageBase messageIsFromCurrentUser.
  // Uses the FIXED logic: if (pov !== null) instead of if (pov).
  return function isFromCurrentUser(messageUserid) {
    if (pov !== null) {
      if (chattype === 'User2User') {
        if (pov === user1) return messageUserid === user1
        return messageUserid !== user1
      }
      if (chattype === 'User2Mod') {
        return user1 !== messageUserid
      }
    }
    return messageUserid === myid
  }
}

describe('useChat.js pov-aware alignment (ModChatModal path)', () => {
  describe('User2Mod — community modmail, pov=0 (user2=NULL in DB)', () => {
    it('member messages left, mod messages right when pov=0', () => {
      const fn = makeUseChatPovFn({
        myid: 99,
        chattype: 'User2Mod',
        user1: 1,
        pov: 0,
      })
      expect(fn(1)).toBe(false) // member → LEFT
      expect(fn(50)).toBe(true) // mod A → RIGHT
      expect(fn(51)).toBe(true) // mod B → RIGHT
    })

    it('pov=null falls back to myid match (normal user view)', () => {
      const fn = makeUseChatPovFn({
        myid: 99,
        chattype: 'User2Mod',
        user1: 1,
        pov: null,
      })
      expect(fn(1)).toBe(false) // member → LEFT (1 !== 99)
      expect(fn(99)).toBe(true) // reviewing user's own messages → RIGHT
      expect(fn(50)).toBe(false) // other mod → LEFT (not myid)
    })
  })

  describe('User2User — consistent pov=user2 from chatroom', () => {
    it('user1 left, user2 right when pov=user2', () => {
      const fn = makeUseChatPovFn({
        myid: 99,
        chattype: 'User2User',
        user1: 1,
        pov: 2,
      })
      expect(fn(1)).toBe(false) // user1 → LEFT
      expect(fn(2)).toBe(true) // user2 → RIGHT
    })

    it('user1 right, user2 left when pov=user1', () => {
      const fn = makeUseChatPovFn({
        myid: 99,
        chattype: 'User2User',
        user1: 1,
        pov: 1,
      })
      expect(fn(1)).toBe(true) // user1 → RIGHT
      expect(fn(2)).toBe(false) // user2 → LEFT
    })
  })
})

// Test the MT me/otheruser computed logic with numeric user IDs from V2 API
describe('useChatMT — me/otheruser with numeric IDs', () => {
  // Simulates the me computed from useChatMT.js
  function makeMeComputed({ pov, user1, user2, realMe, userStoreById }) {
    if (!pov) {
      return realMe
    }
    const u1 = user1
    const u2 = user2
    if (u1 === pov || u2 === pov) {
      return userStoreById(pov) || realMe
    }
    return realMe
  }

  // Simulates the otheruser computed from useChatMT.js
  function makeOtheruserComputed({ otheruid, user1, userStoreById }) {
    let uid = otheruid
    if (!uid) uid = user1
    if (uid) return userStoreById(uid)
    return null
  }

  const realMe = { id: 999, displayname: 'Mod Alice' }
  const user100 = { id: 100, displayname: 'User Bob' }
  const user200 = { id: 200, displayname: 'User Carol' }
  const storeById = (id) => {
    if (id === 100) return user100
    if (id === 200) return user200
    return null
  }

  describe('me computed', () => {
    it('returns realMe when no pov', () => {
      const me = makeMeComputed({
        pov: null,
        user1: 100,
        user2: 200,
        realMe,
        userStoreById: storeById,
      })
      expect(me).toBe(realMe)
    })

    it('returns user object (not numeric ID) when pov matches user1', () => {
      const me = makeMeComputed({
        pov: 100,
        user1: 100,
        user2: 200,
        realMe,
        userStoreById: storeById,
      })
      expect(me).toBe(user100)
      expect(me.id).toBe(100)
      expect(me.displayname).toBe('User Bob')
    })

    it('returns user object when pov matches user2', () => {
      const me = makeMeComputed({
        pov: 200,
        user1: 100,
        user2: 200,
        realMe,
        userStoreById: storeById,
      })
      expect(me).toBe(user200)
      expect(me.id).toBe(200)
    })

    it('falls back to realMe when pov user not in store', () => {
      const me = makeMeComputed({
        pov: 999,
        user1: 100,
        user2: 200,
        realMe,
        userStoreById: () => null,
      })
      expect(me).toBe(realMe)
    })

    it('never returns a numeric ID', () => {
      const me = makeMeComputed({
        pov: 100,
        user1: 100,
        user2: 200,
        realMe,
        userStoreById: storeById,
      })
      expect(typeof me).toBe('object')
      expect(typeof me).not.toBe('number')
    })
  })

  describe('otheruser computed', () => {
    it('returns user from store via otheruid', () => {
      const user = makeOtheruserComputed({
        otheruid: 100,
        user1: 200,
        userStoreById: storeById,
      })
      expect(user).toBe(user100)
    })

    it('falls back to user1 when otheruid not set', () => {
      const user = makeOtheruserComputed({
        otheruid: null,
        user1: 200,
        userStoreById: storeById,
      })
      expect(user).toBe(user200)
    })

    it('returns null when user not in store (not a numeric ID)', () => {
      const user = makeOtheruserComputed({
        otheruid: 999,
        user1: null,
        userStoreById: () => null,
      })
      expect(user).toBeNull()
    })

    it('never returns a numeric ID as the user', () => {
      const user = makeOtheruserComputed({
        otheruid: null,
        user1: 100,
        userStoreById: storeById,
      })
      expect(typeof user).toBe('object')
    })
  })
})
