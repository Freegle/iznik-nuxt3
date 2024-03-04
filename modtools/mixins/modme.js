import { useAuthStore } from '~/stores/auth'

export default {
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

    }
  },
}
