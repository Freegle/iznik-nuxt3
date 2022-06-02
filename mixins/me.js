// Global mixin so that every component can access the logged in state and user.  We use a mixin rather than the Vue
// idiom of provide/inject because you still have to remember to inject in each component.  And you won't, will you?
import { useAuthStore } from '~/stores/auth'

let fetchingPromise = null

export default {
  setup() {
    const authStore = useAuthStore()

    return {
      authStore,
    }
  },
  computed: {
    me() {
      return this.realMe
    },
    realMe() {
      // We have this separate method so that components can override me() and still access the real user if they
      // need to. This is used by impersonation.
      const me = this.authStore.user
      return me && me.id ? me : null
    },
    myid() {
      return this.me?.id
    },
    loggedIn() {
      return this.me !== null
    },
    myGroups() {
      return this.me ? this.authStore.groups : []
    },
    anyGroups() {
      return this.myGroups.length > 0
    },
    myLocation() {
      return this.me &&
        this.me.settings &&
        this.me.settings.mylocation &&
        this.me.settings.mylocation.name
        ? this.me.settings.mylocation
        : null
    },
    mod() {
      return (
        this.me &&
        (this.me.systemrole === 'Moderator' ||
          this.me.systemrole === 'Support' ||
          this.me.systemrole === 'Admin')
      )
    },
    support() {
      return this.me && this.me.systemrole === 'Support'
    },
    admin() {
      return this.me && this.me.systemrole === 'Admin'
    },
    supportOrAdmin() {
      return (
        this.me &&
        (this.me.systemrole === 'Support' || this.me.systemrole === 'Admin')
      )
    },
    simple() {
      let ret = true

      if (!this.me) {
        // Always show simple for logged out.
        ret = true
        // console.log('Logged out - simple')
      } else if (
        this.me.settings &&
        (this.me.settings.simple === true || this.me.settings.simple === false)
      ) {
        // We have a preference.
        ret = this.me.settings.simple
        // console.log('Preference - simple', ret)
      } else if (
        this.me.added &&
        Date.now() - new Date(this.me.added).getTime() < 3 * 24 * 60 * 60 * 1000
      ) {
        // We have no preference and we're a new user.
        ret = true
        // console.log('No preference, new', this.me.added)
      } else {
        // We have no preference and we're an established user.
        ret = false
        // console.log('No preference, established')
      }

      // console.log('compute simple', ret, this.me)
      return ret
    },
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
    supporter() {
      return this.me && this.me.supporter
    },
    donor() {
      return this.me && this.me.donor
    },
    amMicroVolunteering() {
      return (
        this.me &&
        (this.me.trustlevel === 'Basic' ||
          this.me.trustlevel === 'Moderate' ||
          this.me.trustlevel === 'Advanced')
      )
    },
    myGroupsBoundingBox() {
      let swlat = null
      let swlng = null
      let nelat = null
      let nelng = null

      this.myGroups.forEach((g) => {
        if (g.bbox) {
          swlat = swlat === null ? g.bbox.swlat : Math.min(swlat, g.bbox.swlat)
          swlng = swlng === null ? g.bbox.swlng : Math.min(swlng, g.bbox.swlng)
          nelat = nelat === null ? g.bbox.nelat : Math.max(nelat, g.bbox.nelat)
          nelng = nelng === null ? g.bbox.nelng : Math.min(nelng, g.bbox.nelng)
        }
      })

      return [
        [swlat, swlng],
        [nelat, nelng],
      ]
    },
  },
  methods: {
    oneOfMyGroups(groupid) {
      return this.myGroups.find((g) => {
        return g.id === groupid
      })
    },
    myGroup(groupid) {
      return groupid
        ? this.myGroups.find((g) => parseInt(g.id) === groupid)
        : null
    },
    async fetchMe(hitServer) {
      // We can be called in several ways.
      //
      // - hitServer = true.  We must query the server, and wait for the response before returning.  This is used
      //   mostly when we really care about the data being tightly in sync, and occasionally when we want to
      //   ensure that the server call has completed (e.g. in timers).  You would always call this with await.
      //
      // - hitServer = false
      //   - with await.  We must have the user info, but it's ok for them to be a little out of
      //     date.  If we have it in hand we can return but fire off a server request to make sure is is up
      //     to date soon.  If we don't, we must hit the server and wait.
      //   - without await.  We just want to trigger an update but don't much care when it happens.
      //
      // Inside this function we can't tell whether an await is used, but this comment is for the callers :-).
      //
      // Because multiple pages/components may call fetchMe to ensure that they have data they need, we
      // want to minimise the number of calls.  We have some fairly complex logic below to keep the number of parallel
      // calls down and return earlier if we happen to already be fetching what we need.
      let needToFetch = false

      if (!hitServer) {
        // We don't have to hit the server before we return, but we might need to if we don't have the user.
        if (!this.authStore.user && fetchingPromise) {
          // We are already in the process of fetching the user, so we just need to wait until that completes.
          await fetchingPromise
        }

        // We always need to fetch to do the background update.
        needToFetch = true
      } else {
        // We have been asked to hit the server.
        // eslint-disable-next-line no-lonely-if
        if (fetchingPromise) {
          // We are in the process of fetching the user, so we need to wait until that completes.
          await fetchingPromise
        } else {
          needToFetch = true
        }
      }

      if (needToFetch) {
        fetchingPromise = this.authStore.fetchUser()

        if (hitServer) {
          // We need to wait for the server before returning.
          await fetchingPromise
          fetchingPromise = null
        } else {
          // We can return immediately, but hit the server to keep us up to date.
          fetchingPromise.then(() => {
            fetchingPromise = null
          })
        }
      }
    },
  },
}
