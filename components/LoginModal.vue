<template>
  <b-modal
    v-if="!loggedIn"
    id="loginModal"
    ref="loginModal"
    v-model="showModal"
    size="lg"
    no-close-on-backdrop
    :hide-header-close="forceLogin"
    :no-close-on-esc="forceLogin"
    class="hide-footer"
  >
    <!-- This is required as the default bootstrap component makes the main title an h5 -->
    <template #title>
      <h2>Let's get freegling!</h2>
    </template>
    <p v-if="signUp" class="text-center">
      You'll get emails. Name, approximate location, and profile picture are
      public - you can hide your real name and picture from Settings. Logging in
      adds cookies and local storage. Read
      <nuxt-link target="_blank" to="/terms">Terms of Use</nuxt-link> and
      <nuxt-link target="_blank" to="/privacy">Privacy</nuxt-link> for details.
      Ok? Now come on in...
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
        <b-button v-if="isiOSapp" 
          class="social-button social-button--apple" :disabled="appleDisabled" 
          @click="loginApple"
        >
          <b-img src="signinbuttons/Apple_logo_white.svg" class="social-button__image" />
          <span class="p-2 social-button__text font-weight-bold">Sign in with Apple</span>
        </b-button>
        <b-button v-if="isApp"
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
        <div v-if="!isApp"
          id="googleLoginButton"
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
        <b-alert v-if="loginWaitMessage" variant="warning" :modelValue="true">
          {{ loginWaitMessage }}
        </b-alert>
        <b-alert v-if="socialLoginError" variant="danger" :modelValue="true">
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
            <b-form-group
              id="firstnameGroup"
              label="First name"
              label-for="firstname"
            >
              <b-form-input
                id="firstname"
                ref="firstname"
                v-model="firstname"
                name="firstname"
                class="mb-3"
                autocomplete="given-name"
                placeholder="Your first name"
              />
            </b-form-group>
            <b-form-group
              id="lastnameGroup"
              label="Last name"
              label-for="lastname"
            >
              <b-form-input
                id="lastname"
                ref="lastname"
                v-model="lastname"
                name="lastname"
                class="mb-3"
                autocomplete="family-name"
                placeholder="Your last or family name"
              />
            </b-form-group>
          </div>
          <EmailValidator
            ref="email"
            v-model:email="email"
            v-model:valid="emailValid"
            size="md"
            label="Your email address"
          />
          <NoticeMessage v-if="referToGoogleButton">
            Please use the <em>Continue with Google</em> button to log in. That
            way you don't need to remember a password on this site.
          </NoticeMessage>
          <NoticeMessage v-if="referToYahooButton">
            Please use the <em>Continue with Yahoo</em> button to log in. That
            way you don't need to remember a password on this site.
          </NoticeMessage>
          <PasswordEntry v-model="password" :original-password="password" />
          <b-button
            v-b-modal.add
            block
            size="lg"
            variant="primary"
            class="mb-2 mt-2 w-100"
            type="submit"
            value="login"
            :disabled="nativeDisabled"
          >
            <span v-if="!signUp"> Log in to Freegle </span>
            <span v-else> Register on Freegle </span>
          </b-button>
          <!--          TODO Login modal not showing - see Slack from Chris-->
          <b-alert v-if="nativeLoginError" variant="danger" :modelValue="true">
            Login Failed: {{ nativeLoginError }}
          </b-alert>
          <div v-if="!signUp" class="text-center">
            <nuxt-link to="/forgot" class="nodecor" @click.native="forgot">
              I forgot my password
            </nuxt-link>
            <p class="mb-0 text-center">
              <b-button
                variant="link"
                class="pl-1 pr-0 py-0 border-0 align-top"
                @click="clickShowSignUp"
              >
                New freegler? Register
              </b-button>
            </p>
          </div>
          <p v-if="signUp" class="text-center font-weight-bold">
            <b-button
              variant="link"
              class="font-weight-bold pl-1 py-0 border-0 align-top"
              @click="clickShowSignIn"
            >
              Already a freegler? Log in
            </b-button>
          </p>
        </b-form>
      </div>
    </div>
  </b-modal>
</template>
<script>
import { mapState, mapWritableState } from 'pinia'
import { LoginError, SignUpError } from '../api/BaseAPI'
import EmailValidator from './EmailValidator'
import { useAuthStore } from '~/stores/auth'
import { useMobileStore } from '@/stores/mobile'
import me from '~/mixins/me.js'
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth'
import { SignInWithApple } from '@capacitor-community/apple-sign-in'
import { FacebookLogin } from '@capacitor-community/facebook-login'
import { appYahooLogin } from '../composables/app-yahoo'

const NoticeMessage = () => import('~/components/NoticeMessage')
const PasswordEntry = () => import('~/components/PasswordEntry')

export default {
  name: 'LoginModal',
  components: {
    EmailValidator,
    NoticeMessage,
    PasswordEntry,
  },
  mixins: [me],
  setup() {
    const authStore = useAuthStore()
    const runtimeConfig = useRuntimeConfig()

    return {
      authStore,
      runtimeConfig,
    }
  },
  data() {
    return {
      bump: Date.now(),
      firstname: null,
      lastname: null,
      email: null,
      emailValid: false,
      password: null,
      showModal: false,
      pleaseShowModal: false,
      showSignUp: false,
      forceSignIn: false,
      nativeLoginError: null,
      socialLoginError: null,
      loginWaitMessage: null,
      showPassword: false,
      initialisedSocialLogin: false,
      showSocialLoginBlocked: false,
      nativeBump: 1,
      timerElapsed: false,
    }
  },
  computed: {
    clientId() {
      return this.runtimeConfig.public.GOOGLE_CLIENT_ID
    },
    facebookDisabled() {
      if( this.isApp) return false
      return (
        this.bump &&
        (this.showSocialLoginBlocked || typeof window.FB === 'undefined')
      )
    },
    appleDisabled() {
      if( !this.isiOS) return true
      return parseFloat(mobileStore.osVersion) < 13
    },
    googleDisabled() {
      return (
        this.bump &&
        this.showSocialLoginBlocked &&
        (!window || !window.google || !window.google.accounts)
      )
    },
    yahooDisabled() {
      // Yahoo currently can't be disabled, because it's redirect auth flow rather than load of a JS toolkit.
      return false
    },
    socialblocked() {
      const googleActuallyDisabled = this.isApp ? false : this.googleDisabled
      const ret =
        this.bump &&
        this.initialisedSocialLogin &&
        (this.facebookDisabled || googleActuallyDisabled || this.yahooDisabled) &&
        this.timerElapsed
      return ret
    },
    ...mapState(useAuthStore, ['loggedInEver']),
    ...mapWritableState(useAuthStore, ['loginType', 'forceLogin']),
    signUp() {
      if (this.forceSignIn) {
        return false
      } else {
        return !this.loggedInEver || this.showSignUp
      }
    },
    referToGoogleButton() {
      return (
        this.email &&
        (this.email.toLowerCase().includes('gmail') ||
          this.email.toLowerCase().includes('googlemail'))
      )
    },
    referToYahooButton() {
      return this.email && this.email.toLowerCase().includes('yahoo')
    },
    nativeDisabled() {
      return this.nativeBump && (!this.emailValid || !this.password)
    },
    isApp() {
      const mobileStore = useMobileStore()
      return mobileStore.isApp
    },
    isiOSapp() {
      const mobileStore = useMobileStore()
      return mobileStore.isiOS
    }
  },
  watch: {
    showModal: {
      immediate: true,
      handler(newVal) {
        this.loginWaitMessage = null
        this.pleaseShowModal = newVal

        if (newVal) {
          if (!this.initialisedSocialLogin) {
            // We only use the Google and Facebook SDKs in login, so we can install them here in the modal.  This means we
            // don't load the scripts for every page.
            if( !this.isApp){
              this.installFacebookSDK()
            }
            this.initialisedSocialLogin = true
          }

          // Need to install Google every time to get the button rendered.
          this.installGoogleSDK()
        }
      },
    },
    pleaseShowModal: {
      immediate: true,
      handler(newVal) {
        this.showModal = newVal || this.forceLogin
      },
    },
    forceLogin: {
      immediate: true,
      handler(newVal) {
        this.loginWaitMessage = null
        this.showModal = this.pleaseShowModal || newVal
      },
    },
    me(newVal) {
      // Need to do this when we log out to get the signin button rendered on the login modal.
      if (!newVal) {
        this.$nextTick(() => {
          this.installGoogleSDK()
        })
      }
    },
  },
  beforeDestroy() {
    if (this.bumpTimer) {
      clearTimeout(this.bumpTimer)
      this.bumpTimer = null
    }
  },
  methods: {
    tryLater(native) {
      if (native) {
        this.nativeLoginError = 'Something went wrong; please try later.'
      } else {
        this.socialLoginError = 'Something went wrong; please try later.'
      }
      this.loginWaitMessage = null
    },
    bumpIt() {
      // Force reconsideration of social signin disabled.  Need to do that regularly in case the SDKs haven't loaded
      // by the time we open the modal.
      this.bump = Date.now()

      // And similarly naive signin.  This helps with some password managers which don't trigger events properly.
      this.nativeBump++

      if (this.showModal) {
        this.bumpTimer = setTimeout(this.bumpIt, 500)
      }
    },
    show() {
      console.log('show modal')
      this.pleaseShowModal = true
      this.nativeLoginError = null
      this.socialLoginError = null
      this.loginWaitMessage = null

      setTimeout(() => {
        this.timerElapsed = true
      }, 3000)

      this.bumpIt()
    },
    hide() {
      this.pleaseShowModal = false
    },
    loginNative(e) {
      this.loginType = 'Freegle'

      const self = this
      this.nativeLoginError = null
      this.socialLoginError = null
      this.loginWaitMessage = null
      e.preventDefault()
      e.stopPropagation()

      // Probably this is someone who is already a user and is trying to log in, but has cleared their cache
      // (so we've forgotten that they've previously signed in) and hasn't noticed that they need to switch.
      const confused =
        !this.firstname && !this.lastname && this.email && this.password

      if (!confused && this.signUp) {
        if (
          !this.firstname ||
          !this.lastname ||
          !this.email ||
          !this.password
        ) {
          this.nativeLoginError = 'Please fill out the form.'
        } else {
          this.authStore
            .signUp({
              firstname: this.firstname,
              lastname: this.lastname,
              email: this.email,
              password: this.password,
            })
            .then(async () => {
              // We are now logged in. Prompt the browser to remember the credentials.
              if (window.PasswordCredential) {
                try {
                  const c = new window.PasswordCredential(e.target)
                  navigator.credentials
                    .store(c)
                    .then(function () {
                      self.pleaseShowModal = false
                    })
                    .catch((err) => {
                      console.error('Failed to save credentials', err)
                    })
                } catch (e) {
                  self.pleaseShowModal = false
                }
              } else {
                self.pleaseShowModal = false
              }

              // Pick up the new user
              await this.authStore.fetchUser()

              if (this.$route.path === '/' || !this.$route.path) {
                // We've signed up from the home page.  Send them to the explore page to find a group.
                this.$router.push('/explore')
              }
            })
            .catch((e) => {
              console.log('Signup failed', e)
              if (e instanceof SignUpError) {
                console.log('Login error')
                this.nativeLoginError = e.status
              } else {
                throw e // let others bubble up
              }
            })
        }
      } else if (this.email && this.password) {
        // Login
        this.loginWaitMessage = "Please wait..."
        this.authStore
          .login({
            email: this.email,
            password: this.password,
          })
          .then(() => {
            // We are now logged in. Prompt the browser to remember the credentials.
            if (window.PasswordCredential) {
              try {
                // We used to pass in the DOM element, but in Chrome 92 that causes a crash.
                const c = new window.PasswordCredential({
                  id: this.email,
                  password: this.password,
                })
                navigator.credentials
                  .store(c)
                  .then(function () {
                    self.pleaseShowModal = false
                  })
                  .catch((err) => {
                    console.error('Failed to save credentials', err)
                  })
              } catch (e) {
                console.log('Failed to save credentials2', e)
                self.pleaseShowModal = false
              }
            } else {
              self.pleaseShowModal = false
            }
          })
          .catch((e) => {
            console.log('Login failed', e)
            if (e instanceof LoginError) {
              console.log('Login error')
              this.nativeLoginError = e.status
            } else {
              throw e // let others bubble up
            }
            this.loginWaitMessage = null
          })
      }
    },
    async loginFacebook() {
      this.loginType = 'Facebook'

      this.nativeLoginError = null
      this.socialLoginError = null
      this.loginWaitMessage = null

      // App: https://github.com/capacitor-community/facebook-login

      if( this.isApp) {
        console.log("Facebook app start")
        const FACEBOOK_PERMISSIONS = [
          'email',
          //'user_birthday',
          //'user_photos',
          //'user_gender',
        ]
        try{
          const response = await FacebookLogin.login({ permissions: FACEBOOK_PERMISSIONS })
          console.log("Facebook response", response) // recentlyGrantedPermissions, recentlyDeniedPermissions
          if (response.accessToken) {
            // Login successful.
            this.loginWaitMessage = "Please wait..."
            const accessToken = response.accessToken.token
            console.log('Facebook access token is',accessToken)
            await this.authStore.login({
              fblogin: 1,
              fbaccesstoken: accessToken,
            })
            // We are now logged in.
            self.pleaseShowModal = false
          } else {
            this.socialLoginError = 'Facebook app login failed'
          }
        } catch (e) {
          this.socialLoginError = 'Facebook app login error: ' + e.message
        }
        this.loginWaitMessage = null
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

          await this.authStore.login({
            fblogin: 1,
            fbaccesstoken: accessToken,
          })

          // We are now logged in.
          self.pleaseShowModal = false
        } else {
          this.socialLoginError =
            'Facebook response is unexpected.  Please try later.'
        }
      } catch (e) {
        this.socialLoginError = 'Facebook login error: ' + e.message
      }
    },
    loginApple() {
      // https://github.com/capacitor-community/apple-sign-in
      this.socialLoginError = null
      this.loginWaitMessage = null
      try{
        console.log('loginApple')
        const options = { scopes: 'email name' }

        SignInWithApple.authorize(options)
          .then( async result => {
            // Sign in using token at server
            console.log("SIWA success",result.response.identityToken,result)
            
            if (result.response.identityToken) { // identityToken, user, etc
              this.loginWaitMessage = "Please wait..."
        console.log("SIWA AAAA",result.response.identityToken)
              await this.authStore.login({
                applecredentials: result.response.identityToken,
                applelogin: true
              })
              console.log("SIWA BBBB")
              // We are now logged in.
              self.pleaseShowModal = false
            } else{
              this.socialLoginError = "No identityToken given"
              this.loginWaitMessage = null
            }
          })
          .catch(e => {
            console.log("SIWA ZZZ",e)
            if( e.message.indexOf('1001') !== -1 ) {
              this.socialLoginError = 'Apple login cancelled'
            } else {
              console.log("SIWA error",e)
              this.socialLoginError = e.message
            }
            this.loginWaitMessage = null
          });
        
      } catch( e){
        console.log('Apple login error: ', e)
        this.socialLoginError = 'Apple login error: ' + e.message
      }
    },
    async loginGoogleApp() {
      try{
        console.log('loginGoogleApp')
        const response = await GoogleAuth.signIn();
        console.log(response.message, response.code);
        this.loginWaitMessage = "Please wait..."
        this.socialLoginError = 'Google did something'
      } catch( e){
        console.log('Google login error: ', e)
        this.socialLoginError = 'Google login error: ' + e.message
      }
      this.loginWaitMessage = null
    },
    async handleGoogleCredentialsResponse(response) {
      console.log('Google login', response)
      this.loginType = 'Google'
      this.nativeLoginError = null
      this.socialLoginError = null
      if (response?.credential) {
        console.log('Signed in')

        try {
          await this.authStore.login({
            googlejwt: response.credential,
            googlelogin: true,
          })

          // We are now logged in.
          console.log('Logged in')
          this.pleaseShowModal = false
        } catch (e) {
          this.socialLoginError = 'Google login failed: ' + e.message
        }
      } else if (response?.error && response.error !== 'immediate_failed') {
        this.socialLoginError = 'Google login failed: ' + response.error
      }
    },
    loginYahoo() {
      this.loginType = 'Yahoo'

      this.nativeLoginError = null
      this.socialLoginError = null
      this.loginWaitMessage = null

      if( this.isApp) {
        appYahooLogin(this.$route.fullPath,
        ret => { // arrow so .this. is correct
            this.loginWaitMessage = "Please wait..."
            //console.log('appYahooLogin completed', ret)
            const returnto = ret.returnto
            const code = ret.code
            if (this.me) {
              // We are logged in.  Go back to where we want to be.
              console.log('Already logged in')
              if (returnto) {
                // Go where we want to be.  Make sure we remove the code to avoid us trying to log in again.
                console.log('Return to', returnto)
                this.$router.push(returnto)
              } else {
                console.log('Just go home')
                this.$router.push('/')
              }
            } else if (!code) {
              this.socialLoginError = 'Yahoo login failed: '+ret.error
              this.loginWaitMessage = null
            } else {
              this.authStore.login({
                yahoocodelogin: code
              })
              .then(async result => {
                const ret = result.data
                console.log('Yahoologin session login returned', ret)
                if (ret.ret === 0) {
                  console.log('Logged in')
                  this.pleaseShowModal = false

                  if (returnto) {
                    // Go where we want to be.  Make sure we remove the code to avoid us trying to log in again.
                    console.log('Return to', returnto)
                    this.$router.go(returnto)
                  } else {
                    console.log('Just go home')
                    this.$router.push('/')
                  }
                } else {
                  console.error('Server login failed', ret)
                  this.socialLoginError = 'Yahoo login failed'
                  this.loginWaitMessage = null
                }
              })
            }
          })
        return
      }

      // Sadly Yahoo doesn't support a Javascript-only OAuth flow, so far as I can tell.  So what we do is
      // redirect to Yahoo, which returns back to us with a code parameter, which we then pass to the server
      // to complete the signin.  This replaces the old flow which stopped working in Jan 2020.
      const url =
        'https://api.login.yahoo.com/oauth2/request_auth?client_id=' +
        this.runtimeConfig.public.YAHOO_CLIENTID +
        '&redirect_uri=' +
        encodeURIComponent(
          window.location.protocol +
            '//' +
            window.location.hostname +
            (window.location.port ? ':' + window.location.port : '') +
            '/yahoologin?returnto=' +
            this.$route.fullPath
        ) +
        '&response_type=code&language=en-us&scope=sdpp-w'

      window.location = url
    },
    clickShowSignUp(e) {
      this.showSignUp = true
      this.forceSignIn = false
      e.preventDefault()
      e.stopPropagation()
    },
    clickShowSignIn(e) {
      this.showSignUp = false
      this.forceSignIn = true
      e.preventDefault()
      e.stopPropagation()
    },
    togglePassword() {
      this.showPassword = !this.showPassword
    },
    forgot() {
      this.hide()
      this.forceLogin = false
      this.$router.push('/forgot')
    },
    installGoogleSDK() {
      if( this.isApp){
        console.log('GoogleAuth.initialize A')
        GoogleAuth.initialize()
        console.log('GoogleAuth.initialize B')
      } else {
        console.log('Install google SDK')
        // Google client library should have been loaded by the layout.
        window?.google?.accounts?.id?.initialize({
          client_id: this.clientId,
          callback: this.handleGoogleCredentialsResponse,
        })
        console.log('Render google button')
        window?.google?.accounts?.id?.renderButton(
          document.getElementById('googleLoginButton'),
          { theme: 'outline', size: 'large', width: '300px' }
        )
      }
    },
    installFacebookSDK() {
      const self = this

      if (typeof window.FB === 'undefined') {
        console.log('Need to install Facebook SDK')
        window.fbAsyncInit = function () {
          window.FB.init({
            appId: self.runtimeConfig.public.FACEBOOK_APPID,
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
        this.bump++
      } else {
        console.log('FB SDK already loaded')
      }
    },
  },
}
</script>
<style scoped lang="scss">
@import '~bootstrap/scss/functions';
@import '~bootstrap/scss/variables';
@import '~bootstrap/scss/mixins/_breakpoints';

$color-facebook: #4267b2;
$color-google: #4285f4;
$color-yahoo: #6b0094;
$color-apple: #000000;

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
  min-width: 250px;
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

.social-button--apple {
  border: 2px solid $color-apple;
  background-color: $color-apple;
  width: 100%;
}
.social-button--apple .social-button__image {
  width: 56px;
  height: 56px;
  background-color: $color-black;
}

.social-button--google {
  border: 2px solid $color-google;
  background-color: #dadce0;
  width: 100%;
}
.social-button--google-app {
  border: 2px solid $color-google;
  background-color: #fff;
  color: #3c4043;
  width: 100%;
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

:deep {
  .is-invalid label {
    color: unset;
  }
}
</style>
