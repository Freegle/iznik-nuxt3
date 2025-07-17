// Global mixin so that every component can access the logged in state and user.  We use a mixin rather than the Vue
// idiom of provide/inject because you still have to remember to inject in each component.  And you won't, will you?

// TODO: convert into composable

import { useAuthStore } from '~/stores/auth'
import { useChatStore } from '@/stores/chat'
import { useMiscStore } from '@/stores/misc'
import { useModGroupStore } from '@/stores/modgroup'
import { useMe } from '~/composables/useMe'

export default {
  data: function () {
    return {
      modgroups: [],
      workTimer: false,
    }
  },
  computed: {
    // Permissions. We have these as individual computed properties so they can be cached.
    hasPermissionNewsletter() {
      return this.hasPermission('Newsletter')
    },
    hasPermissionSpamAdmin() {
      return this.hasPermission('SpamAdmin')
    },
    hasPermissionGiftAid() {
      return this.hasPermission('GiftAid')
    },
    // Needed for some modtoolstasks but /mixins/me.js/myGroups() OK for most mod tasks as it is a copy of modgroup.list
    myModGroups() {
      // But do we need to do other stuff in myGroups() eg sorting?
      const modGroupStore = useModGroupStore()
      return Object.values(modGroupStore.list)
    },
  },
  methods: {
    hasPermission(perm) {
      const { me } = useMe()
      const perms = me.value ? me.value.permissions : null
      return perms && perms.includes(perm)
    },
    myModGroup(groupid) {
      // console.log("modme.js myModGroup",groupid)
      const modGroupStore = useModGroupStore()
      return modGroupStore.get(groupid)
    },
    amAModOn(groupid) {
      const authStore = useAuthStore()
      const member = authStore.member(groupid)
      return member === 'Moderator' || member === 'Owner'
    },
    // SEE WORK EXPLANATION IN useModMessages.js
    deferCheckWork() {
      const miscStore = useMiscStore()
      if (miscStore.workTimer) {
        clearTimeout(miscStore.workTimer)
      }
      miscStore.workTimer = setTimeout(this.checkWork, 30000)
    },
    checkWorkDeferGetMessages() {
      const miscStore = useMiscStore()
      miscStore.deferGetMessages = true
      this.checkWork()
    },
    async checkWork(force) {
      const now = new Date()
      // console.log('CHECKWORK modme',force, now.toISOString().substring(11))
      const authStore = useAuthStore()
      const chatStore = useChatStore()
      const miscStore = useMiscStore()
      if (miscStore.workTimer) {
        clearTimeout(miscStore.workTimer)
      }

      // Do not check for work and therefore refresh while any modal is open
      const bodyoverflow = document.body.style.overflow
      if (force || bodyoverflow !== 'hidden') {
        // console.log('========================================')
        console.log(
          'CHECKWORK modme',
          force ?? '',
          now.toISOString().substring(11)
        )
        // const groupStore = useGroupStore()
        const modGroupStore = useModGroupStore()
        // console.log('CHECKWORK auth.groups',authStore.groups?.length,
        //  'groupStore.list',Object.keys(groupStore.list).length,
        //  'modGroupStore.list', Object.keys(modGroupStore.list).length)

        let currentTotal = 0
        if (authStore.work) currentTotal += authStore.work.total
        if (chatStore) currentTotal += Math.min(99, chatStore.unreadCount)
        const { fetchMe } = useMe()
        await fetchMe(true, ['work'])
        await modGroupStore.getModGroups()

        const chatcount = chatStore ? Math.min(99, chatStore.unreadCount) : 0
        const work = authStore.work
        const totalCount = work?.total + chatcount
        if (
          work &&
          totalCount > currentTotal &&
          authStore.user &&
          (!authStore.user.settings ||
            !Object.keys(authStore.user.settings).includes('playbeep') ||
            authStore.user.settings.playbeep)
        ) {
          console.log('Beep as new work', currentTotal, totalCount)
          this.makebeep()
        }
        const title = totalCount > 0 ? `(${totalCount}) ModTools` : 'ModTools'
        document.title = title
      }
      miscStore.deferGetMessages = false
      miscStore.workTimer = setTimeout(this.checkWork, 30000)
    },
    async makebeep() {
      const sound = new Audio('/alert.wav')
      try {
        // Some browsers prevent us using play unless in response to a
        // user gesture, so catch any exception.
        await sound.play()
      } catch (e) {
        console.log('Failed to play beep', e.message)
      }
    },
  },
}
