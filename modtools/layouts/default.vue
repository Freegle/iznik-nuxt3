<template>
  <div class="pageback">
    <b-navbar
      id="navbar"
      :key="'nuxt1-' + bump"
      type="dark"
      class="navback p-0 p-sm-1 justify-content-between"
      fixed="top"
    >
      <b-navbar-brand class="p-0 pr-2 d-flex">
        <b-img
          class="logo clickme"
          fluid
          rounded
          :src="logo"
          alt="Home"
          @click="clicklogo"
        />
        <ModStatus class="status" />
      </b-navbar-brand>
      <!--ModZoomStock class="d-none d-md-block text-white" /-->
      <b-navbar-nav class="d-flex align-items-center">
        <b-nav-item
          v-if="loggedIn"
          id="menu-option-modtools-discourse2"
          class="text-center p-0 mr-4"
          @click="discourse"
        >
          <div id="discourseIcon" class="position-relative">
            <v-icon :icon="['fab', 'discourse']" class="fa-2x" />
            <div class="d-none d-xl-block">Us</div>
            <b-badge
              v-show="discourseCount"
              variant="success"
              class="discourseBadge"
            >
              {{ discourseCount }}
            </b-badge>
          </div>
        </b-nav-item>
        <ChatMenu
          v-if="loggedIn"
          id="menu-option-modtools-chat2"
          :is-list-item="true"
          class="mr-4"
        />
        <b-nav-item v-if="loggedIn">
          <div class="position-relative">
            <b-button variant="white" class="menu" @click="toggleMenu">
              <v-icon icon="bars" class="" />
            </b-button>
            <b-badge
              v-show="menuCount"
              v-if="!showMenu"
              variant="danger"
              class="menuCount position-absolute"
              @click="toggleMenu"
            >
              {{ menuCount }}
            </b-badge>
          </div>
        </b-nav-item>
        <b-nav-item v-if="!loggedIn">
          <b-button variant="white" @click="requestLogin"> Log in </b-button>
        </b-nav-item>
      </b-navbar-nav>
    </b-navbar>

    <div :key="'nuxt2-' + bump" class="d-flex">
      <div v-if="showMenu" class="leftmenu text--medium-large-spaced">
        <ModMenuItemLeft
          link="/"
          name="Dashboard"
          @mobilehidemenu="mobilehidemenu"
        />
        <hr />
        <div class="pl-1">Messages</div>
        <ModMenuItemLeft
          link="/messages/pending"
          name="Pending"
          :count="['pending']"
          :othercount="['pendingother']"
          indent
          @mobilehidemenu="mobilehidemenu"
        />
        <ModMenuItemLeft
          link="/messages/approved"
          name="Approved"
          indent
          @mobilehidemenu="mobilehidemenu"
        />
        <ModMenuItemLeft
          link="/messages/edits"
          name="Edits"
          :count="['editreview']"
          indent
          @mobilehidemenu="mobilehidemenu"
        />
        <hr />
        <div class="pl-1">Members</div>
        <ModMenuItemLeft
          link="/members/approved"
          name="Approved"
          indent
          @mobilehidemenu="mobilehidemenu"
        />
        <ModMenuItemLeft
          link="/members/review"
          name="Member Review"
          :count="['spammembers']"
          indent
          @mobilehidemenu="mobilehidemenu"
        />
        <ModMenuItemLeft
          link="/chats/review"
          name="Chat Review"
          :count="['chatreview']"
          :othercount="['chatreviewother']"
          indent
          @mobilehidemenu="mobilehidemenu"
        />
        <ModMenuItemLeft
          link="/members/related"
          name="Related"
          :count="['relatedmembers']"
          indent
          @mobilehidemenu="mobilehidemenu"
        />
        <ModMenuItemLeft
          link="/members/stories"
          name="Stories"
          indent
          :count="['stories']"
          @mobilehidemenu="mobilehidemenu"
        />
        <ModMenuItemLeft
          v-if="hasPermissionNewsletter"
          link="/members/newsletter"
          name="Newsletter"
          indent
          :count="['newsletterstories']"
          @mobilehidemenu="mobilehidemenu"
        />
        <ModMenuItemLeft
          v-if="hasPermissionGiftAid"
          link="/giftaid"
          name="Gift Aid"
          indent
          :count="['giftaid']"
          @mobilehidemenu="mobilehidemenu"
        />
        <ModMenuItemLeft
          link="/members/feedback"
          name="Feedback"
          indent
          :othercount="['happiness']"
          @mobilehidemenu="mobilehidemenu"
        />
        <ModMenuItemLeft
          link="/members/microvolunteering"
          indent
          name="MicroVols"
          @mobilehidemenu="mobilehidemenu"
        />
        <ModMenuItemLeft
          link="/members/notes"
          name="Notes"
          indent
          @mobilehidemenu="mobilehidemenu"
        />
        <hr />
        <hr />
        <ModMenuItemLeft
          link="/communityevents"
          name="Events"
          :count="['pendingevents']"
          @mobilehidemenu="mobilehidemenu"
        />
        <ModMenuItemLeft
          link="/volunteering"
          name="Volunteering"
          :count="['pendingvolunteering']"
          @mobilehidemenu="mobilehidemenu"
        />
        <ModMenuItemLeft
          link="/publicity"
          name="Publicity"
          :count="['socialactions', 'popularposts']"
          @mobilehidemenu="mobilehidemenu"
        />
        <ModMenuItemLeft
          link="/admins"
          name="Admins"
          :count="['pendingadmins']"
          @mobilehidemenu="mobilehidemenu"
        />
        <ModMenuItemLeft
          link="/spammers"
          name="Spammers"
          :count="
            hasPermissionSpamAdmin
              ? ['spammerpendingadd', 'spammerpendingremove']
              : []
          "
          @mobilehidemenu="mobilehidemenu"
        />
        <hr />
        <ModMenuItemLeft
          link="/logs"
          name="Logs"
          @mobilehidemenu="mobilehidemenu"
        />
        <ModMenuItemLeft
          v-if="supportOrAdmin"
          link="/support"
          name="Support"
          @mobilehidemenu="mobilehidemenu"
        />
        <ModMenuItemLeft
          link="/settings"
          name="Settings"
          @mobilehidemenu="mobilehidemenu"
        />
        <ModMenuItemLeft
          link="/teams"
          name="Teams"
          @mobilehidemenu="mobilehidemenu"
        />
        <div>
          <ExternalLink
            href="https://wiki.ilovefreegle.org/ModTools"
            class="pl-1"
          >
            Help
          </ExternalLink>
        </div>
        <div>
          <a href="#" class="pl-1" @click="logOut"> Logout </a>
        </div>
        <div id="mtinfo" :title="buildDate">
          MT-{{ version }} <br />{{ buildDate }}
        </div>
        <div v-if="inMTapp" id="mtinfo" :title="inMTapp">
          MT app {{ inMTapp }}
        </div>
      </div>
      <div class="ml-0 pl-0 pl-sm-1 pr-0 pr-sm-1 pageContent w-100">
        <slot ref="pageContent" />
      </div>
    </div>
    <!--ChatPopups v-if="loggedIn" class="d-none d-sm-block" /-->
    <GoogleOneTap
      v-if="oneTap"
      @loggedin="googleLoggedIn"
      @complete="googleLoaded"
    />
    <LoginModal v-if="!loggedIn" ref="loginModal" :key="'login-' + bumpLogin" />
    <div id="sizer" ref="sizer" class="d-none d-lg-block" />
    <SomethingWentWrong />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useRouter } from '#imports'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { useMiscStore } from '@/stores/misc'
import { useModGroupStore } from '@/stores/modgroup'
import { useModConfigStore } from '@/stores/modconfig'
import { useMe } from '~/composables/useMe'
import { useModMe } from '~/composables/useModMe'

import { buildHead } from '~/composables/useMTBuildHead'

const router = useRouter()
const route = useRoute()

const loginModal = ref(null)
const sizer = ref(null)
const logo = '/icon_modtools.png'
const showMenu = ref(true)
const timeTimer = ref(null)
const bump = ref(0)
const bumpLogin = ref(0)

const ready = ref(false)
const oneTap = ref(false)
const authStore = useAuthStore()
const jwt = authStore.auth.jwt
const chatStore = useChatStore()
const miscStore = useMiscStore()
const modGroupStore = useModGroupStore()
const modConfigStore = useModConfigStore()
const persistent = authStore.auth.persistent
const { supportOrAdmin } = useMe()
const {
  hasPermissionNewsletter,
  hasPermissionSpamAdmin,
  hasPermissionGiftAid,
  checkWork,
} = useModMe()

if (process.client) {
  // Ensure we don't wrongly think we have some outstanding requests if the server happened to start some.
  miscStore.apiCount = 0
}

if (jwt || persistent) {
  // We have some credentials, which may or may not be valid on the server.  If they are, then we can crack on and
  // start rendering the page.  This will be quicker than waiting for GoogleOneTap to load on the client and tell us
  // whether or not we can log in that way.
  let user = null

  try {
    user = await authStore.fetchUser()
  } catch (e) {
    console.log('Error fetching user', e)
  }

  if (user) {
    ready.value = true
  }
}
if (!ready.value) {
  // We don't have a valid JWT.  See if OneTap can sign us in.
  oneTap.value = true
}

const runtimeConfig = useRuntimeConfig()
useHead(
  buildHead(
    route,
    runtimeConfig,
    'ModTools',
    'Moderation tool for Freegle volunteers'
  )
)
useHead({
  bodyAttrs: {
    class: 'bodyMT',
  },
})

const loginStateKnown = computed(() => authStore.loginStateKnown)
const loggedIn = computed(() => authStore.user !== null)
const inMTapp = ref(false)

const discourseCount = computed(() => {
  const discourse = authStore.discourse
  return discourse
    ? discourse.notifications + discourse.newtopics + discourse.unreadtopics
    : 0
})

const menuCount = computed(() => {
  const work = authStore?.work
  if (!work || !work.total) return 0
  return work.total
})

const version = computed(() => {
  const runtimeConfig = useRuntimeConfig()
  return runtimeConfig.public.VERSION
})

const buildDate = computed(() => {
  const runtimeConfig = useRuntimeConfig()
  return runtimeConfig.public.BUILD_DATE
})

watch(
  () => route.fullPath,
  async (newVal, oldVal) => {
    const routechanged = newVal !== oldVal
    if (sizer.value && routechanged) {
      const el = document.getElementById('sizer')
      if (getComputedStyle(el).display !== 'block') {
        // Not large screen, hide menu on move.
        showMenu.value = false
      }
    }

    if (routechanged) {
      if (route.query?.inMTapp) {
        const queryinMTapp =
          route.query.inMTapp === 'true' ? '0.4.6' : route.query.inMTapp
        console.error('queryinMTapp', queryinMTapp)
        window.sessionStorage.setItem('inMTapp', queryinMTapp)
        inMTapp.value = queryinMTapp
      }
      // Get per-group-work and ensure all current groups are in modGroupStore
      await modGroupStore.getModGroups()
    }
  }
)

watch(
  () => loginStateKnown,
  (newVal) => {
    if (newVal.value) {
      // We now know whether or not we have logged in.  Re-render the page to make it reflect that.
      bump.value++
    }
  },
  { immediate: true }
)

// Lifecycle hooks and watches
onMounted(async () => {
  inMTapp.value = window.sessionStorage?.getItem('inMTapp')

  // For this layout we don't need to be logged in.  So can just continue.  But we want to know first whether or
  // not we are logged in.  We might already know that from the server via cookies, but if not, find out.
  if (!loginStateKnown.value) {
    await authStore.fetchUser()
  }

  // If not logged in then show loginModal
  const me = authStore.user
  if (!me || !me.id) {
    loginModal.value.show()
    return
  }

  // Start our timer.  Holding the time in the store allows us to update the time regularly and have reactivity
  // cause displayed fromNow() values to change, rather than starting a timer for each of them.
  updateTime()

  // miscStore.set({ key: 'modtools', value: true, }) // Already done in app.vue

  // Check for work in global modtools/mixins/modme
  const miscStore = useMiscStore()
  miscStore.workTimer = setTimeout(checkWork, 0)

  await modConfigStore.fetch({ all: true })

  // Get chats and poll regularly for new ones
  chatStore.fetchLatestChatsMT()
})

onBeforeUnmount(() => {
  const miscStore = useMiscStore()
  if (miscStore.workTimer) {
    clearTimeout(miscStore.workTimer)
    miscStore.workTimer = false
  }
})

async function logOut() {
  console.log('Logout')
  await authStore.logout()
  authStore.forceLogin = true

  // Go to the landing page.
  router.push('/')
}
function requestLogin() {
  console.log('MODTOOLS.VUE requestLogin')
  loginModal.value.show()
}

function discourse(e) {
  window.open('https://discourse.ilovefreegle.org/')
  e.stopPropagation()
  e.preventDefault()
}

function clicklogo(e) {
  console.log('clicklogo', route.fullPath)
  if (route.fullPath === '/') {
    // Click on current route.  Reload.
    e.stopPropagation()
    router.go()
  } else {
    router.push('/')
  }
}

function toggleMenu() {
  showMenu.value = !showMenu.value
}

function updateTime() {
  miscStore.setTime()
  timeTimer.value = setTimeout(updateTime, 30000)
}

function googleLoggedIn() {
  // Re-render the page, now that we are logged in.
  bump.value++
}

function googleLoaded() {
  if (
    loginModal.value &&
    loginModal.value.showModal &&
    loginModal.value.email
  ) {
    console.log(
      'Showing login modal - leave well alone',
      loginModal.value.email
    )
  } else {
    bumpLogin.value++
  }
}

function mobilehidemenu() {
  showMenu.value = false
}
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

html {
  box-sizing: border-box;
}

@include media-breakpoint-up(sm) {
  #navbar .nav-item {
    text-align: center;
  }
}

.pageContent {
  padding-top: 68px;
}

/* Style the external nav-link class */
:deep(.nav-link) {
  padding-left: 2px !important;
  padding-right: 2px !important;
  padding-top: 0px !important;
  padding-bottom: 0px !important;
}

nav .navbar-nav li a.nuxt-link-active[data-v-314f53c6] {
  color: $color-white-opacity-50 !important;
}

.navbar-dark .navbar-nav .nav-link {
  color: $color-white !important;

  &:hover,
  &:focus {
    color: $color-white-opacity-75 !important;
  }
}

*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}

.navback {
  background-color: $color-modtools-navbar-background;
}

nav .navbar-nav li a,
.discourse {
  color: $color-gray--light !important;
}

#discourseIcon {
  color: $color-white !important;
}

nav .navbar-nav li a.nuxt-link-active {
  color: $color-white !important;
}

.navbar-brand a {
  color: $color-white !important;
}

.navbar a.navbar-brand {
  padding: 0px;
}

.navbar .logo {
  width: 58px !important;
  height: 58px !important;
  padding: 0px;
}

body.modal-open {
  padding-right: 0px !important;
}

.chatbadge {
  position: absolute;
  top: 0px;
  left: 25px;
}

.leftmenu {
  min-width: 185px;
  padding-top: 68px;
  background-color: $color-modtools-leftmenu-bg;

  a {
    color: $color-modtools-menu;
  }
}

.fw {
  width: 2rem;
  height: 2rem;
}

.status {
  left: -13px;
  position: relative;
  top: 1px;
}

.leftanddown {
  position: relative;
  left: -10px;
  top: 12px;
}

.leftandtop {
  position: relative;
  left: 25px;
  top: -39px;
}

.menu {
  color: $color-modtools-blue--dark !important;
  background-color: $color-white;
}

@include media-breakpoint-down(xs) {
  .menuCount {
    right: 7px;
    top: 5px;
  }

  .badge {
    position: absolute;
    top: 0px;
    left: 20px;
  }
}

@include media-breakpoint-up(sm) {
  .menuCount {
    right: 2px;
    top: 5px;
  }
}

.discourseBadge {
  position: absolute;
  top: 0px;
  left: 20x;
}
</style>

<style>
.container-fluid {
  --bs-gutter-x: 0;
}

a {
  color: #00f;
  text-decoration: none;
  background-color: transparent;
}

a:hover {
  text-decoration: underline;
}

.router-link-active {
  font-weight: bold;
}

#mtinfo {
  text-align: left;
  font-size: 65%;
}
</style>
