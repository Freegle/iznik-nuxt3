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
    <template #title>
      <div class="signin-header">
        <span class="signin-title">
          {{ signUp ? 'Create account' : 'Log in' }}
        </span>
        <span class="signin-switch">
          <a v-if="signUp" href="#" @click.prevent="clickShowSignIn">Log in</a
          ><a v-else href="#" @click.prevent="clickShowSignUp"
            >Create account</a
          >
        </span>
      </div>
    </template>
    <p v-if="loginType" class="text-center text-muted small mb-2">
      You usually use {{ loginType }}
    </p>
    <div class="signin-container">
      <div class="signin__section--social">
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
        <b-button
          v-if="isiOS"
          class="social-button social-button--apple"
          :disabled="appleDisabled"
          @click="loginAppleApp"
        >
          <b-img
            src="signinbuttons/Apple_logo_white.svg"
            class="social-button__image"
          />
          <span class="p-2 social-button__text font-weight-bold"
            >Sign in with Apple</span
          >
        </b-button>
        <b-button
          v-if="isApp"
          class="social-button social-button--google-app"
          @click="loginGoogleApp"
        >
          <b-img
            src="/signinbuttons/google-logo.svg"
            class="social-button__image"
          />
          <span class="p-2 text--medium font-weight-bold"
            >Continue with Google</span
          >
        </b-button>
        <div
          v-else
          id="googleLoginButton"
          ref="googleLoginButton"
          class="social-button social-button--google clickme"
        />
        <notice-message v-if="socialblocked" variant="warning" class="mt-2">
          Social sign in blocked - check your ad blocker settings.
        </notice-message>
        <b-alert v-if="loginWaitMessage" variant="warning" :model-value="true">
          {{ loginWaitMessage }}
        </b-alert>
        <b-alert v-if="socialLoginError" variant="danger" :model-value="true">
          {{ socialLoginError }}
        </b-alert>
      </div>
      <div class="divider__wrapper">
        <span class="divider" />
        <span class="divider__text">OR</span>
        <span class="divider" />
      </div>
      <div class="signin__section--freegle">
        <b-form
          id="loginform"
          ref="form"
          action="/"
          autocomplete="on"
          method="post"
          @submit="loginNative"
        >
          <b-form-group
            v-if="signUp"
            label="Your name"
            label-for="fullname"
            class="mb-2"
          >
            <b-form-input
              id="fullname"
              v-model="fullname"
              name="fullname"
              :class="{ 'border-danger': fullNameError }"
              autocomplete="name"
              placeholder="Your name"
            />
          </b-form-group>
          <EmailValidator
            v-model:email="email"
            v-model:valid="emailValid"
            size="md"
            :input-class="emailError ? 'border-danger' : ''"
          />
          <NoticeMessage v-if="referToGoogleButton" class="mb-2">
            Tip: Use <em>Continue with Google</em> above instead.
          </NoticeMessage>
          <PasswordEntry
            v-model="password"
            :original-password="password"
            :error-border="passwordError"
            :placeholder="signUp ? 'Choose password' : 'Password'"
          />
          <b-button
            variant="primary"
            class="w-100 mt-2"
            type="submit"
            value="login"
          >
            {{ signUp ? 'Create account' : 'Log in' }}
          </b-button>
          <b-alert
            v-if="nativeLoginError"
            variant="danger"
            :model-value="true"
            class="mt-2 mb-0"
          >
            {{ nativeLoginError }}
          </b-alert>
        </b-form>
        <div v-if="!signUp" class="text-center mt-2">
          <a href="#" class="small text-muted" @click.prevent="forgot">
            Forgot password?
          </a>
        </div>
      </div>
    </div>
    <div class="signin-footer">
      <b-form-checkbox
        id="marketingConsent"
        v-model="marketingConsent"
        name="marketingConsent"
        class="small"
      >
        We'll keep in touch by email about what's happening and other ways to
        support Freegle.
      </b-form-checkbox>
      <p v-if="signUp" class="small text-muted mt-2 mb-0 text-center">
        Signing up accepts our
        <nuxt-link no-prefetch to="/terms" target="_blank">Terms</nuxt-link>
        and
        <nuxt-link no-prefetch to="/privacy" target="_blank"
          >Privacy Policy</nuxt-link
        >.
      </p>
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
import { SocialLogin } from '@capgo/capacitor-social-login'
import { SignInWithApple } from '@capacitor-community/apple-sign-in'
import EmailValidator from './EmailValidator'
import { LoginError, SignUpError } from '~/api/BaseAPI'
import { useRuntimeConfig } from '#app'
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { useMe } from '~/composables/useMe'
import Api from '~/api'
import { useMobileStore } from '@/stores/mobile' // APP

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
const mobileStore = useMobileStore()

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
const loginWaitMessage = ref(null) // APP

// Store refs
const { loggedInEver } = storeToRefs(authStore)
const { loginType, forceLogin } = storeToRefs(authStore)

// Computed
const clientId = computed(() => {
  return runtimeConfig.public.GOOGLE_CLIENT_ID
})

const isApp = ref(mobileStore.isApp) // APP

const isiOS = ref(mobileStore.isiOS) // APP

const facebookDisabled = computed(() => {
  if (isApp.value) return false
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

const appleDisabled = computed(() => {
  // APP
  if (!isiOS.value) return true
  return parseFloat(mobileStore.osVersion) < 13
})

const socialblocked = computed(() => {
  const googleActuallyDisabled = isApp.value ? false : googleDisabled.value // APP
  const ret =
    bump.value &&
    initialisedSocialLogin.value &&
    (facebookDisabled.value || googleActuallyDisabled) &&
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

const fullNameError = computed(() => {
  return nativeBump.value && buttonClicked.value && !fullname.value
})

const formFields = computed(() => {
  return [fullname.value, email.value, password.value, marketingConsent.value]
})

const emailError = computed(() => {
  return (
    nativeBump.value && buttonClicked.value && !email.value // Only show error if email is truly empty
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
  loginWaitMessage.value = null
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
  loginWaitMessage.value = null
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
  loginWaitMessage.value = null
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
  } else if (email.value && password.value && !emailValid.value) {
    // Email validation may still be in progress - attempt login anyway
    // If the email is invalid, the server will reject it
    console.log('Attempting login with potentially unvalidated email')
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
              .catch(function (e) {
                console.log('Failed to store credentials', e)
                pleaseShowModal.value = false
              })
          } catch (e) {
            console.log('Error setting up credential storage', e)
            pleaseShowModal.value = false
          }
        } else {
          pleaseShowModal.value = false
        }
      })
      .catch((e) => {
        console.log('Login error', e)
        if (e instanceof LoginError) {
          // Check if login failed due to email issues
          if (e.status.includes('email') || e.status.includes('Email')) {
            nativeLoginError.value = 'Please enter a valid email address.'
          } else {
            nativeLoginError.value = e.status
          }
        } else {
          throw e // let others bubble up
        }
      })
  } else {
    // Login
    loginWaitMessage.value = 'Please wait...'
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
        loginWaitMessage.value = null
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
  loginWaitMessage.value = null

  // App: https://github.com/capacitor-community/facebook-login

  if (isApp.value) {
    // APP
    console.log('Facebook app start')

    try {
      const loginOptions = {
        provider: 'facebook',
        options: {
          permissions: [
            'email',
            // 'public_profile'
            // 'user_birthday',
            // 'user_photos',
            // 'user_gender',
          ],
        },
      }
      if (isiOS.value) loginOptions.options.limitedLogin = true
      const response = await SocialLogin.login(loginOptions)
      // console.log("Facebook response", response)
      let accessToken = false
      if (response && response.result) {
        accessToken = response.result.accessToken.token
        if (isiOS.value) accessToken = response.result.idToken
      }
      if (accessToken) {
        // console.log("accessToken", accessToken)
        // Login successful.
        loginWaitMessage.value = 'Please wait...'
        await authStore.login({
          fblogin: 1,
          fbaccesstoken: accessToken,
          fblimited: isiOS.value,
        })
        // We are now logged in.
        self.pleaseShowModal = false
      } else {
        socialLoginError.value = 'Facebook app login failed'
      }
    } catch (e) {
      socialLoginError.value = 'Facebook app login error: ' + e.message
    }
    loginWaitMessage.value = null
    return
  }

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

function loginAppleApp() {
  if (signUp.value) {
    api.bandit.chosen({
      uid: 'signUpModal',
      variant: 'apple',
    })
  }
  // https://github.com/capacitor-community/apple-sign-in
  socialLoginError.value = null
  loginWaitMessage.value = null
  try {
    console.log('loginAppleApp')
    const options = { scopes: 'email name' }

    SignInWithApple.authorize(options)
      .then(async (result) => {
        // Sign in using token at server
        if (result.response.identityToken) {
          // identityToken, user, etc
          loginWaitMessage.value = 'Please wait...'
          await authStore.login({
            applecredentials: result.response,
            applelogin: true,
          })
          // We are now logged in.
          self.pleaseShowModal = false
        } else {
          socialLoginError.value = 'No identityToken given'
          loginWaitMessage.value = null
        }
      })
      .catch((e) => {
        if (e.message.includes('1001')) {
          socialLoginError.value = 'Apple login cancelled'
        } else {
          socialLoginError.value = e.message
        }
        loginWaitMessage.value = null
      })
  } catch (e) {
    console.log('Apple login error: ', e)
    socialLoginError.value = 'Apple login error: ' + e.message
  }
}

async function loginGoogleApp() {
  // https://github.com/Cap-go/capacitor-social-login
  try {
    console.log('loginGoogleApp')
    const response = await SocialLogin.login({
      provider: 'google',
      options: {
        scopes: ['email'],
        forceRefreshToken: true, // Android: if you need refresh token
        forcePrompt: true, // iOS: Force account selection prompt
      },
    })
    // console.log(response)
    if (response.result && response.result.idToken) {
      loginWaitMessage.value = 'Please wait...'
      await authStore.login({
        googlejwt: response.result.idToken,
        googlelogin: true,
      })
      // We are now logged in.
      console.log('Logged in')
      self.pleaseShowModal = false
    } else {
      socialLoginError.value = 'Google: no result.idToken found'
    }
    loginWaitMessage.value = null
  } catch (e) {
    console.log('Google login error: ', e)
    socialLoginError.value = 'Google login error: ' + e.message
  }
  loginWaitMessage.value = null
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

async function initializeAppSocialLogins() {
  console.log('APP: Set up SocialLogin for google and facebook')
  const initGoogleParams = {
    webClientId: clientId.value, // Use Web Client ID for all platforms
    iOSClientId: runtimeConfig.public.GOOGLE_IOS_CLIENT_ID, // for iOS
    iOSServerClientId: clientId.value, // the iOS server client id (required in mode offline)
    // mode: 'offline' // replaces grantOfflineAccess
  }
  /* if( isiOS.value) {
    initGoogleParams.iOSClientId = runtimeConfig.public.GOOGLE_IOS_CLIENT_ID // for iOS
    initGoogleParams.webClientId = clientId.value // Use Web Client ID for all platforms
    initGoogleParams.iOSServerClientId = clientId.value
  }
  else {
    initGoogleParams.webClientId = clientId.value // Use Web Client ID for all platforms
  } */
  await SocialLogin.initialize({
    google: initGoogleParams,
    facebook: {
      appId: runtimeConfig.public.FACEBOOK_APPID,
      clientToken: runtimeConfig.public.FACEBOOK_CLIENTID,
    },
  })
}

// Watchers
watch(
  showModal,
  (newVal) => {
    loginWaitMessage.value = null
    pleaseShowModal.value = newVal

    if (newVal) {
      if (isApp.value) {
        // APP
        initializeAppSocialLogins()
        return
      }
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
    loginWaitMessage.value = null
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
$color-apple: #000000;

.signin-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  width: 100%;
}

.signin-title {
  font-size: 1.25rem;
  font-weight: 600;
}

.signin-switch {
  font-size: 0.875rem;
  font-weight: normal;
  color: $color-gray--dark;

  a {
    color: $color-blue--base;
  }
}

.signin-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.5rem 0;

  @include media-breakpoint-up(lg) {
    flex-direction: row;
    padding: 1rem 0;
  }
}

.signin__section--social,
.signin__section--freegle {
  flex: 1;
}

.section-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.social-button {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0;
  margin-bottom: 0.5rem;
  color: $color-white;
}

.social-button:disabled {
  opacity: 0.2;
}

.social-button__image {
  width: 40px;
  height: 40px;
  background-color: $color-white;
}

.social-button--facebook {
  border: 1px solid $color-facebook;
  background-color: $color-facebook;
}

.social-button--apple {
  border: 1px solid $color-apple;
  background-color: $color-apple;
}

.social-button--apple .social-button__image {
  width: 40px;
  height: 40px;
  background-color: $color-black;
}

.social-button--google {
  border: 1px solid $color-gray--light;
  background-color: $color-white;
  min-height: 42px;
}

.social-button--google-app {
  border: 1px solid $color-gray--light;
  background-color: #fff;
  color: #3c4043;
}

:deep(.social-button--google > div) {
  width: 100%;
}

.divider__wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0.25rem 0;

  @include media-breakpoint-up(lg) {
    flex-direction: column;
    margin: 0 1rem;
  }
}

.divider {
  flex: 1;
  height: 1px;
  background: $color-gray--light;

  @include media-breakpoint-up(lg) {
    width: 1px;
    height: auto;
    flex: 1;
  }
}

.divider__text {
  color: $color-gray--base;
  font-size: 0.75rem;
}

.signin-footer {
  border-top: 1px solid $color-gray--light;
  padding-top: 0.75rem;
  margin-top: 0.5rem;

  :deep(label) {
    font-weight: normal !important;
  }
}

:deep(.link a) {
  text-decoration: none !important;
}

:deep(.is-invalid label) {
  color: unset;
}
</style>

<style lang="scss">
.verytop .modal-header {
  padding: 0.5rem;
}

.verytop .modal-title {
  width: 100%;
}
</style>
