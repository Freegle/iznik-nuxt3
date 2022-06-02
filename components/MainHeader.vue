<template>
  <header>
    <!-- Navbar for large screens-->
    <b-nav
      id="navbar_large"
      toggleable="xl"
      type="dark"
      class="ourBack d-none d-xl-flex p-1"
      fixed="top"
    >
      <!--      <b-nav-brand to="/" class="p-0">-->
      <!--      TODO -->
      <nuxt-link to="/">
        <b-img
          class="logo mr-2"
          height="58"
          width="58"
          rounded
          :src="logo"
          alt="Home"
        />
      </nuxt-link>
      <div class="d-flex">
        <nuxt-link class="mr-4" to="/give">Give</nuxt-link>
        <nuxt-link class="mr-4" to="/browse">Browse</nuxt-link>
        <nuxt-link class="mr-4" to="/explore">Explore</nuxt-link>
      </div>
      <!--      </b-nav-brand>-->
      <client-only>
        <!--        <b-nav-toggle v-if="loggedIn" target="nav_collapse" />-->
        <b-collapse
          v-if="loggedIn"
          id="nav_collapse"
          ref="nav_collapse"
          is-nav
          class="flex-nowrap justify-content-between"
        >
          <b-nav class="mainnav mainnav--left">
            <b-nav-item
              id="menu-option-mygroups"
              no-prefetch
              class="text-center small p-0 ml-2"
              to="/browse"
              @mousedown="maybeReload('/browse')"
            >
              <v-icon icon="eye" size="2x" /><br />
              <span class="nav-item__text">Browse</span>
            </b-nav-item>
            <b-nav-item
              id="menu-option-give"
              no-prefetch
              class="text-center small p-0"
              to="/give"
              @mousedown="maybeReload('/give')"
            >
              <v-icon icon="gift" size="2x" /><br />
              <span class="nav-item__text">Give</span>
            </b-nav-item>
            <b-nav-item
              id="menu-option-find"
              no-prefetch
              class="text-center small p-0"
              to="/find"
              @mousedown="maybeReload('/find')"
            >
              <v-icon icon="shopping-cart" size="2x" /><br />
              <span class="nav-item__text">&nbsp;Ask</span>
            </b-nav-item>
            <b-nav-item
              id="menu-option-myposts"
              no-prefetch
              class="text-center small p-0"
              to="/myposts"
              @mousedown="maybeReload('/myposts')"
            >
              <div class="position-relative">
                <v-icon icon="home" size="2x" /><br />
                <b-badge
                  v-if="openPostCount"
                  variant="info"
                  class="mypostsbadge"
                  :title="openPostCountPlural"
                >
                  {{ openPostCount }}
                </b-badge>
                <span class="nav-item__text">My Posts</span>
              </div>
            </b-nav-item>
            <b-nav-item
              v-if="!simple"
              id="menu-option-chitchat"
              no-prefetch
              class="text-center small p-0"
              to="/chitchat"
              @mousedown="maybeReload('/chitchat')"
            >
              <div class="position-relative">
                <v-icon icon="coffee" size="2x" /><br />
                <b-badge
                  v-if="newsCount"
                  variant="info"
                  class="newsbadge"
                  :title="newsCountPlural"
                >
                  {{ newsCount }}
                </b-badge>
                <span class="nav-item__text">ChitChat</span>
              </div>
            </b-nav-item>
            <b-nav-item
              v-if="!simple"
              id="menu-option-communityevents"
              no-prefetch
              class="text-center small p-0"
              to="/communityevents"
              @mousedown="maybeReload('/communityevents')"
            >
              <v-icon icon="calendar-alt" size="2x" /><br />
              <span class="nav-item__text">Events</span>
            </b-nav-item>
            <b-nav-item
              v-if="!simple"
              id="menu-option-volunteering"
              no-prefetch
              class="text-center small p-0"
              to="/volunteerings"
              @mousedown="maybeReload('/volunteerings')"
            >
              <v-icon icon="hands-helping" size="2x" /><br />
              <span class="nav-item__text">Volunteer</span>
            </b-nav-item>
          </b-nav>
          <client-only>
            <div class="simplewrapper pb-2">
              <!--              TODO-->
              <!--              <SimpleView-->
              <!--                v-if="loggedIn"-->
              <!--                :key="'simpleview-' + simple"-->
              <!--                navbar-->
              <!--              />-->
            </div>
          </client-only>
          <b-nav class="mainnav mainnav--right">
            <!--            <NotificationOptions-->
            <!--              v-if="loggedIn"-->
            <!--              :distance="distance"-->
            <!--              :small-screen="false"-->
            <!--              :unread-notification-count.sync="unreadNotificationCount"-->
            <!--              @showAboutMe="showAboutMe"-->
            <!--            />-->
            <!--            <ChatMenu-->
            <!--              v-if="loggedIn"-->
            <!--              id="menu-option-chat"-->
            <!--              :is-list-item="true"-->
            <!--              :chat-count.sync="chatCount"-->
            <!--            />-->
            <b-nav-item
              v-if="!simple"
              id="menu-option-spread"
              no-prefetch
              class="text-center small p-0"
              to="/promote"
              @mousedown="maybeReload('/promote')"
            >
              <div class="position-relative">
                <v-icon icon="bullhorn" size="2x" /><br />
                <span class="nav-item__text">Promote</span>
              </div>
            </b-nav-item>
            <b-nav-item
              id="menu-option-help"
              no-prefetch
              class="text-center small p-0"
              to="/help"
              @mousedown="maybeReload('/help')"
            >
              <v-icon icon="question-circle" size="2x" /><br />
              <span class="nav-item__text">Help</span>
            </b-nav-item>
            <b-nav-item
              id="menu-option-settings"
              no-prefetch
              class="text-center small p-0"
              to="/settings"
              @mousedown="maybeReload('/settings')"
            >
              <v-icon icon="cog" size="2x" /><br />
              <span class="nav-item__text">Settings</span>
            </b-nav-item>
            <b-nav-item
              id="menu-option-logout"
              no-prefetch
              class="text-center p-0 small"
              @click="logOut"
            >
              <v-icon icon="sign-out-alt" size="2x" /><br />
              <span class="nav-item__text">Logout</span>
            </b-nav-item>
          </b-nav>
        </b-collapse>
      </client-only>
      <b-nav v-if="!loggedIn" class="ml-auto pt-2 pr-2">
        <client-only>
          <b-nav-item no-prefetch>
            <div class="btn btn-white" @click="requestLogin">Sign&nbsp;in</div>
          </b-nav-item>
        </client-only>
      </b-nav>
    </b-nav>
    <!-- Navbar for small screens -->
    <b-nav
      id="navbar_small"
      toggleable="xl"
      type="dark"
      class="ourBack d-flex justify-content-between d-xl-none"
      fixed="top"
    >
      <!--      TODO-->
      <!--      <b-nav-brand v-if="showBackButton" class="p-0">-->
      <div v-if="showBackButton">
        <client-only>
          <b-button
            ref="backButton"
            variant="white"
            class="nohover"
            @click="backButton"
          >
            <v-icon icon="arrow-left" />
          </b-button>
        </client-only>
        <!--      </b-nav-brand>-->
      </div>
      <div v-else class="p-0">
        <!--      <b-nav-brand v-else to="/" class="p-0">-->
        <b-img
          class="logo mr-2"
          height="58"
          width="58"
          rounded
          :src="logo"
          alt="Home"
        />
        <!--      </b-nav-brand>-->
      </div>
      <div class="d-flex align-items-center">
        <client-only>
          <!--          <NotificationOptions-->
          <!--            v-if="loggedIn"-->
          <!--            :distance="distance"-->
          <!--            :small-screen="true"-->
          <!--            :unread-notification-count.sync="unreadNotificationCount"-->
          <!--            @showAboutMe="showAboutMe"-->
          <!--          />-->
          <!--          <ChatMenu-->
          <!--            v-if="loggedIn"-->
          <!--            id="menu-option-chat-sm"-->
          <!--            :is-list-item="false"-->
          <!--            :chat-count.sync="chatCount"-->
          <!--            class="mr-3"-->
          <!--          />-->
        </client-only>

        <b-nav>
          <client-only>
            <b-nav-item v-if="!loggedIn" no-prefetch>
              <div class="btn btn-white" @click="requestLogin">
                Sign in or Join
              </div>
            </b-nav-item>
          </client-only>
        </b-nav>

        <b-nav class="">
          <b-button
            v-if="loggedIn"
            v-b-toggle.nav_collapse_mobile
            class="toggler white"
          >
            <v-icon icon="bars" class="mb-1" size="1-5x" />
          </b-button>
        </b-nav>
      </div>
      <b-collapse
        v-if="loggedIn"
        id="nav_collapse_mobile"
        ref="nav_collapse_mobile"
        class="w-100 ourBack"
        is-nav
      >
        <b-nav class="ml-auto flex-row flex-wrap small">
          <b-nav-item
            no-prefetch
            class="text-center p-0"
            to="/browse"
            @mousedown="maybeReload('/browse')"
          >
            <v-icon icon="eye" size="2x" /><br />
            <span class="nav-item__text">Browse</span>
          </b-nav-item>
          <b-nav-item
            no-prefetch
            class="text-center p-0"
            to="/give"
            @mousedown="maybeReload('/give')"
          >
            <v-icon icon="gift" size="2x" /><br />
            <span class="nav-item__text">Give</span>
          </b-nav-item>
          <b-nav-item
            no-prefetch
            class="text-center p-0"
            to="/find"
            @mousedown="maybeReload('/find')"
          >
            <v-icon icon="shopping-cart" size="2x" /><br />
            <span class="nav-item__text">Ask</span>
          </b-nav-item>
          <b-nav-item
            no-prefetch
            class="text-center p-0"
            to="/myposts"
            @mousedown="maybeReload('/myposts')"
          >
            <div class="position-relative">
              <v-icon icon="home" size="2x" /><br />
              <b-badge
                v-if="openPostCount"
                variant="info"
                class="mypostsbadge2"
                :title="openPostCountPlural"
              >
                {{ openPostCount }}
              </b-badge>
              <span class="nav-item__text">My Posts</span>
            </div>
          </b-nav-item>
          <b-nav-item
            v-if="!simple"
            no-prefetch
            class="text-center p-0 white"
            to="/chitchat"
            @mousedown="maybeReload('/chitchat')"
          >
            <div class="position-relative">
              <v-icon icon="coffee" size="2x" /><br />
              <b-badge
                v-if="newsCount"
                variant="info"
                class="newsbadge2"
                :title="newsCountPlural"
              >
                {{ newsCount }}
              </b-badge>
              <span class="nav-item__text">ChitChat</span>
            </div>
          </b-nav-item>
          <b-nav-item
            v-if="!simple"
            no-prefetch
            class="text-center p-0"
            to="/communityevents"
            @mousedown="maybeReload('/communityevents')"
          >
            <v-icon icon="calendar-alt" size="2x" /><br />
            <span class="nav-item__text">Events</span>
          </b-nav-item>
          <b-nav-item
            v-if="!simple"
            no-prefetch
            class="text-center p-0"
            to="/volunteerings"
            @mousedown="maybeReload('/volunteerings')"
          >
            <v-icon icon="hands-helping" size="2x" /><br />
            <span class="nav-item__text">Volunteer</span>
          </b-nav-item>
          <b-nav-item
            v-if="!simple"
            no-prefetch
            class="text-center p-0"
            to="/promote"
            @mousedown="maybeReload('/promote')"
          >
            <v-icon icon="bullhorn" size="2x" /><br />
            <span class="nav-item__text">Promote</span>
          </b-nav-item>
          <b-nav-item
            no-prefetch
            class="text-center p-0"
            to="/help"
            @mousedown="maybeReload('/help')"
          >
            <v-icon icon="question-circle" size="2x" /><br />
            <span class="nav-item__text">Help</span>
          </b-nav-item>
          <b-nav-item
            no-prefetch
            class="text-center p-0"
            to="/settings"
            @mousedown="maybeReload('/settings')"
          >
            <v-icon icon="cog" size="2x" /><br />
            <span class="nav-item__text">Settings</span>
          </b-nav-item>
          <b-nav-item no-prefetch class="text-center p-0" @click="logOut">
            <v-icon icon="sign-out-alt" size="2x" /><br />
            <span class="nav-item__text">Logout</span>
          </b-nav-item>
        </b-nav>
      </b-collapse>
    </b-nav>
    <client-only>
      <LoginModal ref="loginModal" />
      <!--      <AboutMeModal ref="aboutMeModal" />-->
    </client-only>
  </header>
</template>

<script>
// Import login modal synchronously as I've seen an issue where it's not in $refs when you click on the signin button too rapidly.
// const AboutMeModal = () => import('~/components/AboutMeModal')
// const ChatMenu = () => import('~/components/ChatMenu')
// const SimpleView = () => import('../components/SimpleView')
// const NotificationOptions = () => import('~/components/NotificationOptions')
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import pluralize from 'pluralize'
import LoginModal from '~/components/LoginModal'
import { useAuthStore } from '~/stores/auth'

export default {
  name: 'MainHeader',
  components: {
    // SimpleView,
    // NotificationOptions,
    // ChatMenu,
    LoginModal,
    // AboutMeModal,
  },
  setup() {
    const authStore = useAuthStore()
    const route = useRoute()
    const router = useRouter()

    return {
      authStore,
      route,
      router,
    }
  },
  data() {
    return {
      distance: 1000,
      logo: '/icon.png',
      unreadNotificationCount: 0,
      chatCount: 0,
    }
  },
  computed: {
    showBackButton() {
      // On mobile we want to show a back button instead of the logo when we're not on one of the "home" routes,
      // which are /browse, /chitchat, /myposts
      const route = useRoute()

      return (
        route.path !== '/browse' &&
        route.path !== '/chitchat' &&
        route.path !== '/myposts' &&
        route.path !== '/'
      )
    },
    newsCount() {
      return 0
      // return this.$store.getters['newsfeed/count']
      // TODO
    },
    newCountPlural() {
      return pluralize('unread ChitChat post', this.newsCount, true)
    },
    openPostCount() {
      return this.me ? this.me.openposts : 0
    },
    openPostCountPlural() {
      return pluralize('open post', this.openPostCount, { includeNumber: true })
    },
  },
  watch: {
    unreadNotificationCount() {
      this.$emit('update:unreadNotificationCount', this.unreadNotificationCount)
    },
    chatCount() {
      this.$emit('update:chatCount', this.chatCount)
    },
    $route() {
      // Close the dropdown menu when we move around.
      if (
        this.$refs.nav_collapse &&
        this.$refs.nav_collapse.$el.classList.contains('show')
      ) {
        this.$root.$emit('bv::toggle::collapse', 'nav_collapse')
      }

      if (
        this.$refs.nav_collapse_mobile &&
        this.$refs.nav_collapse_mobile.$el.classList.contains('show')
      ) {
        this.$root.$emit('bv::toggle::collapse', 'nav_collapse_mobile')
      }
    },
  },
  mounted() {
    setTimeout(async () => {
      // Look for a custom logo.
      const runtimeConfig = useRuntimeConfig()

      const api = runtimeConfig.APIv1
      const res = await axios.get(api + '/logo')

      if (res.status === 200) {
        const ret = res.data

        if (ret.ret === 0 && ret.logo) {
          this.logo = ret.logo.path.replace(/.*logos/, '/logos')
        }
      }
    }, 5000)

    this.getCounts()
  },
  methods: {
    requestLogin() {
      this.$refs.loginModal.show()
    },
    async logOut() {
      // Remove all cookies, both client and server.  This seems to be necessary to kill off the PHPSESSID cookie
      // on the server, which would otherwise keep us logged in despite our efforts.
      try {
        this.$cookies.removeAll()
      } catch (e) {}

      await this.authStore.logOut()
      this.authStore.forceLogin = false

      // Go to the landing page.
      this.router.push('/')
    },
    showAboutMe() {
      // await this.fetchMe(['me'], true)
      this.$refs.aboutMeModal.show()
    },
    maybeReload(route) {
      if (this.router.currentRoute.path === route) {
        // We have clicked to route to the page we're already on.  Force a full refresh.
        window.location.reload(true)
      }
    },
    backButton() {
      try {
        this.router.back()
      } catch (e) {
        this.router.push('/')
      }
    },
    getCounts() {
      // TODO
      // await this.$store.dispatch('newsfeed/count')
      // await this.fetchMe(['openposts'], true)

      setTimeout(this.getCounts, 60000)
    },
  },
}
</script>

<style scoped lang="scss">
@import '~bootstrap/scss/functions';
@import '~bootstrap/scss/variables';
@import '~bootstrap/scss/mixins/_breakpoints';

#navbar_large .nav-item {
  text-align: center;
}

.ourBack {
  background-color: $color-green-background !important;
}

.mainnav {
  display: flex;
  justify-content: space-between;
}

.mainnav--left {
  width: 50%;
  max-width: 520px;
}

.mainnav--right {
  width: 40%;
  max-width: 400px;
}

.nuxt-link-active .nav-item__text {
  border-bottom: 1px solid white;
  padding-top: 2px;
}

/* Style the external nav-link class */
:deep(.nav-link) {
  padding-left: 2px !important;
  padding-right: 2px !important;
  padding-top: 0px !important;
  padding-bottom: 0px !important;

  color: $color-white !important;

  &:hover,
  &:focus {
    color: $color-white-opacity-75 !important;
  }
}

nav .navbar li a.nuxt-link-active {
  color: $color-white-opacity-50 !important;
}

#nav_collapse_mobile {
  margin-top: 5px;

  .navbar {
    border-top: 1px solid $color-gray--light;
    padding-top: 5px;
    margin-top: 5px;
    justify-content: center;
  }

  .nav-item {
    flex: 1;
    flex-basis: 25%;
    margin: 20px 0;

    @include media-breakpoint-up(md) {
      flex-basis: unset;
    }
  }

  a {
    &.nav-link {
      color: $color-white;
    }
  }
}

.notiflist {
  max-width: 100%;
}

/* These classes style the external b-nav-item no-prefetch-dropdown component */
.notiflist :deep(.dropdown-menu) {
  height: 500px;
  overflow-y: auto;
}

.notiflist :deep(.dropdown-item) {
  width: 300px;
  max-width: 100%;
  padding-left: 5px;
  overflow-wrap: break-word;
}

.navbar-brand a {
  color: $color-white !important;
}

.navbar a.navbar-brand {
  padding: 0px;
  margin: 0;
}

.navbar .logo {
  width: 58px !important;
  padding: 0px;
  margin-top: -5px;
  margin-bottom: -5px;
}

.simplewrapper {
  width: 150px;
}

svg.fa-icon {
  height: 32px;
  margin-bottom: 0;
}

.toggler {
  background: transparent;
  border-color: $color-white;
}

.toggler:hover {
  background: $color-white !important;
  color: $colour-success !important;
}

.toggler svg {
  vertical-align: -20px;
}

.nohover:hover {
  background-color: $color-white;
  border-color: $color-green--dark;
  color: $color-black;
}

.newsbadge {
  position: absolute;
  top: 2px;
  left: 25px;
  font-size: 11px;
}

.newsbadge2 {
  position: absolute;
  top: 2px;
  right: 20px;
  font-size: 11px;
}

.mypostsbadge {
  position: absolute;
  top: 2px;
  right: 4px;
  font-size: 11px;
}

.mypostsbadge2 {
  position: absolute;
  top: 2px;
  right: 17px;
  font-size: 11px;
}
</style>
