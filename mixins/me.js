// Global mixin so that every component can access the logged in state and user.  We use a mixin rather than the Vue
// idiom of provide/inject because you still have to remember to inject in each component.  And you won't, will you?
import cloneDeep from 'lodash.clonedeep'
import Wkt from 'wicket'
import { useAuthStore } from '~/stores/auth'
import { fetchMe } from '~/composables/useMe'
import { useTeamStore } from '~/stores/team'

export default {
  computed: {
    loginStateKnown() {
      const authStore = useAuthStore()
      return authStore.loginStateKnown
    },
    jwt() {
      const authStore = useAuthStore()
      return authStore.auth.jwt
    },
    me() {
      return this.realMe
    },
    realMe() {
      // We have this separate method so that components can override me() and still access the real user if they
      // need to. This is used by impersonation.
      try {
        const authStore = useAuthStore()
        const me = authStore.user
        return me?.id ? me : null
      } catch (e) {
        console.log('RealME error', e)
        return null
      }
    },
    myid() {
      return this.me?.id
    },
    loggedIn() {
      return this.me !== null
    },
    myGroupIds() {
      const authStore = useAuthStore()
      let ret = []

      if (this.me) {
        ret = authStore.groups.map((g) => {
          // Memberships have an id of the membership whereas we want the groups to have the id of the group.
          return g.groupid
        })
      }

      return ret
    },
    myGroups() {
      const authStore = useAuthStore()
      let ret = []

      if (this.me) {
        ret = authStore.groups.map((g) => {
          // Memberships have an id of the membership whereas we want the groups to have the id of the group.
          const g2 = cloneDeep(g)
          g2.id = g.groupid
          delete g2.groupid
          return g2
        })

        // Sort by namedisplay case insensitive
        ret.sort((a, b) => {
          const aName = a.namedisplay.toLowerCase()
          const bName = b.namedisplay.toLowerCase()
          return aName < bName ? -1 : aName > bName ? 1 : 0
        })
      }

      return ret
    },
    anyGroups() {
      return this.myGroups.length > 0
    },
    myLocation() {
      return this.me?.settings?.mylocation?.name
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
    chitChatMod() {
      let ret = false

      if (this.me) {
        if (this.supportOrAdmin) {
          ret = true
        } else {
          const teamStore = useTeamStore()
          const mods = teamStore.getTeam('ChitChat Moderation')

          if (mods) {
            ret = !!mods.members.find((m) => this.myid === m.id)
          }
        }
      }

      return ret
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
          const wkt = new Wkt.Wkt()
          try {
            wkt.read(g.bbox)
            const obj = wkt.toObject()
            const thisbounds = obj.getBounds()
            const sw = thisbounds.getSouthWest()
            const ne = thisbounds.getNorthEast()

            const bounds = new window.L.LatLngBounds([
              [sw.lat, sw.lng],
              [ne.lat, ne.lng],
            ]).pad(0.1)

            const gswlat = bounds.getSouthWest().lat
            const gswlng = bounds.getSouthWest().lng
            const gnelat = bounds.getNorthEast().lat
            const gnelng = bounds.getNorthEast().lng

            swlat = swlat === null ? gswlat : Math.min(swlat, gswlat)
            swlng = swlng === null ? gswlng : Math.min(swlng, gswlng)
            nelat = nelat === null ? gnelat : Math.max(nelat, gnelat)
            nelng = nelng === null ? gnelng : Math.max(nelng, gnelng)
          } catch (e) {
            console.log('WKT error', g.id, g.bbox, g, e)
          }
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
    fetchMe,
  },
}
