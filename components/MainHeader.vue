<template>
  <header>
    <!-- Navbar for large screens-->
    <b-nav
      id="navbar_large"
      class="navbar ourBack d-none d-xl-flex pl-1 pr-2 navbar-dark fixed-top navbar-expand-xl"
    >
      <nuxt-link :to="homePage" class="navbar-brand p-0">
        <b-img
          class="logo mr-2"
          height="58"
          width="58"
          rounded
          :src="logo"
          alt="Home"
        />
      </nuxt-link>
      <b-button
        v-if="loggedIn"
        aria-label="Toggle navigation"
        class="navbar-toggler collapsed"
        aria-controls="nav_collapse"
        style="overflow-anchor: none"
      >
        <span class="navbar-toggler-icon"></span>
      </b-button>
      <div
        v-if="loggedIn"
        id="nav_collapse"
        class="flex-nowrap justify-content-between navbar-collapse collapse"
        style="display: none"
      >
        <ul class="navbar-nav mainnav mainnav--left">
          <li>
            <nuxt-link
              id="menu-option-mygroups"
              no-prefetch
              class="nav-link text-center small p-0 ml-2"
              to="/browse"
              @mousedown="maybeReload('/browse')"
            >
              <v-icon icon="eye" class="fa-2x" /><br />
              <span class="nav-item__text">Browse</span>
            </nuxt-link>
          </li>
          <li>
            <nuxt-link
              id="menu-option-give"
              no-prefetch
              class="nav-link text-center small p-0"
              to="/give"
              @mousedown="maybeReload('/give')"
            >
              <v-icon icon="gift" class="fa-2x" /><br />
              <span class="nav-item__text">Give</span>
            </nuxt-link>
          </li>
          <li>
            <nuxt-link
              id="menu-option-find"
              no-prefetch
              class="nav-link text-center small p-0"
              to="/find"
              @mousedown="maybeReload('/find')"
            >
              <v-icon icon="shopping-cart" class="fa-2x" /><br />
              <span class="nav-item__text">&nbsp;Ask</span>
            </nuxt-link>
          </li>
          <li>
            <nuxt-link
              id="menu-option-myposts"
              no-prefetch
              class="nav-link text-center small p-0"
              to="/myposts"
              @mousedown="maybeReload('/myposts')"
            >
              <div class="position-relative">
                <v-icon icon="home" class="fa-2x" /><br />
                <b-badge
                  v-if="activePostsCount"
                  variant="info"
                  class="mypostsbadge"
                  :title="activePostsCountPlural"
                >
                  {{ activePostsCount }}
                </b-badge>
                <span class="nav-item__text">My Posts</span>
              </div>
            </nuxt-link>
          </li>
          <li>
            <nuxt-link
              v-if="!simple"
              id="menu-option-chitchat"
              no-prefetch
              class="nav-link text-center small p-0"
              to="/chitchat"
              @mousedown="maybeReload('/chitchat')"
            >
              <div class="position-relative">
                <v-icon icon="coffee" class="fa-2x" /><br />
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
            </nuxt-link>
          </li>
          <li>
            <nuxt-link
              v-if="!simple"
              id="menu-option-communityevents"
              no-prefetch
              class="nav-link text-center small p-0"
              to="/communityevents"
              @mousedown="maybeReload('/communityevents')"
            >
              <v-icon icon="calendar-alt" class="fa-2x" /><br />
              <span class="nav-item__text">Events</span>
            </nuxt-link>
          </li>
          <li>
            <nuxt-link
              v-if="!simple"
              id="menu-option-volunteering"
              no-prefetch
              class="nav-link text-center small p-0"
              to="/volunteerings"
              @mousedown="maybeReload('/volunteerings')"
            >
              <v-icon icon="hands-helping" class="fa-2x" /><br />
              <span class="nav-item__text">Volunteer</span>
            </nuxt-link>
          </li>
        </ul>
        <!--        TOTO Simple?-->
        <!--        <div  class="simplewrapper pb-2">-->
        <!--          <div-->
        <!--            data-v-72fc0792=""-->
        <!--            -->
        <!--            title="Toggle between the full website and a simplified version"-->
        <!--            class="wrapper"-->
        <!--          >-->
        <!--            <label-->
        <!--              data-v-25adc6c0=""-->
        <!--              data-v-72fc0792=""-->
        <!--              class="toggle vue-js-switch toggled"-->
        <!--              value="true"-->
        <!--              height="36"-->
        <!--              width="150"-->
        <!--              font-size="14"-->
        <!--              labels="[object Object]"-->
        <!--              ><input-->
        <!--                data-v-25adc6c0=""-->
        <!--                type="checkbox"-->
        <!--                class="v-switch-input"-->
        <!--              />-->
        <!--              <div-->
        <!--                data-v-25adc6c0=""-->
        <!--                class="v-switch-core"-->
        <!--                style="-->
        <!--                  width: 150px;-->
        <!--                  height: 36px;-->
        <!--                  background-color: rgb(117, 199, 145);-->
        <!--                  border-radius: 18px;-->
        <!--                "-->
        <!--              >-->
        <!--                <div-->
        <!--                  data-v-25adc6c0=""-->
        <!--                  class="v-switch-button"-->
        <!--                  style="-->
        <!--                    width: 30px;-->
        <!--                    height: 30px;-->
        <!--                    transition: transform 300ms ease 0s;-->
        <!--                    transform: translate3d(117px, 3px, 0px);-->
        <!--                  "-->
        <!--                ></div>-->
        <!--              </div>-->
        <!--              <span-->
        <!--                data-v-25adc6c0=""-->
        <!--                class="v-switch-label v-left"-->
        <!--                style="line-height: 36px; font-size: 14px"-->
        <!--                >Full Website</span-->
        <!--              ></label-->
        <!--            >-->
        <!--          </div>-->
        <!--        </div>-->
        <ul class="navbar-nav mainnav mainnav--right">
          <li>
            <NotificationOptions
              v-if="loggedIn"
              v-model:unread-notification-count="unreadNotificationCount"
              :distance="distance"
              :small-screen="false"
              @showAboutMe="showAboutMe"
            />
          </li>
          <li>
            <ChatMenu
              v-if="loggedIn"
              id="menu-option-chat"
              v-model:chat-count="chatCount"
              :is-list-item="true"
            />
          </li>
          <li>
            <nuxt-link
              v-if="!simple"
              id="menu-option-spread"
              no-prefetch
              class="nav-link text-center small p-0"
              to="/promote"
              @mousedown="maybeReload('/promote')"
            >
              <div class="position-relative">
                <v-icon icon="bullhorn" class="fa-2x" /><br />
                <span class="nav-item__text">Promote</span>
              </div>
            </nuxt-link>
          </li>
          <li>
            <nuxt-link
              id="menu-option-help"
              no-prefetch
              class="nav-link text-center small p-0"
              to="/help"
              @mousedown="maybeReload('/help')"
            >
              <v-icon icon="question-circle" class="fa-2x" /><br />
              <span class="nav-item__text">Help</span>
            </nuxt-link>
          </li>
          <li>
            <nuxt-link
              id="menu-option-settings"
              no-prefetch
              class="nav-link text-center small p-0"
              to="/settings"
              @mousedown="maybeReload('/settings')"
            >
              <v-icon icon="cog" class="fa-2x" /><br />
              <span class="nav-item__text">Settings</span>
            </nuxt-link>
          </li>
          <li>
            <nuxt-link
              id="menu-option-logout"
              no-prefetch
              class="nav-link text-center p-0 small"
              @click="logout"
            >
              <v-icon icon="sign-out-alt" class="fa-2x" /><br />
              <span class="nav-item__text">Logout</span>
            </nuxt-link>
          </li>
        </ul>
      </div>
      <div v-if="!loggedIn" class="navbar-nav ml-auto">
        <client-only>
          <div class="nav-item" no-prefetch>
            <b-button variant="white" class="mr-2" @click="requestLogin">
              Sign&nbsp;in
            </b-button>
          </div>
        </client-only>
      </div>
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
          <NotificationOptions
            v-if="loggedIn"
            :distance="distance"
            :small-screen="true"
            :unread-notification-count.sync="unreadNotificationCount"
            @showAboutMe="showAboutMe"
          />
          <ChatMenu
            v-if="loggedIn"
            id="menu-option-chat-sm"
            :is-list-item="false"
            :chat-count.sync="chatCount"
            class="mr-3"
          />
        </client-only>

        <b-nav>
          <client-only>
            <nuxt-link v-if="!loggedIn" no-prefetch>
              <div class="btn btn-white" @click="requestLogin">
                Log in or Join
              </div>
            </nuxt-link>
          </client-only>
        </b-nav>

        <b-nav class="">
          <b-button
            v-if="loggedIn"
            v-b-toggle.nav_collapse_mobile
            class="toggler white mr-1"
          >
            <v-icon icon="bars" class="mb-1 fa-1-5x" />
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
          <li class="nav-item text-center p-0">
            <nuxt-link
              no-prefetch
              class="nav-link text-center p-0"
              to="/browse"
              @mousedown="maybeReload('/browse')"
            >
              <v-icon icon="eye" class="fa-2x" /><br />
              <span class="nav-item__text">Browse</span>
            </nuxt-link>
          </li>
          <li class="nav-item text-center p-0">
            <nuxt-link
              no-prefetch
              class="nav-link text-center p-0"
              to="/give"
              @mousedown="maybeReload('/give')"
            >
              <v-icon icon="gift" class="fa-2x" /><br />
              <span class="nav-item__text">Give</span>
            </nuxt-link>
          </li>
          <li class="nav-item text-center p-0">
            <nuxt-link
              no-prefetch
              class="nav-link text-center p-0"
              to="/find"
              @mousedown="maybeReload('/find')"
            >
              <v-icon icon="shopping-cart" class="fa-2x" /><br />
              <span class="nav-item__text">Ask</span>
            </nuxt-link>
          </li>
          <li class="nav-item text-center p-0">
            <nuxt-link
              no-prefetch
              class="nav-link text-center p-0"
              to="/myposts"
              @mousedown="maybeReload('/myposts')"
            >
              <div class="position-relative">
                <v-icon icon="home" class="fa-2x" /><br />
                <b-badge
                  v-if="activePostsCount"
                  variant="info"
                  class="mypostsbadge2"
                  :title="activePostsCountPlural"
                >
                  {{ activePostsCount }}
                </b-badge>
                <span class="nav-item__text">My Posts</span>
              </div>
            </nuxt-link>
          </li>
          <li class="nav-item text-center p-0">
            <nuxt-link
              v-if="!simple"
              no-prefetch
              class="nav-link text-center p-0 white"
              to="/chitchat"
              @mousedown="maybeReload('/chitchat')"
            >
              <div class="position-relative">
                <v-icon icon="coffee" class="fa-2x" /><br />
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
            </nuxt-link>
          </li>
          <li class="nav-item text-center p-0">
            <nuxt-link
              v-if="!simple"
              no-prefetch
              class="nav-link text-center p-0"
              to="/communityevents"
              @mousedown="maybeReload('/communityevents')"
            >
              <v-icon icon="calendar-alt" class="fa-2x" /><br />
              <span class="nav-item__text">Events</span>
            </nuxt-link>
          </li>
          <li class="nav-item text-center p-0">
            <nuxt-link
              v-if="!simple"
              no-prefetch
              class="nav-link text-center p-0"
              to="/volunteerings"
              @mousedown="maybeReload('/volunteerings')"
            >
              <v-icon icon="hands-helping" class="fa-2x" /><br />
              <span class="nav-item__text">Volunteer</span>
            </nuxt-link>
          </li>
          <li class="nav-item text-center p-0">
            <nuxt-link
              v-if="!simple"
              no-prefetch
              class="nav-link text-center p-0"
              to="/promote"
              @mousedown="maybeReload('/promote')"
            >
              <v-icon icon="bullhorn" class="fa-2x" /><br />
              <span class="nav-item__text">Promote</span>
            </nuxt-link>
          </li>
          <li class="nav-item text-center p-0">
            <nuxt-link
              no-prefetch
              class="nav-link text-center p-0"
              to="/help"
              @mousedown="maybeReload('/help')"
            >
              <v-icon icon="question-circle" class="fa-2x" /><br />
              <span class="nav-item__text">Help</span>
            </nuxt-link>
          </li>
          <li class="nav-item text-center p-0">
            <nuxt-link
              no-prefetch
              class="nav-link text-center p-0"
              to="/settings"
              @mousedown="maybeReload('/settings')"
            >
              <v-icon icon="cog" class="fa-2x" /><br />
              <span class="nav-item__text">Settings</span>
            </nuxt-link>
          </li>
          <li class="nav-item text-center p-0">
            <nuxt-link
              no-prefetch
              class="nav-link text-center p-0"
              @click="logout"
            >
              <v-icon icon="sign-out-alt" class="fa-2x" /><br />
              <span class="nav-item__text">Logout</span>
            </nuxt-link>
          </li>
        </b-nav>
      </b-collapse>
    </b-nav>
    <LoginModal ref="loginModal" />
    <!--      <AboutMeModal ref="aboutMeModal" />-->
  </header>
</template>
<script>
// Import login modal synchronously as I've seen an issue where it's not in $refs when you click on the signin button too rapidly.
// const AboutMeModal = () => import('~/components/AboutMeModal')
// const ChatMenu = () => import('~/components/ChatMenu')
// const SimpleView = () => import('../components/SimpleView')
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import pluralize from 'pluralize'
import { useMiscStore } from '../stores/misc'
import { useNewsfeedStore } from '../stores/newsfeed'
import { useMessageStore } from '../stores/message'
import { useNotificationStore } from '../stores/notification'
import LoginModal from '~/components/LoginModal'
import { useAuthStore } from '~/stores/auth'
const NotificationOptions = () => import('~/components/NotificationOptions')

export default {
  name: 'MainHeader',
  components: {
    // SimpleView,
    NotificationOptions,
    // ChatMenu,
    LoginModal,
    // AboutMeModal,
  },
  setup() {
    const authStore = useAuthStore()
    const miscStore = useMiscStore()
    const newsfeedStore = useNewsfeedStore()
    const messageStore = useMessageStore()
    const notificationStore = useNotificationStore()
    const route = useRoute()
    const router = useRouter()

    return {
      miscStore,
      authStore,
      newsfeedStore,
      messageStore,
      notificationStore,
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
      activePostsCount: 0,
    }
  },
  computed: {
    homePage() {
      const lastRoute = this.miscStore.get('lasthomepage')

      let nextroute = '/browse'

      if (lastRoute === 'news') {
        nextroute = '/chitchat'
      } else if (lastRoute === 'myposts') {
        nextroute = '/myposts'
      }

      return nextroute
    },
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
      return this.newsfeedStore.count
    },
    newsCountPlural() {
      return pluralize('unread ChitChat post', this.newsCount, true)
    },
    activePostsCountPlural() {
      return pluralize('open post', this.activePostsCount, {
        includeNumber: true,
      })
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
    async logout() {
      // Remove all cookies, both client and server.  This seems to be necessary to kill off the PHPSESSID cookie
      // on the server, which would otherwise keep us logged in despite our efforts.
      try {
        this.$cookies.removeAll()
      } catch (e) {}

      await this.authStore.logout()
      this.authStore.forceLogin = false

      // Go to the landing page.
      this.router.push('/')
    },
    showAboutMe() {
      // await this.fetchMe(['me'], true)
      this.$refs.aboutMeModal.show()
    },
    maybeReload(route) {
      if (this.router?.currentRoute?.value?.path === route) {
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
    async getCounts() {
      if (this.myid) {
        await this.newsfeedStore.fetchCount()

        // Get the messages for the currently logged in user.  This will also speed up the My Posts page.
        const messages = await this.messageStore.fetchByUser(this.myid, false)

        this.activePostsCount = 0

        if (messages) {
          // Count messages with no outcome
          this.activePostsCount = messages.filter((msg) => {
            return !msg.hasoutcome
          }).length
        }

        this.unreadNotificationCount = await this.notificationStore.fetchCount()

        if (this.unreadNotificationCount) {
          // Fetch the notifications too, so that we can be quick if they view them.
          this.notificationStore.fetchList()
        }
      }

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
  right: 10px;
  font-size: 11px;
  background-color: $colour-secondary !important;
  color: white !important;
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
