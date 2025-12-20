import { useRoute, useRouter } from 'vue-router'
import pluralize from 'pluralize'
import { useMiscStore } from '~/stores/misc'
import { useNewsfeedStore } from '~/stores/newsfeed'
import { useMessageStore } from '~/stores/message'
import { useNotificationStore } from '~/stores/notification'
import { useLogoStore } from '~/stores/logo'
import { useChatStore } from '~/stores/chat'
import { useAuthStore } from '~/stores/auth'
import { fetchMe } from '~/composables/useMe'
import { useRuntimeConfig } from '#app'
import { TYPING_TIME_INVERVAL } from '~/constants'
import { useCommunityEventStore } from '~/stores/communityevent'
import { useVolunteeringStore } from '~/stores/volunteering'
import { useMobileStore } from '~/stores/mobile'

export const navBarHidden = ref(false)

let navBarTimeout = null
let countsInitialized = false

export function clearNavBarTimeout() {
  if (navBarTimeout) {
    clearTimeout(navBarTimeout)
    navBarTimeout = null
  }
}

export function setNavBarHidden(hideRequest) {
  // Hide the navbar when typing.
  //
  // Start a timer to show the navbars again after a delay.
  if (navBarHidden.value !== hideRequest) {
    function maybeHide(hidden) {
      clearNavBarTimeout()

      if (!hidden) {
        // If we've been typing recently then we don't want to show the navbar.  This stops it sliding up
        // and obscuring the chat box.
        const lastTyping = useMiscStore().lastTyping
        if (
          lastTyping &&
          new Date().getTime() - lastTyping < TYPING_TIME_INVERVAL
        ) {
          // We're still typing.  Keep the navbar hidden and check whether to show it again later.
          console.log('Still typing - hide navbar')
          navBarHidden.value = true
          navBarTimeout = setTimeout(maybeHide, 5000, false)
        } else {
          // We're not still typing.  We can show the navbar.
          console.log(
            'Not still typing - show',
            new Date().getTime(),
            useMiscStore().lastTyping
          )

          navBarHidden.value = false
        }
      } else {
        // We want to hide the navbar, and start a timer to show it again later if we're not still typing.
        console.log('Hide now, check later')
        navBarHidden.value = true

        navBarTimeout = setTimeout(maybeHide, 5000, false)
      }
    }

    maybeHide(hideRequest)
  }
}

export function useNavbar() {
  const authStore = useAuthStore()
  const miscStore = useMiscStore()
  const newsfeedStore = useNewsfeedStore()
  const messageStore = useMessageStore()
  const notificationStore = useNotificationStore()
  const chatStore = useChatStore()
  const logoStore = useLogoStore()
  const communityEventStore = useCommunityEventStore()
  const volunteeringStore = useVolunteeringStore()
  const route = useRoute()
  const router = useRouter()

  const online = computed(() => miscStore.online)
  const myid = computed(() => authStore.user?.id)
  const distance = ref(1000)
  const logo = ref('/icon.png')
  const logoFormat = ref('webp')
  const unreadNotificationCount = ref(0)
  const mobileStore = useMobileStore()
  const chatCount = computed(() => {
    const count = Math.min(99, chatStore.unreadCount)
    if (mobileStore.isApp) {
      mobileStore.setBadgeCount(count)
    }
    return count
  })
  const activePostsCount = computed(() => messageStore.activePostsCounter)
  const showAboutMeModal = ref(false)
  const countTimer = ref(null)

  const homePage = computed(() => {
    const lastRoute = miscStore.get('lasthomepage')

    let nextroute = '/'

    if (authStore.user) {
      nextroute = '/browse'

      if (lastRoute === 'news') {
        nextroute = '/chitchat'
      } else if (lastRoute === 'myposts') {
        nextroute = '/myposts'
      }
    }

    return nextroute
  })

  const showBackButton = computed(() => {
    // On mobile we want to show a back button instead of the logo when we're not on one of the "home" routes,
    // which are /browse, /chitchat, /myposts
    return (
      route &&
      route.path !== '/browse' &&
      route.path !== '/chitchat' &&
      route.path !== '/myposts' &&
      !route.path.startsWith('/explore/') &&
      route.path !== '/'
    )
  })

  const backButtonCount = computed(() => {
    // On mobile, if we're viewing a chat, then we don't have the navbar and we won't see anything which
    // reminds us that we have other unread chat messages.  In that case we show a count of unread chat
    // messages.
    if (route.path.startsWith('/chats/')) {
      const chatid = parseInt(route.path.split('/')[2])
      const chat = chatStore.byChatId(chatid)

      return chatCount.value - chat?.unseen
    }

    return 0
  })

  const newsCount = computed(() => {
    return newsfeedStore.count
  })

  const newsCountPlural = () => {
    return pluralize('unread ChitChat post', newsCount.value, true)
  }

  const browseCount = computed(() => {
    return Math.min(99, messageStore.count)
  })

  const browseCountPlural = computed(() => {
    return pluralize('unseen post', messageStore.count, true)
  })

  const activePostsCountPlural = computed(() => {
    return pluralize('open post', activePostsCount.value, {
      includeNumber: true,
    })
  })

  const communityEventCount = computed(() => {
    return communityEventStore.count
  })

  const communityEventCountPlural = computed(() => {
    return pluralize('community event', communityEventCount.value, {
      includeNumber: true,
    })
  })

  const volunteerOpportunityCount = computed(() => {
    return volunteeringStore.count
  })

  const volunteerOpportunityCountPlural = ref(() => {
    return pluralize('volunteer opportunity', volunteerOpportunityCount.value, {
      includeNumber: true,
    })
  })

  onMounted(() => {
    setTimeout(async () => {
      // Look for a custom logo.
      const ret = await logoStore.fetch()

      // v2 API returns data directly without ret/status wrapper
      if (ret?.logo) {
        logo.value = ret.logo.path.replace(/.*logos/, '/logos')
        logoFormat.value = 'gif'
      }
    }, 500000)

    // Only fetch counts once, even if multiple components use useNavbar().
    if (!countsInitialized) {
      countsInitialized = true
      getCounts()
    }
  })

  const requestLogin = () => {
    authStore.forceLogin = true
  }

  const logout = async () => {
    await authStore.logout()
    authStore.forceLogin = false

    // Go to the landing page.
    router.push('/', true)
  }

  const showAboutMe = async () => {
    await fetchMe(true)
    showAboutMeModal.value = true
  }

  const maybeReload = (route) => {
    if (router?.currentRoute?.value?.path === route) {
      // We have clicked to route to the page we're already on.  Force a full refresh.
      console.log('maybeReload - reload')
      window.location.reload(true)
    }
  }

  const backButton = () => {
    if (router?.currentRoute?.value?.path?.includes('/chats/')) {
      // From a single chat we should always go back to the chat list.  This can happen if we've clicked on an
      // email notification and then clicked back.
      router.push('/chats')
    } else if (router?.currentRoute?.value?.path === '/chats') {
      // From the chat list we should go home since there's no home button on mobile.
      router.push('/')
    } else {
      try {
        router.back()
      } catch (e) {
        router.push('/')
      }
    }
  }

  const getCounts = async () => {
    if (myid.value) {
      try {
        // We sometimes might not yet have figured out if we're logged in, so catch exceptions otherwise they
        // cause Nuxt to bail out with JS errors.
        const me = authStore.user
        const settings = me?.settings
        const distance = settings?.newsfeedarea || 0
        await newsfeedStore.fetchCount(distance, false)

        // We might get logged out during awaits.
        if (!myid.value) {
          throw new Error('Not logged in')
        }

        await messageStore.fetchCount(me?.settings?.browseView, false)

        if (!myid.value) {
          throw new Error('Not logged in')
        }

        await communityEventStore.fetchList()

        if (!myid.value) {
          throw new Error('Not logged in')
        }

        await volunteeringStore.fetchList()
        if (!myid.value) {
          throw new Error('Not logged in')
        }

        if (
          route.path !== '/profile/' + myid.value &&
          !route.path.includes('/unsubscribe')
        ) {
          // Get the messages for the currently logged in user.  This will also speed up the My Posts page.
          //
          // We don't do this if we're looking at our own profile otherwise this fetch and the one in ProfileInfo
          // can interfere with each other.
          //
          // We also don't do this on unsubscribe pages as there are timing windows which can lead to the call
          // failing and consequent Sentry errors.
          await messageStore.fetchActivePostCount()
        }

        if (myid.value) {
          unreadNotificationCount.value = await notificationStore.fetchCount()

          if (myid.value && unreadNotificationCount.value) {
            // Fetch the notifications too, so that we can be quick if they view them.
            notificationStore.fetchList()
          }
        }

        const runtimeConfig = useRuntimeConfig()

        if (
          runtimeConfig.public.NETLIFY_DEPLOY_ID &&
          runtimeConfig.public.NETLIFY_BRANCH === 'production'
        ) {
          try {
            const response = await fetch(
              `https://api.netlify.com/api/v1/sites/${runtimeConfig.public.NETLIFY_SITE_NAME}.netlify.com`
            )

            const data = await response.json()

            if (data?.deploy_id) {
              if (data.deploy_id !== runtimeConfig.public.NETLIFY_DEPLOY_ID) {
                const deployDate = new Date(data.published_deploy.published_at)

                // Check it's not too soon to nag.  This stops annoyances when we have lots of releases in a short
                // time.
                if (deployDate.getTime() < Date.now() - 12 * 60 * 60 * 1000) {
                  // We're not on the latest deploy, so show a warning.
                  useMiscStore().needToReload = true
                }
              }
            }
          } catch (e) {
            console.log('Failed to fetch deploy info', e)
          }
        }
      } catch (e) {
        console.log('Ignore error fetching counts', e)
      }
    }

    countTimer.value = setTimeout(getCounts, 60000)
  }

  watch(myid, (newVal, oldVal) => {
    if (newVal && !oldVal) {
      // Just logged in, update the counts sooner.
      if (countTimer.value) {
        clearTimeout(countTimer.value)
      }

      getCounts()
    } else if (!newVal && oldVal) {
      // Logged out - reset the flag so counts fetch again on next login.
      countsInitialized = false
    }
  })

  return {
    online,
    distance,
    logo,
    logoFormat,
    unreadNotificationCount,
    chatCount,
    activePostsCount,
    activePostsCountPlural,
    newsCount,
    newsCountPlural,
    browseCount,
    browseCountPlural,
    communityEventCount,
    communityEventCountPlural,
    volunteerOpportunityCount,
    volunteerOpportunityCountPlural,
    showAboutMeModal,
    homePage,
    showBackButton,
    backButtonCount,
    requestLogin,
    logout,
    showAboutMe,
    maybeReload,
    backButton,
  }
}
