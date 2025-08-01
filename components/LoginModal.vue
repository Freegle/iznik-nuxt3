<template>
  <b-modal
    v-if="!loggedIn"
    id="loginModal"
    ref="loginModal"
    v-model="showModal"
    no-fade
    size="lg"
    no-trap
    :no-close-on-backdrop="forceLogin"
    :hide-header-close="forceLogin"
    :no-close-on-esc="forceLogin"
    hide-footer
    modal-class="verytop"
    scrollable
  >
    <!-- This is required as the default bootstrap component makes the main title an h5 -->
    <template #title>
      <h2>Let's get freegling!</h2>
    </template>
    <div v-if="signUp" class="d-flex justify-content-around mb-2">
      <b-button
        variant="link"
        class="font-weight-bold pl-1 py-0 border-0 align-top d-block d-md-none test-already-a-freegler"
        @click="clickShowSignIn"
      >
        Already a freegler? Log in
      </b-button>
    </div>
    <p v-if="signUp" class="text-center">
      You'll get emails. Name, approximate location, and profile picture are
      public - you can hide your real name and picture from Settings. Logging in
      adds cookies and local storage. Read
      <nuxt-link no-prefetch target="_blank" to="/terms"
        >Terms of Use
      </nuxt-link>
      and
      <nuxt-link no-prefetch target="_blank" to="/privacy">Privacy</nuxt-link>
      for details. Ok? Now come on in...
    </p>
    <p v-if="loginType" class="text-center font-weight-bold">
      You usually log in using {{ loginType }}.
    </p>
    <div class="d-flex flex-column flex-lg-row justify-content-between p-3">
      <div class="signin__section--social">
        <h3 class="header--size5 pb-3">Log in with a social account</h3>
        <p v-if="signUp" class="font-weight-bold">
          Using one of these buttons is the easiest way to create an account:
        </p>
        <b-button
          class="social-button social-button--facebook"
          :disabled="facebookDisabled"
          @click="loginFacebook"
        >
          <b-img
            src="/signinbuttons/facebook-logo.png"
            class="social-button__image"
          />
          <span class="p-2 text--medium font-weight-bold"
            >Continue with Facebook</span
          >
        </b-button>
        <div
          id="googleLoginButton"
          ref="googleLoginButton"
          class="social-button social-button--google clickme"
        />
        <b-button
          class="social-button social-button--yahoo"
          :disabled="yahooDisabled"
          @click="loginYahoo"
        >
          <b-img
            src="/signinbuttons/yahoo-logo.svg"
            class="social-button__image"
          />
          <span class="p-2 text--medium font-weight-bold"
            >Continue with Yahoo</span
          >
        </b-button>
        <notice-message v-if="socialblocked" variant="warning">
          Social log in blocked - check your privacy settings, including any ad
          blockers such as Adblock Plus.
        </notice-message>
        <b-alert v-if="socialLoginError" variant="danger" :model-value="true">
          Login Failed: {{ socialLoginError }}
        </b-alert>
      </div>
      <div class="divider__wrapper">
        <div class="divider" />
        <div class="divider__text">OR</div>
        <div class="divider" />
      </div>
      <div class="signin__section--freegle">
        <h3 class="header--size5 pb-0">
          <span v-if="signUp"> Create an account on Freegle </span>
          <span v-else>Continue with your Freegle account</span>
        </h3>
        <div v-if="signUp" class="d-flex justify-content-around">
          <b-button
            variant="link"
            class="font-weight-bold pl-1 py-0 border-0 align-top d-none d-md-block test-already-a-freegler"
            @click="clickShowSignIn"
          >
            Already a freegler? Log in
          </b-button>
        </div>
        <b-form
          id="loginform"
          ref="form"
          action="/"
          autocomplete="on"
          method="post"
          class="mt-1"
          @submit="loginNative"
        >
          <div v-if="signUp">
            <b-form-group id="nameGroup" label="Your name" label-for="fullname">
              <b-form-input
                id="fullname"
                v-model="fullname"
                name="fullname"
                :class="{
                  'mb-3': true,
                  'border-danger': fullNameError,
                }"
                autocomplete="name"
                placeholder="Your full name"
              />
            </b-form-group>
          </div>
          <EmailValidator
            v-model:email="email"
            v-model:valid="emailValid"
            size="md"
            label="Your email address"
            :input-class="emailError ? 'border-danger' : ''"
          />
          <NoticeMessage v-if="referToGoogleButton">
            Please use the <em>Continue with Google</em> button to log in. That
            way you don't need to remember a password on this site.
          </NoticeMessage>
          <NoticeMessage v-if="referToYahooButton">
            Please use the <em>Continue with Yahoo</em> button to log in. That
            way you don't need to remember a password on this site.
          </NoticeMessage>
          <PasswordEntry
            v-model="password"
            :original-password="password"
            :error-border="passwordError"
            :placeholder="signUp ? 'Choose password' : 'Your password'"
          />
          <b-button
            block
            size="lg"
            variant="primary"
            class="mb-2 mt-2 w-100"
            type="submit"
            value="login"
          >
            <span v-if="!signUp"> Log in to Freegle </span>
            <span v-else> Register on Freegle </span>
          </b-button>
          <b-alert v-if="nativeLoginError" variant="danger" :model-value="true">
            {{ nativeLoginError }}
          </b-alert>
          <div v-if="!signUp" class="text-center">
            <nuxt-link no-prefetch to="/forgot" class="nodecor" @click="forgot">
              I forgot my password
            </nuxt-link>
            <p class="mb-0 text-center">
              <b-button
                variant="link"
                class="ps-1 pe-0 py-0 border-0 align-top test-new-freegler"
                @click="clickShowSignUp"
              >
                New freegler? Register
              </b-button>
            </p>
          </div>
        </b-form>
      </div>
    </div>
    <div class="marketing-consent-container pt-1 pb-3">
      <b-form-checkbox
        id="marketingConsent"
        v-model="marketingConsent"
        name="marketingConsent"
        class="marketing-consent-checkbox pt-1"
      >
        We'll also keep in touch by email about what's happening and other ways
        you can support Freegle.
      </b-form-checkbox>
    </div>
  </b-modal>
</template>
<script setup>
import {
  ref,
  computed,
  watch,
  defineAsyncComponent,
  onBeforeUnmount,
  onMounted,
  nextTick,
  getCurrentInstance,
} from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { LoginError, SignUpError } from '../api/BaseAPI'
import EmailValidator from './EmailValidator'
import { useRuntimeConfig } from '#app'
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { useMe } from '~/composables/useMe'
import Api from '~/api'

const NoticeMessage = defineAsyncComponent(() =>
  import('~/components/NoticeMessage')
)
const PasswordEntry = defineAsyncComponent(() =>
  import('~/components/PasswordEntry')
)

// Setup
const authStore = useAuthStore()
const miscStore = useMiscStore()
const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const { gtm } = getCurrentInstance().appContext.config.globalProperties
const { me, loggedIn } = useMe()

const api = Api(runtimeConfig)

// Refs
const bump = ref(Date.now())
const fullname = ref(null)
const email = ref(null)
const emailValid = ref(false)
const password = ref(null)
const marketingConsent = computed({
  get: () => miscStore.marketingConsent,
  set: (value) => miscStore.setMarketingConsent(value),
})
const showModal = ref(false)
const pleaseShowModal = ref(false)
const showSignUp = ref(false)
const forceSignIn = ref(false)
const nativeLoginError = ref(null)
const socialLoginError = ref(null)
const initialisedSocialLogin = ref(false)
const showSocialLoginBlocked = ref(false)
const nativeBump = ref(1)
const timerElapsed = ref(false)
const buttonClicked = ref(false)
let bumpTimer = null
const form = ref(null)
const loginModal = ref(null)
const googleLoginButton = ref(null)

// Store refs
const { loggedInEver } = storeToRefs(authStore)
const { loginType, forceLogin } = storeToRefs(authStore)

// Computed
const clientId = computed(() => {
  return runtimeConfig.public.GOOGLE_CLIENT_ID
})

const facebookDisabled = computed(() => {
  return (
    bump.value &&
    (showSocialLoginBlocked.value || typeof window.FB === 'undefined')
  )
})

const googleDisabled = computed(() => {
  return (
    bump.value &&
    showSocialLoginBlocked.value &&
    (!window || !window.google || !window.google.accounts)
  )
})

const yahooDisabled = computed(() => {
  // Yahoo currently can't be disabled, because it's redirect auth flow rather than load of a JS toolkit.
  return false
})

const socialblocked = computed(() => {
  const ret =
    bump.value &&
    initialisedSocialLogin.value &&
    (facebookDisabled.value || googleDisabled.value || yahooDisabled.value) &&
    timerElapsed.value
  return ret
})

const signUp = computed(() => {
  if (forceSignIn.value) {
    return false
  } else {
    return !loggedInEver.value || showSignUp.value
  }
})

const referToGoogleButton = computed(() => {
  return (
    email.value?.toLowerCase().includes('gmail') ||
    email.value?.toLowerCase().includes('googlemail')
  )
})

const referToYahooButton = computed(() => {
  return email.value?.toLowerCase().includes('yahoo')
})

const fullNameError = computed(() => {
  return nativeBump.value && buttonClicked.value && !fullname.value
})

const formFields = computed(() => {
  return [fullname.value, email.value, password.value, marketingConsent.value]
})

const emailError = computed(() => {
  return (
    nativeBump.value &&
    buttonClicked.value &&
    (!email.value || !emailValid.value)
  )
})

const passwordError = computed(() => {
  return nativeBump.value && buttonClicked.value && !password.value
})

// Lifecycle hooks
onMounted(() => {
  // Set marketing consent to true if it doesn't have a value yet
  if (
    miscStore.marketingConsent === null ||
    miscStore.marketingConsent === undefined
  ) {
    miscStore.setMarketingConsent(true)
  }
})

// Methods
function tryLater(native) {
  if (native) {
    nativeLoginError.value = 'Something went wrong; please try later.'
  } else {
    socialLoginError.value = 'Something went wrong; please try later.'
  }
}

function bumpIt() {
  // Force reconsideration of social signin disabled.  Need to do that regularly in case the SDKs haven't loaded
  // by the time we open the modal.
  bump.value = Date.now()

  // And similarly naive signin.  This helps with some password managers which don't trigger events properly.
  nativeBump.value++

  if (showModal.value) {
    bumpTimer = setTimeout(bumpIt, 500)
  }
}

function show() {
  pleaseShowModal.value = true
  nativeLoginError.value = null
  socialLoginError.value = null
  buttonClicked.value = false

  setTimeout(() => {
    timerElapsed.value = true
  }, 3000)

  bumpIt()
}

function hide() {
  pleaseShowModal.value = false
}

function gtmRegister() {
  if (gtm?.enabled()) {
    gtm.trackEvent({
      event: 'Register with Website',
      label: 'EcEMCPvav7kZELy618UD',
    })
  }
}

function loginNative(e) {
  loginType.value = 'Freegle'

  if (signUp.value) {
    api.bandit.chosen({
      uid: 'signUpModal',
      variant: 'native',
    })
  }

  nativeLoginError.value = null
  socialLoginError.value = null
  buttonClicked.value = true
  e.preventDefault()
  e.stopPropagation()

  // Probably this is someone who is already a user and is trying to log in, but has cleared their cache
  // (so we've forgotten that they've previously signed in) and hasn't noticed that they need to switch.
  const confused = !fullname.value && email.value && password.value

  if (!confused && signUp.value) {
    if (!fullname.value || emailError.value || !password.value) {
      nativeLoginError.value = 'Please fill out the form.'
    } else {
      gtmRegister()

      authStore
        .signUp({
          fullname: fullname.value,
          email: email.value,
          password: password.value,
        })
        .then(async () => {
          // We are now logged in. Prompt the browser to remember the credentials.
          if (window.PasswordCredential) {
            try {
              const c = new window.PasswordCredential(e.target)
              navigator.credentials
                .store(c)
                .then(function () {
                  pleaseShowModal.value = false
                })
                .catch((err) => {
                  console.error('Failed to save credentials', err)
                })
            } catch (e) {
              pleaseShowModal.value = false
            }
          } else {
            pleaseShowModal.value = false
          }

          // Pick up the new user
          await authStore.fetchUser()

          if (route.path === '/' || !route.path) {
            // We've signed up from the home page.  Send them to the explore page to find a group.
            router.push('/explore')
          }
        })
        .catch((e) => {
          console.log('Signup failed', e)
          if (e instanceof SignUpError) {
            console.log('Login error')
            nativeLoginError.value = e.status
          } else {
            throw e // let others bubble up
          }
        })
    }
  } else if (emailError.value || passwordError.value) {
    nativeLoginError.value = 'Please fill out the form.'
  } else {
    // Login
    authStore
      .login({
        email: email.value,
        password: password.value,
      })
      .then(() => {
        // We are now logged in. Prompt the browser to remember the credentials.
        if (window.PasswordCredential) {
          try {
            // We used to pass in the DOM element, but in Chrome 92 that causes a crash.
            const c = new window.PasswordCredential({
              id: email.value,
              password: password.value,
            })
            navigator.credentials
              .store(c)
              .then(function () {
                pleaseShowModal.value = false
              })
              .catch((err) => {
                console.error('Failed to save credentials', err)
              })
          } catch (e) {
            console.log('Failed to save credentials2', e)
            pleaseShowModal.value = false
          }
        } else {
          pleaseShowModal.value = false
        }
      })
      .catch((e) => {
        console.log('Login failed', e)
        if (e instanceof LoginError) {
          console.log('Login error')
          nativeLoginError.value = e.status
        } else {
          throw e // let others bubble up
        }
      })
  }
}

async function loginFacebook() {
  loginType.value = 'Facebook'

  if (signUp.value) {
    await api.bandit.chosen({
      uid: 'signUpModal',
      variant: 'facebook',
    })
  }

  nativeLoginError.value = null
  socialLoginError.value = null
  try {
    let response = null
    const promise = new Promise(function (resolve) {
      window.FB.login(
        function (ret) {
          response = ret
          resolve()
        },
        { scope: 'email' }
      )
    })

    await promise
    if (response.authResponse) {
      const accessToken = response.authResponse.accessToken

      await authStore.login({
        fblogin: 1,
        fbaccesstoken: accessToken,
      })

      // We are now logged in.
      pleaseShowModal.value = false
    } else {
      socialLoginError.value =
        'Facebook response is unexpected.  Please try later.'
    }
  } catch (e) {
    socialLoginError.value = 'Facebook login error: ' + e.message
  }
}

async function handleGoogleCredentialsResponse(response) {
  console.log('Google login', response)
  loginType.value = 'Google'
  nativeLoginError.value = null
  socialLoginError.value = null
  if (response?.credential) {
    console.log('Signed in')

    if (signUp.value) {
      await api.bandit.chosen({
        uid: 'signUpModal',
        variant: 'google',
      })
    }

    try {
      await authStore.login({
        googlejwt: response.credential,
        googlelogin: true,
      })

      // We are now logged in.
      console.log('Logged in')
      pleaseShowModal.value = false
    } catch (e) {
      socialLoginError.value = 'Google login failed: ' + e.message
    }
  } else if (response?.error && response.error !== 'immediate_failed') {
    socialLoginError.value = 'Google login failed: ' + response.error
  }
}

async function loginYahoo() {
  loginType.value = 'Yahoo'

  if (signUp.value) {
    await api.bandit.chosen({
      uid: 'signUpModal',
      variant: 'yahoo',
    })
  }

  // Sadly Yahoo doesn't support a Javascript-only OAuth flow, so far as I can tell.  So what we do is
  // redirect to Yahoo, which returns back to us with a code parameter, which we then pass to the server
  // to complete the signin.  This replaces the old flow which stopped working in Jan 2020.
  nativeLoginError.value = null
  socialLoginError.value = null

  const url =
    'https://api.login.yahoo.com/oauth2/request_auth?client_id=' +
    runtimeConfig.public.YAHOO_CLIENTID +
    '&redirect_uri=' +
    encodeURIComponent(
      window.location.protocol +
        '//' +
        window.location.hostname +
        (window.location.port ? ':' + window.location.port : '') +
        '/yahoologin?returnto=' +
        route.fullPath
    ) +
    '&response_type=code&language=en-us&scope=sdpp-w'

  window.location = url
}

function clickShowSignUp(e) {
  showSignUp.value = true
  forceSignIn.value = false
  e.preventDefault()
  e.stopPropagation()
}

function clickShowSignIn(e) {
  showSignUp.value = false
  forceSignIn.value = true
  e.preventDefault()
  e.stopPropagation()

  api.bandit.chosen({
    uid: 'signUpModal',
    variant: 'signin',
  })
}

function forgot() {
  hide()
  forceLogin.value = false
  router.push('/forgot')
}

function installGoogleSDK() {
  if (
    window &&
    window.google &&
    window.google.accounts &&
    window.google.accounts.id
  ) {
    console.log('Install google SDK')
    // Google client library should be loaded by default.vue.
    window.google.accounts.id.initialize({
      client_id: clientId.value,
      callback: handleGoogleCredentialsResponse,
    })
    console.log(
      'Render google button',
      document.getElementById('googleLoginButton')
    )

    console.log('Found google button ref')
    window.google.accounts.id.renderButton(
      document.getElementById('googleLoginButton'),
      { theme: 'outline', size: 'large', width: '300px' }
    )
  } else {
    console.log('Google not yet fully loaded')
  }
}

function installFacebookSDK() {
  if (typeof window.FB === 'undefined') {
    console.log('Need to install Facebook SDK')
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: runtimeConfig.public.FACEBOOK_APPID,
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v4.0',
      })
      window.FB.AppEvents.logPageView()

      // We need to have some special code for IE11 - see https://stackoverflow.com/questions/27176983/dispatchevent-not-working-in-ie11.
      let event

      if (typeof Event === 'function') {
        event = new Event('fb-sdk-ready')
      } else {
        event = document.createEvent('Event')
        event.initEvent('fb-sdk-ready', true, true)
      }
    }
    ;(function (d, s, id) {
      setTimeout(() => {
        try {
          const fjs = d.getElementsByTagName(s)[0]
          if (d.getElementById(id)) {
            return
          }

          const js = d.createElement(s)
          js.id = id
          js.src = '//connect.facebook.net/en_US/sdk.js'
          fjs.parentNode.insertBefore(js, fjs)
        } catch (e) {
          console.error('Failed to load Facebook SDK', e)
        }
      }, 1000)
    })(document, 'script', 'facebook-jssdk')

    console.log('Installed FB SDK, bump')
    bumpIt()
  } else {
    console.log('FB SDK already loaded')
  }
}

// Watchers
watch(
  showModal,
  (newVal) => {
    pleaseShowModal.value = newVal

    if (newVal) {
      if (!initialisedSocialLogin.value) {
        // We only use the Google and Facebook SDKs in login, so we can install them here in the modal.  This means we
        // don't load the scripts for every page.
        installFacebookSDK()
        initialisedSocialLogin.value = true
      }

      // Need to install Google every time to get the button rendered.
      installGoogleSDK()
    }
  },
  { immediate: true }
)

watch(
  pleaseShowModal,
  (newVal) => {
    showModal.value = newVal || forceLogin.value
  },
  { immediate: true }
)

watch(
  forceLogin,
  (newVal) => {
    console.log('Force login changed to ' + newVal)
    showModal.value = pleaseShowModal.value || newVal
  },
  { immediate: true }
)

watch(me, (newVal) => {
  // Need to do this when we log out to get the signin button rendered on the login modal.
  if (!newVal) {
    nextTick(() => {
      installGoogleSDK()
    })
  }
})

watch(formFields, () => {
  // reset form validation once any of the fields changes its value
  nativeLoginError.value = null
  buttonClicked.value = false
})

watch(
  signUp,
  (newVal) => {
    if (newVal) {
      api.bandit.shown({
        uid: 'signUpModal',
        variant: 'facebook',
      })
      api.bandit.shown({
        uid: 'signUpModal',
        variant: 'google',
      })
      api.bandit.shown({
        uid: 'signUpModal',
        variant: 'yahoo',
      })
      api.bandit.shown({
        uid: 'signUpModal',
        variant: 'native',
      })
      api.bandit.shown({
        uid: 'signUpModal',
        variant: 'signin',
      })
    }
  },
  { immediate: true }
)

// Lifecycle hooks
onBeforeUnmount(() => {
  if (bumpTimer) {
    clearTimeout(bumpTimer)
    bumpTimer = null
  }
})

// Expose methods to parent components
defineExpose({
  show,
  hide,
  tryLater,
})
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

$color-facebook: #4267b2;
$color-google: #4285f4;
$color-yahoo: #6b0094;

.signin__section--social {
  flex: 0 1 auto;

  @include media-breakpoint-up(lg) {
    flex: 0 1 37%;
  }
}

.signin__section--freegle {
  flex: 0 1 auto;

  @include media-breakpoint-up(lg) {
    flex: 0 1 44%;
  }
}

.social-button {
  display: flex;
  align-items: center;
  min-width: 315px;
  border-radius: 3px;
  padding: 0;
  margin: 0 auto 20px;
  color: $color-white;

  @include media-breakpoint-up(lg) {
    margin: 0 0 20px;
  }
}

.social-button:disabled {
  opacity: 0.2;
}

.social-button__image {
  width: 46px;
  height: 46px;
  background-color: $color-white;
}

.social-button--facebook {
  border: 2px solid $color-facebook;
  background-color: $color-facebook;
  width: 100%;
}

.social-button--google {
  border: 2px solid $color-google;
  background-color: $color-white;
  width: 100%;
  min-height: 47px;
}

:deep(.social-button--google > div) {
  width: 100%;
}

.social-button--yahoo {
  border: 2px solid $color-yahoo;
  background-color: $color-yahoo;
  width: 100%;
}

.divider__wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  @include media-breakpoint-up(lg) {
    flex-direction: column;
    margin-bottom: 0;
    flex-grow: 1;
  }
}

.divider {
  border-right: none;
  border-bottom: 1px solid $color-gray--light;
  width: 100%;

  @include media-breakpoint-up(lg) {
    border-right: 1px solid $color-gray--light;
    border-bottom: none;
    height: 100%;
    width: auto;
  }
}

.divider__text {
  margin: 0 7px 0 7px;
  color: $color-gray--base;
  font-size: 0.8rem;

  @include media-breakpoint-up(lg) {
    margin: 7px 0 7px 0;
  }
}

:deep(.link a) {
  text-decoration: none !important;
}

:deep(.is-invalid label) {
  color: unset;
}

$color-facebook: #4267b2;
$color-google: #4285f4;
$color-yahoo: #6b0094;

.signin__section--social {
  flex: 0 1 auto;

  @include media-breakpoint-up(lg) {
    flex: 0 1 37%;
  }
}

.signin__section--freegle {
  flex: 0 1 auto;

  @include media-breakpoint-up(lg) {
    flex: 0 1 44%;
  }
}

.social-button {
  display: flex;
  align-items: center;
  min-width: 315px;
  border-radius: 3px;
  padding: 0;
  margin: 0 auto 20px;
  color: $color-white;

  @include media-breakpoint-up(lg) {
    margin: 0 0 20px;
  }
}

.social-button:disabled {
  opacity: 0.2;
}

.social-button__image {
  width: 46px;
  height: 46px;
  background-color: $color-white;
}

.social-button--facebook {
  border: 2px solid $color-facebook;
  background-color: $color-facebook;
  width: 100%;
}

.social-button--google {
  border: 2px solid $color-google;
  background-color: $color-white;
  width: 100%;
  min-height: 47px;
}

:deep(.social-button--google > div) {
  width: 100%;
}

.social-button--yahoo {
  border: 2px solid $color-yahoo;
  background-color: $color-yahoo;
  width: 100%;
}

.divider__wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  @include media-breakpoint-up(lg) {
    flex-direction: column;
    margin-bottom: 0;
    flex-grow: 1;
  }
}

.divider {
  border-right: none;
  border-bottom: 1px solid $color-gray--light;
  width: 100%;

  @include media-breakpoint-up(lg) {
    border-right: 1px solid $color-gray--light;
    border-bottom: none;
    height: 100%;
    width: auto;
  }
}

.divider__text {
  margin: 0 7px 0 7px;
  color: $color-gray--base;
  font-size: 0.8rem;

  @include media-breakpoint-up(lg) {
    margin: 7px 0 7px 0;
  }
}

:deep(.link a) {
  text-decoration: none !important;
}

:deep(.is-invalid label) {
  color: unset;
}

.marketing-consent-container {
  border-top: 1px solid $color-gray--light;
}

.marketing-consent-checkbox :deep(label) {
  font-size: 0.875rem;
  font-weight: normal !important;
  line-height: 1.4;
  display: flex;
  align-items: flex-start;
  width: 100%;
}

.marketing-consent-checkbox :deep(input[type='checkbox']) {
  margin-top: 0.125rem;
  margin-right: 0.5rem;
  flex-shrink: 0;
}
</style>
