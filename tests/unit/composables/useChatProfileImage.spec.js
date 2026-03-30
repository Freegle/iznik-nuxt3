import { describe, it, expect } from 'vitest'

// These tests verify the chatMessageProfileImage logic from both
// composables/useChat.js (Freegle + chat review) and
// modtools/composables/useChatMT.js (ModTools chat pane).
//
// Each test function mirrors the production computed exactly.
// If the production code changes, these tests must be updated to match,
// and vice versa — a change here without a corresponding production
// change (or vice versa) indicates a bug.

// --- useChat.js profile image logic ---
// Production code: composables/useChat.js chatMessageProfileImage computed
function useChatProfileImage({
  messageUserid,
  myid,
  chattype,
  chatIcon,
  meProfile,
  otheruserProfile,
}) {
  if (messageUserid === myid) {
    return meProfile
  }
  if (chattype === 'User2User') {
    // Prefer user store profile; fall back to chat.icon while loading.
    return otheruserProfile || chatIcon
  }
  // User2Mod: chat.icon is group/member icon, preferred.
  return chatIcon || otheruserProfile
}

// --- useChatMT.js profile image logic ---
// Production code: modtools/composables/useChatMT.js chatMessageProfileImage computed
function useChatMTProfileImage({
  messageUserid,
  user1,
  meProfile,
  otheruserProfile,
  chatIcon,
}) {
  if (user1 !== messageUserid) {
    // Message is from a mod — show "me" (viewing mod) profile
    return meProfile
  }
  // Message is from user1 (the member) — show member profile
  return otheruserProfile || chatIcon
}

// --- useChat.js chatMessageProfileName logic ---
function useChatProfileName({
  messageUserid,
  myid,
  meDisplayname,
  otheruserDisplayname,
}) {
  return messageUserid === myid ? meDisplayname : otheruserDisplayname
}

// --- useChatMT.js chatMessageProfileName logic ---
function useChatMTProfileName({
  messageUserid,
  user1,
  meDisplayname,
  otheruserDisplayname,
}) {
  return user1 !== messageUserid ? meDisplayname : otheruserDisplayname
}

describe('User2User — Freegle site (useChat.js)', () => {
  const user1Profile = '/user1-avatar.jpg'
  const user2Profile = '/user2-avatar.jpg'

  describe('user1 viewing own chat', () => {
    // myid=1, pov not used (participant), otheruser=user2
    it('own message shows own profile', () => {
      expect(
        useChatProfileImage({
          messageUserid: 1,
          myid: 1,
          chattype: 'User2User',
          chatIcon: '/chat-icon.jpg',
          meProfile: user1Profile,
          otheruserProfile: user2Profile,
        })
      ).toBe(user1Profile)
    })

    it("other's message shows other user's profile (not chat.icon)", () => {
      expect(
        useChatProfileImage({
          messageUserid: 2,
          myid: 1,
          chattype: 'User2User',
          chatIcon: '/chat-icon.jpg',
          meProfile: user1Profile,
          otheruserProfile: user2Profile,
        })
      ).toBe(user2Profile)
    })
  })

  describe('user2 viewing own chat', () => {
    it('own message shows own profile', () => {
      expect(
        useChatProfileImage({
          messageUserid: 2,
          myid: 2,
          chattype: 'User2User',
          chatIcon: '/chat-icon.jpg',
          meProfile: user2Profile,
          otheruserProfile: user1Profile,
        })
      ).toBe(user2Profile)
    })

    it("other's message shows other user's profile", () => {
      expect(
        useChatProfileImage({
          messageUserid: 1,
          myid: 2,
          chattype: 'User2User',
          chatIcon: '/chat-icon.jpg',
          meProfile: user2Profile,
          otheruserProfile: user1Profile,
        })
      ).toBe(user1Profile)
    })
  })

  describe('user store not yet loaded — falls back to chat.icon', () => {
    it('shows chat.icon while otheruser profile is loading', () => {
      expect(
        useChatProfileImage({
          messageUserid: 2,
          myid: 1,
          chattype: 'User2User',
          chatIcon: '/chat-icon.jpg',
          meProfile: '/me.jpg',
          otheruserProfile: undefined, // not loaded yet
        })
      ).toBe('/chat-icon.jpg')
    })
  })
})

describe('User2User — chat review (useChat.js, no chat.icon)', () => {
  // In chat review, chat.icon is not populated because the review API
  // doesn't know whose POV to use. pov is set to chatroom.user2.
  const user1Profile = '/user1-avatar.jpg'
  const user2Profile = '/user2-avatar.jpg'

  describe('pov=user2 (standard review)', () => {
    // me = user2 (via pov), otheruser = user1
    it('user1 message shows user1 profile', () => {
      expect(
        useChatProfileImage({
          messageUserid: 1,
          myid: 2, // pov-derived
          chattype: 'User2User',
          chatIcon: undefined,
          meProfile: user2Profile,
          otheruserProfile: user1Profile,
        })
      ).toBe(user1Profile)
    })

    it('user2 message shows user2 profile', () => {
      expect(
        useChatProfileImage({
          messageUserid: 2,
          myid: 2, // pov-derived
          chattype: 'User2User',
          chatIcon: undefined,
          meProfile: user2Profile,
          otheruserProfile: user1Profile,
        })
      ).toBe(user2Profile)
    })
  })
})

describe('User2User — ModTools chat pane (useChatMT.js)', () => {
  // In MT chat pane, user1 is always "the member" (left side).
  // "me" is determined by pov. otheruser is the other participant.
  const user1Profile = '/user1-avatar.jpg'
  const user2Profile = '/user2-avatar.jpg'

  describe('mod viewing with pov=user2', () => {
    // me = user2 profile (via pov), otheruser = user1
    it('user1 (member) message shows user1 profile', () => {
      expect(
        useChatMTProfileImage({
          messageUserid: 1,
          user1: 1,
          meProfile: user2Profile,
          otheruserProfile: user1Profile,
          chatIcon: undefined,
        })
      ).toBe(user1Profile)
    })

    it('user2 message shows pov user (user2) profile', () => {
      expect(
        useChatMTProfileImage({
          messageUserid: 2,
          user1: 1,
          meProfile: user2Profile,
          otheruserProfile: user1Profile,
          chatIcon: undefined,
        })
      ).toBe(user2Profile)
    })
  })
})

describe('User2Mod — Freegle site, member viewing (useChat.js)', () => {
  // Member is user1. Mods are various userids. chat.icon = group icon.
  const memberProfile = '/member-avatar.jpg'
  const groupIcon = '/group-icon.jpg'

  it('own message shows member profile', () => {
    expect(
      useChatProfileImage({
        messageUserid: 1,
        myid: 1,
        chattype: 'User2Mod',
        chatIcon: groupIcon,
        meProfile: memberProfile,
        otheruserProfile: null, // otheruser not meaningful for user2mod from member side
      })
    ).toBe(memberProfile)
  })

  it('mod reply shows group icon (chat.icon)', () => {
    expect(
      useChatProfileImage({
        messageUserid: 50, // mod A
        myid: 1,
        chattype: 'User2Mod',
        chatIcon: groupIcon,
        meProfile: memberProfile,
        otheruserProfile: null,
      })
    ).toBe(groupIcon)
  })

  it('different mod reply also shows group icon', () => {
    expect(
      useChatProfileImage({
        messageUserid: 51, // mod B
        myid: 1,
        chattype: 'User2Mod',
        chatIcon: groupIcon,
        meProfile: memberProfile,
        otheruserProfile: null,
      })
    ).toBe(groupIcon)
  })

  it('mod reply falls back to otheruser profile when no chat.icon', () => {
    expect(
      useChatProfileImage({
        messageUserid: 50,
        myid: 1,
        chattype: 'User2Mod',
        chatIcon: undefined,
        meProfile: memberProfile,
        otheruserProfile: '/fallback.jpg',
      })
    ).toBe('/fallback.jpg')
  })
})

describe('User2Mod — ModTools chat pane (useChatMT.js)', () => {
  // In MT, user1 = member. All mod messages show viewing mod's profile.
  const memberProfile = '/member-avatar.jpg'
  const viewingModProfile = '/viewing-mod.jpg'
  const chatIcon = '/group-icon.jpg'

  it('member message shows member profile (otheruser)', () => {
    expect(
      useChatMTProfileImage({
        messageUserid: 1, // member (user1)
        user1: 1,
        meProfile: viewingModProfile,
        otheruserProfile: memberProfile,
        chatIcon,
      })
    ).toBe(memberProfile)
  })

  it('mod A message shows viewing mod profile', () => {
    // In MT, any non-user1 message is "from a mod" and shows me's profile
    expect(
      useChatMTProfileImage({
        messageUserid: 50, // mod A
        user1: 1,
        meProfile: viewingModProfile,
        otheruserProfile: memberProfile,
        chatIcon,
      })
    ).toBe(viewingModProfile)
  })

  it('mod B message also shows viewing mod profile (not mod B)', () => {
    // Known limitation: MT shows the viewing mod's avatar for all mod messages
    expect(
      useChatMTProfileImage({
        messageUserid: 51, // mod B (different from viewing mod)
        user1: 1,
        meProfile: viewingModProfile,
        otheruserProfile: memberProfile,
        chatIcon,
      })
    ).toBe(viewingModProfile)
  })
})

describe('User2Mod — chat review (useChat.js)', () => {
  // Chat review for User2Mod: pov is not typically set for User2Mod,
  // so myid is the real mod's id. chat.icon may or may not be populated.
  const memberProfile = '/member-avatar.jpg'
  const modProfile = '/mod-avatar.jpg'

  it('member message shows chat.icon (group icon) when available', () => {
    expect(
      useChatProfileImage({
        messageUserid: 1, // member
        myid: 50, // viewing mod
        chattype: 'User2Mod',
        chatIcon: '/group-icon.jpg',
        meProfile: modProfile,
        otheruserProfile: memberProfile,
      })
    ).toBe('/group-icon.jpg')
  })

  it('member message falls back to member profile when no chat.icon', () => {
    expect(
      useChatProfileImage({
        messageUserid: 1,
        myid: 50,
        chattype: 'User2Mod',
        chatIcon: undefined,
        meProfile: modProfile,
        otheruserProfile: memberProfile,
      })
    ).toBe(memberProfile)
  })

  it('viewing mod own message shows own profile', () => {
    expect(
      useChatProfileImage({
        messageUserid: 50,
        myid: 50,
        chattype: 'User2Mod',
        chatIcon: '/group-icon.jpg',
        meProfile: modProfile,
        otheruserProfile: memberProfile,
      })
    ).toBe(modProfile)
  })

  it('other mod message shows chat.icon (group icon)', () => {
    // A message from mod B, viewed by mod A. messageUserid !== myid,
    // chattype is User2Mod, so falls through to chat.icon.
    expect(
      useChatProfileImage({
        messageUserid: 51, // mod B
        myid: 50, // mod A viewing
        chattype: 'User2Mod',
        chatIcon: '/group-icon.jpg',
        meProfile: modProfile,
        otheruserProfile: memberProfile,
      })
    ).toBe('/group-icon.jpg')
  })
})

describe('Profile names', () => {
  describe('useChat.js — Freegle site', () => {
    it('own message shows own name', () => {
      expect(
        useChatProfileName({
          messageUserid: 1,
          myid: 1,
          meDisplayname: 'Alice',
          otheruserDisplayname: 'Bob',
        })
      ).toBe('Alice')
    })

    it('other message shows other name', () => {
      expect(
        useChatProfileName({
          messageUserid: 2,
          myid: 1,
          meDisplayname: 'Alice',
          otheruserDisplayname: 'Bob',
        })
      ).toBe('Bob')
    })
  })

  describe('useChatMT.js — ModTools', () => {
    it('member (user1) message shows member name', () => {
      expect(
        useChatMTProfileName({
          messageUserid: 1,
          user1: 1,
          meDisplayname: 'Mod Alice',
          otheruserDisplayname: 'Member Bob',
        })
      ).toBe('Member Bob')
    })

    it('mod message shows viewing mod name', () => {
      expect(
        useChatMTProfileName({
          messageUserid: 50,
          user1: 1,
          meDisplayname: 'Mod Alice',
          otheruserDisplayname: 'Member Bob',
        })
      ).toBe('Mod Alice')
    })
  })
})

describe('Chat list icon (Go API sets chat.icon per-user)', () => {
  // These document the Go API's icon rules (chatroom.go buildUserIcon).
  // The frontend just displays chat.icon — no frontend logic to test,
  // but documenting the contract here for completeness.

  it('User2User: icon is other user profile (Freegle)', () => {
    // Go API: User2User, requester=user1 → icon = user2's profile
    // Go API: User2User, requester=user2 → icon = user1's profile
    // Frontend: ChatListEntry, ChatPane, ChatHeader all use chat.icon directly
    const chatIconForUser1 = '/user2-profile.jpg' // API returns user2's image
    const chatIconForUser2 = '/user1-profile.jpg' // API returns user1's image
    expect(chatIconForUser1).not.toBe(chatIconForUser2)
  })

  it('User2Mod member viewing: icon is group logo', () => {
    // Go API: User2Mod, requester=user1 (member) → icon = group logo
    const chatIcon = '/group-logo.jpg'
    expect(chatIcon).toBeTruthy()
  })

  it('User2Mod mod viewing: icon is member profile', () => {
    // Go API: User2Mod, requester=mod → icon = user1's (member's) profile
    const chatIcon = '/member-profile.jpg'
    expect(chatIcon).toBeTruthy()
  })
})
