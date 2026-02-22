import { computed } from 'vue'
import cloneDeep from 'lodash.clonedeep'
import Wkt from 'wicket'
import { useAuthStore } from '~/stores/auth'
// import { useMiscStore } from './stores/misc'
import { useTeamStore } from '~/stores/team'

let fetchingPromise = null

export async function fetchMe(hitServer) {
  const authStore = useAuthStore()

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
    if (!authStore.user && fetchingPromise) {
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
    fetchingPromise = authStore.fetchUser()

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
}

export function useMe() {
  const authStore = useAuthStore()
  const teamStore = useTeamStore()

  const loginStateKnown = computed(() => {
    return authStore.loginStateKnown
  })

  const jwt = computed(() => {
    return authStore.auth.jwt
  })

  const realMe = computed(() => {
    // We have this separate method so that components can override me() and still access the real user if they
    // need to. This is used by impersonation.
    try {
      const me = authStore.user
      return me?.id ? me : null
    } catch (e) {
      console.log('RealME error', e)
      return null
    }
  })

  const me = computed(() => realMe.value)

  const myid = computed(() => me.value?.id)

  const loggedIn = computed(() => me.value !== null)

  const myGroupIds = computed(() => {
    let ret = []

    if (me.value) {
      ret = authStore.groups.map((g) => {
        // Memberships have an id of the membership whereas we want the groups to have the id of the group.
        return g.groupid
      })
    }

    return ret
  })

  const myGroups = computed(() => {
    let ret = []

    if (me.value) {
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
  })

  const anyGroups = computed(() => myGroups.value.length > 0)

  const myLocation = computed(() => me.value?.settings?.mylocation?.name)

  const mod = computed(() => {
    return (
      me.value &&
      (me.value.systemrole === 'Moderator' ||
        me.value.systemrole === 'Support' ||
        me.value.systemrole === 'Admin')
    )
  })

  const support = computed(() => me.value && me.value.systemrole === 'Support')

  const admin = computed(() => me.value && me.value.systemrole === 'Admin')

  const supportOrAdmin = computed(() => {
    return (
      me.value &&
      (me.value.systemrole === 'Support' || me.value.systemrole === 'Admin')
    )
  })

  const chitChatMod = computed(() => {
    let ret = false

    if (me.value) {
      if (supportOrAdmin.value) {
        ret = true
      } else {
        const mods = teamStore.getTeam('ChitChat Moderation')

        if (mods) {
          ret = !!mods.members.find((m) => myid.value === m.id)
        }
      }
    }

    return ret
  })

  const supporter = computed(() => me.value?.supporter)

  const donor = computed(() => me.value?.donated)

  const recentDonor = computed(() => {
    const donated = me.value?.donated

    // Bank transfer (External) donations get a 10-day grace period since they can arrive late.
    // See also ADFREE_PERIOD and ADFREE_GRACE_PERIOD in iznik-server-go/utils/utils.go.
    const days = me.value?.donatedtype === 'External' ? 41 : 31

    return (
      donated &&
      new Date(donated) > new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    )
  })

  const amMicroVolunteering = computed(() => {
    return (
      me.value &&
      (me.value.trustlevel === 'Basic' ||
        me.value.trustlevel === 'Moderate' ||
        me.value.trustlevel === 'Advanced')
    )
  })

  const myGroupsBoundingBox = computed(() => {
    let swlat = null
    let swlng = null
    let nelat = null
    let nelng = null

    myGroups.value.forEach((g) => {
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
  })

  function oneOfMyGroups(groupid) {
    return myGroups.value.find((g) => {
      return g.id === groupid
    })
  }

  function myGroup(groupid) {
    return groupid
      ? myGroups.value.find((g) => parseInt(g.id) === groupid)
      : null
  }

  return {
    fetchMe,
    loginStateKnown,
    jwt,
    me,
    realMe,
    myid,
    loggedIn,
    myGroupIds,
    myGroups,
    anyGroups,
    myLocation,
    mod,
    support,
    admin,
    supportOrAdmin,
    chitChatMod,
    supporter,
    donor,
    recentDonor,
    amMicroVolunteering,
    myGroupsBoundingBox,
    oneOfMyGroups,
    myGroup,
  }
}
