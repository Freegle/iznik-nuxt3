// Global mixin so that every component can access the logged in state and user.  We use a mixin rather than the Vue
// idiom of provide/inject because you still have to remember to inject in each component.  And you won't, will you?

import { useAuthStore } from '~/stores/auth'
import { useChatStore } from '@/stores/chat'
import { useMiscStore } from '@/stores/misc'

export default {
  data: function() {
    return {
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
  },
  methods: {
    hasPermission(perm) {
      const perms = this.me ? this.me.permissions : null
      return perms && perms.indexOf(perm) !== -1
    },
    myGroup(groupid) {
      return groupid
        ? this.myGroups.find(g => parseInt(g.id) === groupid)
        : null
    },
    amAModOn(groupid){
      const authStore = useAuthStore()
      const member = authStore.member(groupid)
      return member === 'Moderator' || member === 'Owner'
    },
    deferCheckWork(){
      const miscStore = useMiscStore()
      if (miscStore.workTimer) {
        clearTimeout(miscStore.workTimer)
      }
      miscStore.workTimer = setTimeout(this.checkWork, 30000)
    },
    async checkWork(force) {
      const now = new Date()
      console.log('CHECKWORK modme',force, now.toISOString())
      const authStore = useAuthStore()
      const chatStore = useChatStore()
      const miscStore = useMiscStore()
      if (miscStore.workTimer) {
        clearTimeout(miscStore.workTimer)
      }

      // Do not check for work and therefore refresh while any modal is open
      const bodyoverflow = document.body.style.overflow
      if (force || (bodyoverflow !== 'hidden')) {
        //console.log('CHECKWORK DO modme',force, now.toISOString())
        await this.fetchMe(true, ['work', 'group']) // MT ADDED 'group'

        this.chatcount = chatStore ? Math.min(99, chatStore.unreadCount) : 0
        const work = authStore.work
        const totalCount = work?.total + this.chatcount
        const title = totalCount > 0 ? `(${totalCount}) ModTools` : 'ModTools'
        document.title = title
      }
      miscStore.workTimer = setTimeout(this.checkWork, 30000)
    },
  },
}
