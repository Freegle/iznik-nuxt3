<template>
  <client-only v-if="me">
    <div>
      <h1 class="visually-hidden">Settings</h1>
      <b-row class="m-0">
        <b-col cols="0" xl="3" />
        <b-col cols="12" xl="6" class="p-0">
          <b-card
            border-variant="info"
            header-bg-variant="info"
            header-text-variant="white"
            class="mt-2"
          >
            <template #header>
              <h2 class="bg-info header--size5 mb-0">
                <v-icon icon="globe-europe" />
                Your Public Profile
              </h2>
            </template>
            <b-card-body class="p-0 pt-1">
              <p class="text-muted">
                This is what other freeglers can see about you.
              </p>
              <b-row>
                <b-col cols="12">
                  <label> Your name (or a nickname): </label>
                  <b-input-group>
                    <b-form-input
                      id="myname"
                      v-model="me.displayname"
                      placeholder="Your name"
                    />
                    <b-input-group-append>
                      <b-button variant="white" @click="saveName">
                        <v-icon icon="save" />&nbsp;Save
                      </b-button>
                    </b-input-group-append>
                  </b-input-group>
                </b-col>
              </b-row>
              <b-row class="mt-2">
                <b-col cols="12" xl="6">
                  <b-card>
                    <b-card-body class="text-center p-2">
                      <div class="d-flex justify-content-around">
                        <ProfileImage
                          :image="
                            useprofile ? profileurl + '?' + cacheBust : null
                          "
                          class="mr-1 mb-1 mt-1 inline"
                          is-thumbnail
                          size="xl"
                        />
                      </div>
                      <div class="d-flex justify-content-around mb-2">
                        <OurToggle
                          v-model="useprofile"
                          class="mt-2"
                          :labels="{ checked: 'Showing', unchecked: 'Hidden' }"
                          @change="changeUseProfile"
                        />
                      </div>
                      <div
                        class="d-flex justify-content-around align-items-center"
                      >
                        <div
                          v-if="me.profile.ours && useprofile"
                          class="clickme image__icon stacked mt-2"
                          title="Rotate left"
                          @click="rotateLeft"
                        >
                          <v-icon icon="circle" size="2x" />
                          <v-icon icon="reply" class="pl-2" />
                        </div>
                        <b-button
                          variant="secondary"
                          class="mt-2"
                          @click="uploadProfile"
                        >
                          <v-icon icon="camera" /> Upload photo
                        </b-button>
                        <div
                          v-if="me.profile.ours && useprofile"
                          class="clickme image__icon stacked mt-2"
                          title="Rotate right"
                          @click="rotateRight"
                        >
                          <v-icon icon="circle" size="2x" />
                          <v-icon icon="reply" flip="horizontal" class="pr-2" />
                        </div>
                      </div>
                      <b-row v-if="uploading" class="bg-white">
                        <b-col class="p-0">
                          <OurFilePond
                            imgtype="User"
                            imgflag="user"
                            :msgid="me.id"
                            @photo-processed="photoProcessed"
                          />
                        </b-col>
                      </b-row>
                      <div v-if="supporter" class="mt-4">
                        <SupporterInfo size="lg" :hidden="!showSupporter" />
                        <b-button
                          variant="link"
                          size="sm"
                          @click="toggleSupporter"
                        >
                          <span v-if="showSupporter">
                            Click to hide from others
                          </span>
                          <span v-else> Click to show to others </span>
                        </b-button>
                        <p class="text-muted small mt-2">
                          <span v-if="showSupporter">
                            Other freeglers can see that you have kindly
                            supported Freegle recently with time or funds.
                          </span>
                          <span v-else> Other freeglers can't see this. </span>
                        </p>
                      </div>
                    </b-card-body>
                  </b-card>
                </b-col>
                <b-col cols="12" xl="6">
                  <b-card no-body>
                    <b-card-body class="text-start p-0 p-sm-2">
                      <div v-if="aboutme">
                        &quot;{{ aboutme }}&quot;
                        <br />
                        <b-button
                          variant="white"
                          class="mt-2"
                          @click="addAbout"
                        >
                          <v-icon icon="pen" /> Edit
                        </b-button>
                      </div>
                      <div v-else>
                        <notice-message>
                          Please write something to let other freeglers know a
                          bit about you. It makes freegling more fun and helps
                          get a better response when you're replying to OFFERs.
                        </notice-message>
                        <b-button
                          variant="white"
                          class="mt-2"
                          @click="addAbout"
                        >
                          <v-icon icon="pen" /> Introduce yourself
                        </b-button>
                      </div>
                    </b-card-body>
                  </b-card>
                </b-col>
              </b-row>
              <b-row>
                <b-col>
                  <b-button variant="white" class="mt-2" @click="viewProfile">
                    <v-icon icon="eye" /> View Your Profile
                  </b-button>
                </b-col>
              </b-row>
            </b-card-body>
          </b-card>
          <b-card
            border-variant="info"
            header-bg-variant="info"
            header-text-variant="white"
            class="mt-2"
          >
            <template #header>
              <h2 class="bg-info header--size5 mb-0">
                <v-icon icon="user" />
                Your Account Settings
              </h2>
            </template>
            <b-card-body class="p-0 pt-1">
              <p class="text-muted">
                <v-icon icon="lock" /> This is private. Other freeglers can't
                see this.
              </p>
              <div class="d-flex">
                <EmailValidator
                  ref="email"
                  v-model:email="me.email"
                  v-model:valid="emailValid"
                  size="md"
                  label="Your primary email address:"
                />
                <SpinButton
                  variant="primary"
                  name="save"
                  label="Save"
                  spinclass="text-white"
                  class="align-self-end pb-3"
                  @handle="saveEmail"
                />
              </div>
              <div
                v-if="otheremails.length"
                :key="JSON.stringify(otheremails) + me.email"
                class="mt-1 mb-3"
              >
                <p class="m-0">Other emails:</p>
                <EmailOwn
                  v-for="email in otheremails"
                  :key="'ownemail-' + email.id"
                  :email="email"
                />
              </div>
              <NoticeMessage v-if="me.bouncing" variant="danger" class="mb-2">
                <p>
                  We can't send to your email address. Please change it to a
                  valid one and press <em>Save</em>.
                </p>
                <p>Or if you're sure it's valid:</p>
                <SpinButton
                  variant="white"
                  name="check"
                  label="Try again"
                  @handle="unbounce"
                />
              </NoticeMessage>
              <b-row>
                <b-col cols="12" sm="6">
                  <PasswordEntry
                    :original-password="me.password"
                    show-save-option
                    placeholder="Your password"
                  />
                </b-col>
              </b-row>
              <b-row>
                <b-col cols="12">
                  <b-form-group label="Your Postcode:">
                    <div class="d-flex flex-wrap">
                      <PostCode
                        @selected="selectPostcode"
                        @cleared="clearPostcode"
                      />
                      <SpinButton
                        variant="white"
                        size="lg"
                        class="mb-2 d-inline"
                        :disabled="!pc"
                        name="save"
                        label="Save"
                        @handle="savePostcode"
                      />
                    </div>
                  </b-form-group>
                </b-col>
              </b-row>
              <b-row>
                <b-col>
                  <hr />
                  <b-button variant="secondary" size="lg" to="/unsubscribe">
                    <v-icon icon="trash-alt" />
                    Unsubscribe or Leave Communities
                  </b-button>
                </b-col>
              </b-row>
            </b-card-body>
          </b-card>
          <b-card
            border-variant="info"
            header-bg-variant="info"
            header-text-variant="white"
            class="mt-2"
          >
            <template #header>
              <h2 class="bg-info header--size5 mb-0">
                <v-icon icon="address-book" />
                Your Address Book
              </h2>
            </template>
            <b-card-body class="p-0 pt-1">
              <p>
                You can save your address and directions, and send them to other
                freeglers, so you don't have to type it each time.
              </p>
              <b-button variant="secondary" @click="addressBook">
                Open Address Book
              </b-button>
              <p class="text-muted mt-2">
                <v-icon icon="lock" />
                This is private. Other freeglers can't see this unless you send
                it to them.
              </p>
            </b-card-body>
          </b-card>
          <b-card
            border-variant="info"
            header-bg-variant="info"
            header-text-variant="white"
            class="mt-2"
          >
            <template #header>
              <h2 class="bg-info header--size5 mb-0">
                <v-icon icon="envelope" />
                Email Settings
              </h2>
            </template>
            <div v-if="myGroups">
              <b-card-body class="p-0 pt-1 mt-1">
                <p>
                  You can control how often you get emails from your Freegle
                  communities.
                  <span v-if="simpleEmailSetting !== 'None'">
                    Occasionally we may also send ADMIN mails about the running
                    of Freegle.
                  </span>
                  <span v-else>
                    Occasionally we may still send ADMIN mails about the running
                    of Freegle.
                  </span>
                </p>
                <notice-message
                  v-if="simpleEmailSetting !== 'None'"
                  variant="warning"
                  class="mb-2"
                >
                  Email doesn't always get through, so check your spam folders,
                  and check
                  <nuxt-link no-prefetch to="/chats">Chats</nuxt-link> on here
                  occasionally.
                </notice-message>
                <div v-if="simpleSettings && !showAdvanced">
                  <b-form-group label="Choose your email level:">
                    <b-form-select v-model="simpleEmailSetting">
                      <b-form-select-option value="None">
                        Off
                      </b-form-select-option>
                      <b-form-select-option value="Basic">
                        Basic - limited emails
                      </b-form-select-option>
                      <b-form-select-option value="Full">
                        Standard - all types of emails
                      </b-form-select-option>
                    </b-form-select>
                  </b-form-group>
                  <NoticeMessage
                    v-if="simpleEmailSetting === 'None'"
                    variant="danger"
                    class="mb-1"
                  >
                    If people message you, you won't get any emails. Please make
                    sure you check Chats regularly so that you don't miss
                    anything.
                  </NoticeMessage>
                  <div v-if="simpleEmailSetting !== 'None'">
                    <SettingsGroup
                      v-model:emailfrequency="emailSimple"
                      eventshide
                      volunteerhide
                      label="Choose OFFER/WANTED frequency:"
                    />
                    <SettingsEmailInfo
                      v-model:simple-email-setting="simpleEmailSetting"
                    />
                  </div>
                  <b-button
                    v-if="!showAdvanced"
                    variant="link"
                    size="sm"
                    class="p-0"
                    @click="toggleAdvanced"
                  >
                    Click to show advanced email settings
                  </b-button>
                </div>
                <div v-else>
                  <div>
                    <div
                      v-for="group in myGroups"
                      :key="'settingsgroup-' + group.id"
                      class="list-unstyled"
                    >
                      <b-card class="nocardbot">
                        <b-card-title title-tag="h3" class="header--size4">
                          <nuxt-link :to="'/explore/' + group.nameshort">
                            <b-img
                              v-if="group.profile"
                              lazy
                              rounded
                              thumbnail
                              alt="Community profile picture"
                              :src="group.profile"
                              class="float-right groupprofile"
                            />
                          </nuxt-link>
                          <nuxt-link
                            :to="'/explore/' + group.nameshort"
                            class="group__title"
                          >
                            {{ group.namedisplay }}
                          </nuxt-link>
                          <span
                            v-if="
                              group.role === 'Moderator' ||
                              group.role === 'Owner'
                            "
                          >
                            <v-icon icon="crown" class="text-success" />
                          </span>
                        </b-card-title>
                        <b-card-body class="p-0 pt-2">
                          <SettingsGroup
                            :groupid="group.id"
                            :leave="group.role === 'Member'"
                            @leave="leaveGroup(group.id)"
                          />
                        </b-card-body>
                      </b-card>
                    </div>
                    <hr />
                    <p>
                      Mail me replies from other freeglers about my OFFERs and
                      WANTEDs.
                    </p>
                    <OurToggle
                      v-model="notificationSettings.email"
                      :width="150"
                      :sync="true"
                      :labels="{
                        checked: 'Emails are On',
                        unchecked: 'Emails are Off',
                      }"
                      color="#61AE24"
                      @change="changeNotification($event, 'email')"
                    />
                    <hr />
                    <p>
                      We can email you a copy of your own Chat messages sent on
                      the website.
                    </p>
                    <OurToggle
                      v-model="notificationSettings.emailmine"
                      :width="150"
                      :sync="true"
                      :labels="{
                        checked: 'Emailing a copy',
                        unchecked: 'Not emailing a copy',
                      }"
                      color="#61AE24"
                      @change="changeNotification($event, 'emailmine')"
                    />
                    <hr />
                    <p>
                      We can email you about ChitChat, and notifications (the
                      bell icon).
                    </p>
                    <OurToggle
                      v-model="notificationmails"
                      :width="150"
                      :sync="true"
                      :labels="{ checked: 'Sending', unchecked: 'Not sending' }"
                      color="#61AE24"
                      @change="changeNotifChitchat"
                    />
                    <hr />
                    <p>
                      We can email you about specific OFFERs/WANTEDs we think
                      you might be interested in, or to remind you that we would
                      love you to freegle again.
                    </p>
                    <OurToggle
                      v-model="relevantallowed"
                      :width="150"
                      :sync="true"
                      :labels="{ checked: 'Sending', unchecked: 'Not sending' }"
                      color="#61AE24"
                      @change="changeRelevant"
                    />
                    <hr />
                    <p>
                      We send occasional newsletters or collections of nice
                      stories from other freeglers.
                    </p>
                    <OurToggle
                      v-model="newslettersallowed"
                      :width="150"
                      :sync="true"
                      :labels="{ checked: 'Sending', unchecked: 'Not sending' }"
                      color="#61AE24"
                      @change="changeNewsletter"
                    />
                    <hr />
                    <p>We send occasional mails to encourage you to freegle.</p>
                    <OurToggle
                      v-model="me.settings.engagement"
                      :width="150"
                      :sync="true"
                      :labels="{ checked: 'Sending', unchecked: 'Not sending' }"
                      color="#61AE24"
                      @change="changeEngagement"
                    />
                    <hr />
                    <p class="mt-2">
                      Occasionally we may also send ADMIN mails about the
                      running of Freegle.
                    </p>
                  </div>
                </div>
              </b-card-body>
            </div>
            <div v-else>You're not a member of any communities yet.</div>
          </b-card>
          <b-card
            border-variant="info"
            header-bg-variant="info"
            header-text-variant="white"
            class="mt-2"
            no-body
          >
            <template #header>
              <h2 class="bg-info header--size5 mb-0">
                <v-icon icon="bell" />
                Text Alerts
              </h2>
            </template>
            <b-card-body class="p-0 pl-3 pr-3 pt-3">
              <p>
                We can send SMS alerts to your phone when you have a new message
                on Freegle or a handover soon.
              </p>
              <SettingsPhone />
              <div v-if="me.phone">
                <NoticeMessage
                  v-if="
                    me.phonelastsent &&
                    (!me.phonelastclicked ||
                      me.phonelastclicked < me.phonelastsent)
                  "
                  variant="warning"
                  class="mb-2"
                >
                  <p>
                    We've stopped sending you SMS alerts, because you don't seem
                    to be clicking on them. We do this to save Freegle money.
                  </p>
                  <ul>
                    <li>
                      If you don't want to get SMS alerts, please click
                      <em>Remove</em> above to remove your number.
                    </li>
                    <li>
                      If you do still want to receive SMS alerts again, please
                      remove and re-add your mobile number, and we'll start
                      again.
                    </li>
                  </ul>
                  <p>It costs Freegle to send these - if you can, please:</p>
                  <donation-button />
                </NoticeMessage>
                <NoticeMessage v-else variant="warning" class="mb-2">
                  <p>It costs Freegle to send these - if you can, please:</p>
                  <donation-button />
                </NoticeMessage>
              </div>
            </b-card-body>
          </b-card>
          <b-card
            border-variant="info"
            header-bg-variant="info"
            header-text-variant="white"
            class="mt-2"
          >
            <template #header>
              <h2 class="bg-info header--size5 mb-0">
                <v-icon icon="cog" />
                Other
              </h2>
            </template>
            <b-card-body class="p-0 pt-1">
              <b-form-group>
                <h3 class="header--size5 header5__color">
                  What the enter key does
                </h3>
                <p>
                  Normally hitting enter/return sends chat messages, rather than
                  add a new line.
                </p>
                <p v-if="enterNewLine">
                  You have this set to add a new line. This can cause problems
                  on some devices, so if you have problems with this setting,
                  then please change it back.
                </p>
                <OurToggle
                  v-model="enterNewLine"
                  class="mt-2"
                  :width="150"
                  :sync="true"
                  :labels="{
                    checked: 'Inserts new line',
                    unchecked: 'Sends message',
                  }"
                  color="#61AE24"
                  @change="changeNewLine"
                />
              </b-form-group>
              <b-form-group>
                <h3 class="header--size5 header5__color">Auto-reposts</h3>
                <p>
                  In most Freegle communities, your OFFER/WANTED posts will be
                  automatically reposted (or "bumped") unless you've marked them
                  as TAKEN/RECEIVED/Withdrawn from
                  <!-- eslint-disable-next-line-->
                    <nuxt-link  no-prefetch to="/myposts">My Posts</nuxt-link>.
                </p>
                <OurToggle
                  v-model="autoreposts"
                  :width="150"
                  :sync="true"
                  :labels="{
                    checked: 'Autoreposting is On',
                    unchecked: 'Autoreposting is Off',
                  }"
                  color="#61AE24"
                  @change="changeAutorepost"
                />
              </b-form-group>
            </b-card-body>
          </b-card>
        </b-col>
        <b-col cols="0" xl="3" />
      </b-row>
      <AboutMeModal ref="aboutmemodal" @datachange="update" />
      <ProfileModal :id="me ? me.id : null" ref="profilemodal" />
      <EmailConfirmModal ref="emailconfirm" />
      <AddressModal ref="addressModal" />
    </div>
  </client-only>
</template>
<script>
import dayjs from 'dayjs'
import { useRoute } from 'vue-router'
import { useMiscStore } from '../../stores/misc'
import { useAuthStore } from '../../stores/auth'
import { buildHead } from '../../composables/useBuildHead'
import EmailOwn from '~/components/EmailOwn'
import EmailValidator from '~/components/EmailValidator'
import SettingsEmailInfo from '~/components/SettingsEmailInfo'
import SettingsPhone from '~/components/SettingsPhone'
import SupporterInfo from '~/components/SupporterInfo'
import EmailConfirmModal from '~/components/EmailConfirmModal'
import ProfileImage from '~/components/ProfileImage'
import PostCode from '~/components/PostCode'

import AboutMeModal from '~/components/AboutMeModal'
import AddressModal from '~/components/AddressModal'
import ProfileModal from '~/components/ProfileModal'
import SettingsGroup from '~/components/SettingsGroup'
import NoticeMessage from '~/components/NoticeMessage'
import OurFilePond from '~/components/OurFilePond'
import OurToggle from '~/components/OurToggle'
import DonationButton from '~/components/DonationButton'
import PasswordEntry from '~/components/PasswordEntry'

definePageMeta({
  layout: 'login',
})

export default {
  components: {
    SettingsEmailInfo,
    SupporterInfo,
    SettingsPhone,
    EmailOwn,
    EmailValidator,
    OurToggle,
    EmailConfirmModal,
    AboutMeModal,
    AddressModal,
    ProfileModal,
    PostCode,
    SettingsGroup,
    NoticeMessage,
    ProfileImage,
    OurFilePond,
    DonationButton,
    PasswordEntry,
  },
  setup() {
    const runtimeConfig = useRuntimeConfig()
    const route = useRoute()
    useHead(
      buildHead(
        route,
        runtimeConfig,
        'Settings',
        'What people see about you, your email settings, all that good stuff...',
        null,
        {
          class: 'overflow-y-scroll',
        }
      )
    )

    const miscStore = useMiscStore()
    const authStore = useAuthStore()

    return {
      miscStore,
      authStore,
    }
  },
  data() {
    return {
      pc: null,
      showAdvanced: false,
      savingPostcode: false,
      savedPostcode: false,
      uploading: false,
      emailValid: false,
      cacheBust: Date.now(),
      userTimer: null,
      autoreposts: true,
      enterNewLine: false,
    }
  },
  computed: {
    today() {
      return dayjs().format('YYYY-MM-DD')
    },
    aMonthFromNow() {
      return dayjs().add(30, 'day').format('YYYY-MM-DD')
    },
    showSupporter() {
      const settings = this.me.settings
      return 'hidesupporter' in settings ? !settings.hidesupporter : true
    },
    relevantallowed: {
      // This is 1/0 in the model whereas we want Boolean.
      set(val) {
        this.me.relevantallowed = val ? 1 : 0
      },
      get() {
        return Boolean(this.me.relevantallowed)
      },
    },
    notificationSettings() {
      const ret = {
        email: true,
        emailmine: false,
        push: true,
        facebook: true,
        app: true,
      }

      const settings = this.me?.settings?.notifications

      if (settings) {
        if ('email' in settings) {
          ret.email = settings.email
        }
        if ('emailmine' in settings) {
          ret.emailmine = settings.emailmine
        }
        if ('push' in settings) {
          ret.push = settings.push
        }
        if ('facebook' in settings) {
          ret.facebook = settings.facebook
        }
        if ('app' in settings) {
          ret.app = settings.app
        }
      }

      return ret
    },
    notificationmails: {
      // This is 1/0 in the model whereas we want Boolean.
      set(val) {
        this.me.notificationmails = val ? 1 : 0
      },
      get() {
        return Boolean(this.me.settings.notificationmails)
      },
    },
    newslettersallowed: {
      // This is 1/0 in the model whereas we want Boolean.
      set(val) {
        this.me.newslettersallowed = val ? 1 : 0
      },
      get() {
        return Boolean(this.me.newslettersallowed)
      },
    },
    aboutme() {
      const ret = this.me && this.me.aboutme ? this.me.aboutme.text : ''
      return ret
    },
    profileurl() {
      return this.me && this.useprofile
        ? this.me.profile.path
        : '/defaultprofile.png'
    },
    useprofile() {
      let ret = true

      if (this.me && this.me.settings) {
        if (Object.keys(this.me.settings).includes('useprofile')) {
          ret = this.me.settings.useprofile
        }
      }

      return ret
    },
    simpleEmailSetting: {
      // There are three variants:
      // - None.  All the options are off.
      // - Basic.  OFFER/WANTED, chat messages,
      // - Full.  OFFER/WANTED, community event, volunteer ops, chitchat, notifications,
      get() {
        return this.me.settings?.simplemail
          ? this.me.settings.simplemail
          : 'Full'
      },
      async set(newVal) {
        await this.authStore.saveAndGet({
          simplemail: newVal,
        })
      },
    },
    checkSimplicity() {
      let ret = true
      let first = true
      let emailFrequency = 24
      let communityEvents = null
      let volunteering = null

      // If we have the same settings on all groups, then we can show a simplified view.
      if (this.myGroups) {
        for (const group of this.myGroups) {
          if (first) {
            emailFrequency = group.emailfrequency
            communityEvents = group.eventsallowed
            volunteering = group.volunteeringallowed
            first = false
          } else if (
            emailFrequency !== group.emailfrequency ||
            communityEvents !== group.eventsallowed ||
            volunteering !== group.volunteeringallowed
          ) {
            ret = false
            emailFrequency = group.emailfrequency
            communityEvents = group.eventsallowed
            volunteering = group.volunteeringallowed
            break
          }
        }
      }

      return {
        ret,
        emailFrequency,
        communityEvents,
        volunteering,
      }
    },
    simpleSettings() {
      if (this.me?.settings?.simplemail) {
        // We know that we have simple settings.
        return true
      }

      // Check whether our settings are the same on all groups
      const simple = this.checkSimplicity
      return simple.ret
    },
    emailSimple: {
      get() {
        const simple = this.checkSimplicity
        return simple.emailFrequency
      },
      set(newValue) {
        console.log('Change email simple', newValue)
        this.changeAllGroups('emailfrequency', newValue)
      },
    },
    volunteeringSimple: {
      get() {
        const simple = this.checkSimplicity
        return Boolean(simple.volunteering)
      },
      set(newValue) {
        this.changeAllGroups('volunteeringallowed', newValue)
      },
    },
    eventSimple: {
      get() {
        const simple = this.checkSimplicity
        return Boolean(simple.communityEvents)
      },
      set(newValue) {
        this.changeAllGroups('eventsallowed', newValue)
      },
    },
    otheremails() {
      return this.me.emails
        ? this.me.emails.filter((e) => {
            return !e.ourdomain && e.email !== this.me.email
          })
        : []
    },
  },
  async mounted() {
    await this.update()
    this.autoreposts = !this.me?.settings?.autorepostsdisable
    this.enterNewLine = this.me?.settings?.enterNewLine

    setTimeout(this.checkUser, 200)
  },
  methods: {
    async toggleSupporter() {
      const settings = this.me.settings
      settings.hidesupporter = this.showSupporter

      await this.authStore.saveAndGet({
        settings,
      })
    },
    checkUser() {
      // This is a hack.  In the lost password case, we've seen that the login which is driven via the default
      // layout completes after we have retrieved our user.  The result is that we don't have the right info in "me".
      // I have discovered a truly marvellous fix for this, which this comment is too short to contain.
      if (!this.me || !this.me.settings || !this.notificationSettings) {
        this.update()
      } else {
        setTimeout(this.checkUser, 200)
      }
    },
    async fetch() {
      await this.authStore.fetchUser()
    },
    async update() {
      try {
        await this.fetch()
      } catch (e) {
        console.error('Failed to fetch user', e)
      }
    },
    async addAbout() {
      await this.fetch()

      await this.waitForRef('aboutmemodal')
      this.$refs.aboutmemodal.show()
    },
    async viewProfile() {
      await this.waitForRef('profilemodal')
      this.$refs.profilemodal.show()
    },
    async changeUseProfile(c, e) {
      const settings = this.me.settings
      settings.useprofile = c
      await this.authStore.saveAndGet({
        settings,
      })
    },
    async saveName() {
      await this.authStore.saveAndGet({
        displayname: this.me.displayname,
      })
    },
    selectPostcode(pc) {
      this.pc = pc
    },
    clearPostcode() {
      this.pc = null
    },
    async saveEmail() {
      this.savingEmail = true

      if (this.me.email) {
        const data = await this.authStore.saveEmail({
          email: this.me.email,
        })

        if (data && data.ret === 10) {
          await this.waitForRef('emailconfirm')
          this.$refs.emailconfirm.show()
        }
      }

      this.savingEmail = false
      this.savedEmail = true
      setTimeout(() => {
        this.savedEmail = false
      }, 2000)
    },
    async unbounce() {
      this.unbouncing = true

      if (this.me.email && this.me.bouncing) {
        await this.authStore.unbounce(this.me.id)
      }

      this.unbouncing = false
      this.unbounced = true
      setTimeout(() => {
        this.unbounced = false
      }, 2000)
    },
    async savePostcode() {
      const settings = this.me.settings
      this.savingPostcode = true

      if (!settings?.mylocation || settings?.mylocation.id !== this.pc.id) {
        settings.mylocation = this.pc
        await this.authStore.saveAndGet({
          settings,
        })
      }

      this.savingPostcode = false
      this.savedPostcode = true
      setTimeout(() => {
        this.savedPostcode = false
      }, 2000)
    },
    toggleAdvanced(e) {
      e.preventDefault()
      this.showAdvanced = !this.showAdvanced
    },
    async changeAllGroups(param, value) {
      console.log('Change all', this.myGroups)
      for (const group of this.myGroups) {
        const params = {
          userid: this.me.id,
          groupid: group.id,
        }
        params[param] = value

        // Don't fetch for each group.
        await this.authStore.setGroup(params, true)
      }

      await this.fetch()
    },
    async changeNotification(e, type) {
      const settings = this.me.settings
      settings.notifications[type] = e
      await this.authStore.saveAndGet({
        settings,
      })
    },
    async changeRelevant(e) {
      await this.authStore.saveAndGet({
        relevantallowed: e,
      })
    },
    async changeNotifChitchat(e) {
      const settings = this.me.settings
      settings.notificationmails = e
      await this.authStore.saveAndGet({
        settings,
      })
    },
    async changeNewsletter(e) {
      await this.authStore.saveAndGet({
        newslettersallowed: e,
      })
    },
    async changeEngagement(e) {
      const settings = this.me.settings
      settings.engagement = e
      await this.authStore.saveAndGet({
        settings,
      })
    },
    async changeAutorepost(e) {
      const settings = this.me.settings
      settings.autorepostsdisable = !e
      await this.authStore.saveAndGet({
        settings,
      })
    },
    async changeNewLine(e) {
      const settings = this.me.settings
      settings.enterNewLine = e
      await this.authStore.saveAndGet({
        settings,
      })
      this.enterNewLine = e
    },
    async leaveGroup(id) {
      await this.authStore.leaveGroup(this.myid, id)
    },
    addressBook() {
      this.$refs.addressModal.show()
    },
    photoProcessed(imageid, imagethumb, image) {
      // We have uploaded a photo.  Remove the filepond instance.
      this.uploading = false

      this.$router.go()
    },
    uploadProfile() {
      this.uploading = true
    },
    async rotate(deg) {
      await this.imageStore.post({
        id: this.event.image.id,
        rotate: deg,
        bust: Date.now(),
        user: true,
      })

      this.cacheBust = Date.now()
    },
    rotateLeft() {
      this.rotate(90)
      this.cacheBust = Date.now()
    },
    rotateRight() {
      this.rotate(-90)
      this.cacheBust = Date.now()
    },
  },
}
</script>
<style scoped lang="scss">
.groupprofile {
  height: 100px !important;
}

.nocardbot .card-body {
  padding-bottom: 0px;
}

.group__title {
  color: $colour-header;
}

.image__icon {
  color: $color-white;
}

.header5__color {
  /* Need to override the h5 as it has higher specificity */
  color: #212529 !important;
}

.stacked {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  color: $color-gray--dark;

  svg {
    grid-row: 1 / 2;
    grid-column: 1 / 2;
  }

  svg:nth-child(2) {
    z-index: 10000;
    color: white;
    padding-top: 7px;
  }
}
</style>
