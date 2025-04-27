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
                    <slot name="append">
                      <b-button variant="white" @click="saveName">
                        <v-icon icon="save" />&nbsp;Save
                      </b-button>
                    </slot>
                  </b-input-group>
                </b-col>
              </b-row>
              <b-row class="mt-2">
                <b-col cols="12" xl="6">
                  <b-card>
                    <b-card-body class="text-center p-2">
                      <div :key="bump" class="d-flex justify-content-around">
                        <ProfileImage
                          v-if="!me || !useprofile"
                          image="/defaultprofile.png"
                          class="mr-1 mb-1 mt-1 inline"
                          is-thumbnail
                          size="xl"
                          alt-text="Default profile image"
                        />
                        <ProfileImage
                          v-else-if="me?.profile?.externaluid"
                          :externaluid="me.profile.externaluid"
                          :externalmods="me.profile.externalmods"
                          class="mr-1 mb-1 mt-1 inline"
                          is-thumbnail
                          size="xl"
                          alt-text="My profile image"
                        />
                        <ProfileImage
                          v-else
                          :image="
                            profileurl + '?settings=' + myid + '-' + cacheBust
                          "
                          class="mr-1 mb-1 mt-1 inline"
                          is-thumbnail
                          size="xl"
                          alt-text="My profile image"
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
                          v-if="
                            (me.profile.ours || me.profile.externaluid) &&
                            useprofile &&
                            !showProfileModal &&
                            !uploading
                          "
                          class="clickme image__icon stacked mt-2"
                          title="Rotate left"
                          @click="rotateLeft"
                        >
                          <v-icon icon="circle" size="2x" />
                          <v-icon icon="reply" class="pl-2" />
                        </div>
                        <div
                          v-if="uploading"
                          class="bg-white d-flex justify-content-around"
                        >
                          <OurUploader v-model="currentAtts" type="User" />
                        </div>
                        <b-button
                          v-else
                          variant="secondary"
                          class="mt-2"
                          @click="uploadProfile"
                        >
                          <v-icon icon="camera" /> Upload photo
                        </b-button>
                        <div
                          v-if="
                            (me.profile.ours || me.profile.externaluid) &&
                            useprofile &&
                            !showProfileModal &&
                            !uploading
                          "
                          class="clickme image__icon stacked mt-2"
                          title="Rotate right"
                          @click="rotateRight"
                        >
                          <v-icon icon="circle" size="2x" />
                          <v-icon icon="reply" flip="horizontal" class="pr-2" />
                        </div>
                      </div>
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
                <div class="d-flex flex-column justify-content-end">
                  <SpinButton
                    variant="primary"
                    icon-name="save"
                    label="Save"
                    :disabled="!emailValid"
                    @handle="saveEmail"
                  />
                </div>
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
                  icon-name="check"
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
                    <div class="d-flex flex-wrap align-items-start">
                      <PostCode
                        @selected="selectPostcode"
                        @cleared="clearPostcode"
                      />
                      <SpinButton
                        variant="white"
                        size="lg"
                        class="mb-2"
                        :disabled="!pc"
                        icon-name="save"
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
                <NoticeMessage
                  v-if="
                    simpleEmailSetting === 'None' || !notificationSettings.email
                  "
                  variant="danger"
                  class="mb-1"
                >
                  <p>
                    If people message you, you won't get any emails. Please make
                    sure you check Chats regularly so that you don't miss
                    anything.
                  </p>
                  <p v-if="simpleEmailSetting !== 'None'">
                    You can change this below in "Mail me replies".
                  </p>
                </NoticeMessage>
                <notice-message
                  v-else-if="simpleEmailSetting !== 'None'"
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
                  <p v-if="myGroups?.length === 0">
                    You can set your email settings once you have joined a
                    community.
                  </p>
                  <div v-else>
                    <div v-if="simpleEmailSetting !== 'None'">
                      <SettingsGroup
                        v-model:emailfrequency="emailSimple"
                        eventshide
                        volunteerhide
                        label="Choose OFFER/WANTED frequency:"
                        class="mt-1 mb-1"
                      />
                      <SettingsEmailInfo
                        v-model:simple-email-setting="simpleEmailSetting"
                      />
                    </div>
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
                              class="groupprofile"
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
              <SettingsPhone class="mb-3" />
              <div v-if="me.phone">
                <NoticeMessage
                  v-if="!notificationSettings.email"
                  variant="warning"
                  class="mb-2"
                >
                  Email notifications must be turned on for SMS alerts to be
                  sent.
                </NoticeMessage>
                <NoticeMessage
                  v-else-if="
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
                <h3 class="header--size5 header5__color mt-2">Auto-reposts</h3>
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
      <AboutMeModal
        v-if="showAboutMeModal"
        @hidden="showAboutMeModal = false"
        @data-change="update"
      />
      <ProfileModal
        v-if="showProfileModal"
        :id="me ? me.id : null"
        @hidden="showProfileModal = false"
      />
      <EmailConfirmModal
        v-if="showEmailConfirmModal"
        @hidden="showEmailConfirmModal = false"
      />
      <AddressModal
        v-if="showAddressModal"
        @hidden="showAddressModal = false"
      />
    </div>
  </client-only>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { buildHead } from '../../composables/useBuildHead'
import { useAddressStore } from '../../stores/address'
import EmailOwn from '~/components/EmailOwn'
import EmailValidator from '~/components/EmailValidator'
import SettingsEmailInfo from '~/components/SettingsEmailInfo'
import SettingsPhone from '~/components/SettingsPhone'
import SupporterInfo from '~/components/SupporterInfo'
import ProfileImage from '~/components/ProfileImage'
import PostCode from '~/components/PostCode'
import SettingsGroup from '~/components/SettingsGroup'
import NoticeMessage from '~/components/NoticeMessage'
import OurUploader from '~/components/OurUploader'
import OurToggle from '~/components/OurToggle'
import DonationButton from '~/components/DonationButton'
import PasswordEntry from '~/components/PasswordEntry'
import { fetchMe } from '~/composables/useMe'
import { useImageStore } from '~/stores/image'

definePageMeta({
  layout: 'login',
})

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

const authStore = useAuthStore()
const addressStore = useAddressStore()
const imageStore = useImageStore()

// State
const pc = ref(null)
const showAdvanced = ref(false)
const uploading = ref(false)
const emailValid = ref(false)
const cacheBust = ref(Date.now())
const autoreposts = ref(true)
const enterNewLine = ref(false)
const showAddressModal = ref(false)
const showAboutMeModal = ref(false)
const showProfileModal = ref(false)
const showEmailConfirmModal = ref(false)
const currentAtts = ref([])
const bump = ref(0)

const showSupporter = computed(() => {
  const settings = authStore.me.settings
  return 'hidesupporter' in settings ? !settings.hidesupporter : true
})

const relevantallowed = computed({
  get: () => Boolean(authStore.me.relevantallowed),
  set: (val) => {
    authStore.me.relevantallowed = val ? 1 : 0
  },
})

const notificationSettings = computed(() => {
  const ret = {
    email: true,
    emailmine: false,
    push: true,
    facebook: true,
    app: true,
  }

  const settings = authStore.me?.settings?.notifications

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
})

const notificationmails = computed({
  get: () => Boolean(authStore.me.settings.notificationmails),
  set: (val) => {
    authStore.me.notificationmails = val ? 1 : 0
  },
})

const newslettersallowed = computed({
  get: () => Boolean(authStore.me.newslettersallowed),
  set: (val) => {
    authStore.me.newslettersallowed = val ? 1 : 0
  },
})

const aboutme = computed(() => {
  return authStore.me && authStore.me.aboutme ? authStore.me.aboutme.text : ''
})

const profileurl = computed(() => {
  return authStore.me && useprofile.value && authStore.me.profile?.path
    ? authStore.me.profile.path
    : '/defaultprofile.png'
})

const useprofile = computed(() => {
  let ret = true

  if (authStore.me && authStore.me.settings) {
    if (Object.keys(authStore.me.settings).includes('useprofile')) {
      ret = authStore.me.settings.useprofile
    }
  }

  return ret
})

const simpleEmailSetting = computed({
  get: () => {
    return authStore.me?.settings?.simplemail
      ? authStore.me.settings.simplemail
      : 'Full'
  },
  set: async (newVal) => {
    await authStore.saveAndGet({
      simplemail: newVal,
    })
  },
})

const checkSimplicity = computed(() => {
  let ret = true
  let first = true
  let emailFrequency = 24
  let communityEvents = null
  let volunteering = null

  // If we have the same settings on all groups, then we can show a simplified view.
  if (authStore.myGroups) {
    for (const group of authStore.myGroups) {
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
})

const simpleSettings = computed(() => {
  if (authStore.me?.settings?.simplemail) {
    // We know that we have simple settings.
    return true
  }

  // Check whether our settings are the same on all groups
  const simple = checkSimplicity.value
  return simple.ret
})

const emailSimple = computed({
  get: () => {
    const simple = checkSimplicity.value
    return simple.emailFrequency
  },
  set: (newValue) => {
    changeAllGroups('emailfrequency', newValue)
  },
})

const otheremails = computed(() => {
  return authStore.me.emails
    ? authStore.me.emails.filter((e) => {
        return !e.ourdomain && e.email !== authStore.me.email
      })
    : []
})

// Methods
const toggleSupporter = async () => {
  const settings = authStore.me.settings
  settings.hidesupporter = showSupporter.value

  await authStore.saveAndGet({
    settings,
  })
}

const checkUser = () => {
  // This is a hack. In the lost password case, we've seen that the login which is driven via the default
  // layout completes after we have retrieved our user. The result is that we don't have the right info in "me".
  if (!authStore.me || !authStore.me.settings || !notificationSettings.value) {
    update()
  } else {
    setTimeout(checkUser, 200)
  }
}

const fetch = async () => {
  await authStore.fetchUser()
}

const update = async () => {
  try {
    await fetch()
  } catch (e) {
    console.error('Failed to fetch user', e)
  }
}

const addAbout = async () => {
  await fetch()
  showAboutMeModal.value = true
}

const viewProfile = () => {
  showProfileModal.value = true
}

const changeUseProfile = async (c) => {
  const settings = authStore.me.settings
  settings.useprofile = c
  await authStore.saveAndGet({
    settings,
  })
}

const saveName = async () => {
  await authStore.saveAndGet({
    displayname: authStore.me.displayname,
  })
}

const selectPostcode = (postcode) => {
  pc.value = postcode
}

const clearPostcode = () => {
  pc.value = null
}

const saveEmail = async (callback) => {
  if (authStore.me.email) {
    const data = await authStore.saveEmail({
      email: authStore.me.email,
    })

    if (data && data.ret === 10) {
      showEmailConfirmModal.value = true
    }
  }
  callback()
}

const unbounce = async (callback) => {
  if (authStore.me.email && authStore.me.bouncing) {
    await authStore.unbounce(authStore.me.id)
  }
  callback()
}

const savePostcode = async (callback) => {
  if (pc.value?.id) {
    const settings = authStore.me.settings
    if (!settings?.mylocation || settings?.mylocation.id !== pc.value.id) {
      settings.mylocation = pc.value
      await authStore.saveAndGet({
        settings,
      })
    }
  }

  callback()
}

const toggleAdvanced = (e) => {
  e.preventDefault()
  showAdvanced.value = !showAdvanced.value
}

const changeAllGroups = async (param, value) => {
  for (const group of authStore.myGroups) {
    const params = {
      userid: authStore.me.id,
      groupid: group.id,
    }
    params[param] = value

    // Don't fetch for each group.
    await authStore.setGroup(params, true)
  }

  await fetch()
}

const changeNotification = async (e, type) => {
  const settings = authStore.me.settings
  settings.notifications[type] = e
  await authStore.saveAndGet({
    settings,
  })
}

const changeRelevant = async (e) => {
  await authStore.saveAndGet({
    relevantallowed: e,
  })
}

const changeNotifChitchat = async (e) => {
  const settings = authStore.me.settings
  settings.notificationmails = e
  await authStore.saveAndGet({
    settings,
  })
}

const changeNewsletter = async (e) => {
  await authStore.saveAndGet({
    newslettersallowed: e,
  })
}

const changeEngagement = async (e) => {
  const settings = authStore.me.settings
  settings.engagement = e
  await authStore.saveAndGet({
    settings,
  })
}

const changeAutorepost = async (e) => {
  const settings = authStore.me.settings
  settings.autorepostsdisable = !e
  await authStore.saveAndGet({
    settings,
  })
}

const changeNewLine = async (e) => {
  const settings = authStore.me.settings
  settings.enterNewLine = e
  await authStore.saveAndGet({
    settings,
  })
  enterNewLine.value = e
}

const leaveGroup = async (id) => {
  await authStore.leaveGroup(authStore.myid, id)
}

const addressBook = async () => {
  await addressStore.fetch()
  showAddressModal.value = true
}

const uploadProfile = () => {
  uploading.value = true
}

const rotate = async (deg) => {
  let curr = 0

  if (authStore.me.profile.externaluid) {
    curr = authStore.me.profile.externalmods?.rotate || 0
  }

  curr += deg

  // Ensure between 0 and 360
  curr = (curr + 360) % 360

  await imageStore.post({
    id: authStore.me.profile.id,
    rotate: curr,
    bust: Date.now(),
    user: true,
  })

  // Refresh the user - which in turn should update the image displayed.
  await fetchMe(true)

  cacheBust.value = Date.now()
}

const rotateLeft = () => {
  rotate(-90)
}

const rotateRight = () => {
  rotate(90)
}

// Setup watchers and lifecycle hooks
watch(
  currentAtts,
  async (newVal) => {
    uploading.value = false

    if (newVal?.length) {
      // We want to replace our profile picture. The API for this is a bit odd - msgid will get used as the
      // id of the user.
      const atts = {
        externaluid: newVal[0].ouruid,
        externalmods: newVal[0].externalmods,
        imgtype: 'User',
        msgid: authStore.myid,
      }

      console.log('Post image', atts)
      await imageStore.post(atts)
    }

    // Refresh the user - which in turn should update the image displayed.
    await fetchMe(true)

    bump.value++
  },
  { deep: true }
)

onMounted(async () => {
  await update()
  autoreposts.value = !authStore.me?.settings?.autorepostsdisable
  enterNewLine.value = authStore.me?.settings?.enterNewLine

  if (
    simpleEmailSetting.value === 'Full' ||
    simpleEmailSetting.value === 'Basic'
  ) {
    // Double check that we have chat notification emails enabled, as we should for this setting.
    // If we don't then force display to advanced so that they can change this.
    if (!notificationSettings.value.email) {
      showAdvanced.value = true
    }
  }

  setTimeout(checkUser, 200)
})

// Define async components
const EmailConfirmModal = defineAsyncComponent(() =>
  import('~/components/EmailConfirmModal')
)
const AddressModal = defineAsyncComponent(() =>
  import('~/components/AddressModal')
)
const AboutMeModal = defineAsyncComponent(() =>
  import('~/components/AboutMeModal')
)
const ProfileModal = defineAsyncComponent(() =>
  import('~/components/ProfileModal')
)
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
