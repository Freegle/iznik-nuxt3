<template>
  <div class="pageback">
    <b-navbar id="navbar" :key="'nuxt1-' + bump" type="dark" class="navback p-0 p-sm-1 justify-content-between" fixed="top">
      <b-navbar-brand class="p-0 pr-2 d-flex">
        <b-img class="logo clickme" fluid rounded :src="logo" alt="Home" @click="clicklogo" />
        <ModStatus class="status" />
      </b-navbar-brand>
      <ModZoomStock class="d-none d-md-block text-white" />
      <b-navbar-nav class="d-flex align-items-center">
        <b-nav-item v-if="loggedIn" id="menu-option-modtools-discourse2" class="text-center p-0 mr-4" @click="discourse">
          <div class="position-relative small">
            <v-icon :icon="['fab', 'discourse']" scale="2" />
            <div class="d-none d-xl-block">
              Us
            </div>
            <b-badge v-show="discourseCount" variant="success" class="discourseBadge">
              {{ discourseCount }}
            </b-badge>
          </div>
        </b-nav-item>
        <ChatMenu v-if="loggedIn" id="menu-option-modtools-chat2" :is-list-item="true" :chat-count.sync="chatCount" class="mr-4" />
        <b-nav-item v-if="loggedIn">
          <div class="position-relative">
            <b-button variant="white" class="menu" @click="toggleMenu">
              <v-icon icon="bars" class="" scale="1.5" />
            </b-button>
            <b-badge v-show="menuCount" v-if="!showMenu" variant="danger" class="menuCount position-absolute" @click="toggleMenu">
              {{ menuCount }}
            </b-badge>
          </div>
        </b-nav-item>
        <b-nav-item v-if="!loggedIn">
          <b-button variant="white" @click="requestLogin">
            Log in
          </b-button>
        </b-nav-item>
      </b-navbar-nav>
    </b-navbar>

    <div :key="'nuxt2-' + bump" class="d-flex">
      <div v-if="showMenu" class="leftmenu text--medium-large-spaced">
        <ModMenuItemLeft link="/" name="Dashboard" />
        <hr>
        <div class="pl-1">
          Messages
        </div>
        <ModMenuItemLeft link="/messages/pending" name="Pending" :count="['pending']" :othercount="['pendingother']" indent />
        <ModMenuItemLeft link="/messages/approved" name="Approved" indent />
        <ModMenuItemLeft link="/messages/edits" name="Edits" :count="['editreview']" indent />
        <hr>
        <div class="pl-1">
          Members
        </div>
        <ModMenuItemLeft link="/members/approved" name="Approved" indent />
        <ModMenuItemLeft link="/members/review" name="Member Review" :count="['spammembers']" indent />
        <ModMenuItemLeft link="/chats/review" name="Chat Review" :count="['chatreview']" :othercount="['chatreviewother']" indent />
        <ModMenuItemLeft link="/members/related" name="Related" :count="['relatedmembers']" indent />
        <ModMenuItemLeft link="/members/stories" name="Stories" indent :count="['stories']" />
        <ModMenuItemLeft v-if="hasPermissionNewsletter" link="/members/newsletter" name="Newsletter" indent :count="['newsletterstories']" />
        <ModMenuItemLeft v-if="hasPermissionGiftAid" link="/giftaid" name="Gift Aid" indent :count="['giftaid']" />
        <ModMenuItemLeft link="/members/feedback" name="Feedback" indent :othercount="['happiness']" />
        <ModMenuItemLeft link="/members/microvolunteering" indent name="MicroVols" />
        <ModMenuItemLeft link="/members/notes" name="Notes" indent />
        <hr>
        <hr>
        <ModMenuItemLeft link="/communityevents" name="Events" :count="['pendingevents']" />
        <ModMenuItemLeft link="/volunteering" name="Volunteering" :count="['pendingvolunteering']" />
        <ModMenuItemLeft link="/publicity" name="Publicity" :count="['socialactions', 'popularposts']" />
        <ModMenuItemLeft link="/admins" name="Admins" :count="['pendingadmins']" />
        <ModMenuItemLeft link="/spammers" name="Spammers" :count="hasPermissionSpamAdmin ? ['spammerpendingadd', 'spammerpendingremove'] : []" />
        <hr>
        <ModMenuItemLeft link="/logs" name="Logs" />
        <ModMenuItemLeft v-if="supportOrAdmin" link="/support" name="Support" />
        <ModMenuItemLeft link="/settings" name="Settings" />
        <ModMenuItemLeft link="/teams" name="Teams" />
        <div>
          <ExternalLink href="https://wiki.ilovefreegle.org/ModTools" class="pl-1">
            Help
          </ExternalLink>
        </div>
        <div>
          <a href="#" class="pl-1" @click="logOut">
            Logout
          </a>
        </div>
      </div>
      <div class="ml-0 pl-0 pl-sm-1 pr-0 pr-sm-1 pageContent w-100">
        <slot ref="pageContent" />
      </div>
    </div>
    <div id="mtinfo" :title="buildDate">MT-{{ version }}</div>
    <!--ChatPopups v-if="loggedIn" class="d-none d-sm-block" TODO /-->
    <LoginModal v-if="complete" ref="loginModal" :key="'login-' + bumpLogin" />
    <div id="sizer" ref="sizer" class="d-none d-lg-block" />
  </div>
</template>

<script lang="ts">
import { useMiscStore } from '@/stores/misc'
import { useAuthStore } from '../stores/auth'

export default {
  setup() {
    const authStore = useAuthStore()
    const miscStore = useMiscStore()
    return { authStore, miscStore }
  },
  data: function () {
    return {
      logo: '/icon_modtools.png',
      showMenu: true, // TODO
      sliding: false,
      timeTimer: null,
      chatCount: 0,
      complete: true,  // CC
      bump: 0,
      bumpLogin: 0
    }
  },
  computed: {
    discourseCount() {
      /* const discourse = this.authStore.discourse
      return discourse
        ? discourse.notifications + discourse.newtopics + discourse.unreadtopics
        : 0*/
      return 77
    },
    slideclass() {
      return this.showMenu ? 'slide-in' : 'slide-out'
    },
    menuCount() {
      /*const myid = this.myid()
      console.log('menuCount myid', myid)
      const work = this.authStore.work
      if (process.env.IS_APP) setBadgeCount(this.chatCount + work.total) // CC
      return work.total*/
      return 88
    },
    work() {
      return this.authStore.work
    },
    version() {
      const runtimeConfig = useRuntimeConfig()
      return runtimeConfig.public.VERSION
    },
    buildDate() {
      const runtimeConfig = useRuntimeConfig()
      return runtimeConfig.public.BUILD_DATE
    },
  },
  mounted() {
    // TODO
    console.log('MODTOOLS.VUE mounted TODO')
    // Start our timer.  Holding the time in the store allows us to update the time regularly and have reactivity
    // cause displayed fromNow() values to change, rather than starting a timer for each of them.
    this.updateTime()

    this.miscStore.set({
      key: 'modtools',
      value: true,
    })
  },
  methods: {
    async logOut() {
      // Remove all cookies, both client and server.  This seems to be necessary to kill off the PHPSESSID cookie
      // on the server, which would otherwise keep us logged in despite our efforts.
      console.log('Logout')
      try {
        this.$cookies.removeAll()
      } catch (e) { }

      await this.authStore.logout()
      this.authStore.forceLogin = false

      // Go to the landing page.
      this.$router.push('/')
    },
    requestLogin() {
      console.log('MODTOOLS.VUE requestLogin')
      this.$refs.loginModal.show()
    },
    async checkWork() {
      /*await this.fetchMe(['work'], true)
      setTimeout(this.checkWork, 30000)*/
    },
    discourse(e) {
      window.open('https://discourse.ilovefreegle.org/')
      e.stopPropagation()
      e.preventDefault()
    },
    chats(e) {
      this.$router.push('/chats')
      e.stopPropagation()
      e.preventDefault()
    },
    clicklogo(e) {
      console.log('clicklogo', this.$route.fullPath)
      if (this.$route.fullPath === '/') {
        // Click on current route.  Reload.
        e.stopPropagation()
        this.$router.go()
      } else {
        this.$router.push('/')
      }
    },
    toggleMenu() {
      this.showMenu = !this.showMenu
    },
    updateTime() {
      this.miscStore.setTime()
      this.timeTimer = setTimeout(this.updateTime, 30000)
    },
    googleLoggedIn() {
      // Re-render the page, now that we are logged in.
      this.bump++
    },
    googleLoaded() {
      if (
        this.$refs.loginModal &&
        this.$refs.loginModal.showModal &&
        this.$refs.loginModal.email
      ) {
        console.log(
          'Showing login modal - leave well alone',
          this.$refs.loginModal.email
        )
      } else {
        this.bumpLogin++
      }
    },
    //login() {
    //  this.$refs.loginModal.show()
    //}
  }
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
::v-deep .nav-link {
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
  background-color: $color-modtools-blue--dark;
}

nav .navbar-nav li a,
.discourse {
  color: $color-gray--light !important;
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
    left: 25px;
  }
}

@include media-breakpoint-up(sm) {
  .menuCount {
    right: 15px;
    top: 5px;
  }
}

.discourseBadge {
  position: absolute;
  top: 0px;
  left: 25px;
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
  text-align: right;
}
</style>
