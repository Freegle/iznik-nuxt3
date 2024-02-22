// DONE??

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
  },
}
