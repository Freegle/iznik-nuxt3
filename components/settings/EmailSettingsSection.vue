<template>
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
            Occasionally we may also send ADMIN mails about the running of
            Freegle.
          </span>
          <span v-else>
            Occasionally we may still send ADMIN mails about the running of
            Freegle.
          </span>
        </p>
        <NoticeMessage
          v-if="simpleEmailSetting === 'None' || !notificationSettings.email"
          variant="danger"
          class="mb-1"
        >
          <p>
            If people message you, you won't get any emails. Please make sure
            you check Chats regularly so that you don't miss anything.
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
          Email doesn't always get through, so check your spam folders, and
          check
          <nuxt-link no-prefetch to="/chats">Chats</nuxt-link> on here
          occasionally.
        </notice-message>
        <div v-if="simpleSettings && !showAdvanced">
          <b-form-group label="Choose your email level:">
            <b-form-select
              v-model="simpleEmailSettingLocal"
              class="simpleEmailSelect"
            >
              <b-form-select-option value="None"> Off </b-form-select-option>
              <b-form-select-option value="Basic">
                Basic - limited emails
              </b-form-select-option>
              <b-form-select-option value="Full">
                Standard - all types of emails
              </b-form-select-option>
            </b-form-select>
          </b-form-group>
          <p v-if="myGroups?.length === 0">
            You can set your email settings once you have joined a community.
          </p>
          <div v-else>
            <div v-if="simpleEmailSettingLocal !== 'None'">
              <SettingsGroup
                v-model:emailfrequency="emailSimple"
                eventshide
                volunteerhide
                label="Choose OFFER/WANTED frequency:"
                class="mt-1 mb-1"
              />
              <SettingsEmailInfo
                v-model:simple-email-setting="simpleEmailSettingLocal"
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
                    v-if="group.role === 'Moderator' || group.role === 'Owner'"
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
            <p class="test-other-replies">
              Mail me replies from other freeglers about my OFFERs and WANTEDs.
            </p>
            <OurToggle
              v-model="notificationSettingsLocal.email"
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
              We can email you a copy of your own Chat messages sent on the
              website.
            </p>
            <OurToggle
              v-model="notificationSettingsLocal.emailmine"
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
              We can email you about ChitChat, and notifications (the bell
              icon).
            </p>
            <OurToggle
              v-model="notificationmailsLocal"
              :width="150"
              :sync="true"
              :labels="{ checked: 'Sending', unchecked: 'Not sending' }"
              color="#61AE24"
              @change="changeNotifChitchat"
            />
            <hr />
            <p>
              We can email you about specific OFFERs/WANTEDs we think you might
              be interested in, or to remind you that we would love you to
              freegle again.
            </p>
            <OurToggle
              v-model="relevantallowedLocal"
              :width="150"
              :sync="true"
              :labels="{ checked: 'Sending', unchecked: 'Not sending' }"
              color="#61AE24"
              @change="changeRelevant"
            />
            <hr />
            <p>
              We send occasional newsletters or collections of nice stories from
              other freeglers.
            </p>
            <OurToggle
              v-model="newslettersallowedLocal"
              :width="150"
              :sync="true"
              :labels="{ checked: 'Sending', unchecked: 'Not sending' }"
              color="#61AE24"
              @change="changeNewsletter"
            />
            <hr />
            <p>We send occasional mails to encourage you to freegle.</p>
            <OurToggle
              v-model="engagementSettings"
              :width="150"
              :sync="true"
              :labels="{ checked: 'Sending', unchecked: 'Not sending' }"
              color="#61AE24"
              @change="changeEngagement"
            />
            <hr />
            <p class="mt-2">
              Occasionally we may also send ADMIN mails about the running of
              Freegle.
            </p>
          </div>
        </div>
      </b-card-body>
    </div>
    <div v-else>You're not a member of any communities yet.</div>
  </b-card>
</template>
<script setup>
import { ref, computed, defineEmits, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import SettingsGroup from '~/components/SettingsGroup'
import SettingsEmailInfo from '~/components/SettingsEmailInfo'
import NoticeMessage from '~/components/NoticeMessage'
import OurToggle from '~/components/OurToggle'
import { useMe } from '~/composables/useMe'

const { me, myGroups } = useMe()

const emit = defineEmits(['update'])

const authStore = useAuthStore()

// State
const showAdvanced = ref(false)
const simpleEmailSettingLocal = ref('Full')
const notificationSettingsLocal = ref({
  email: true,
  emailmine: false,
  push: true,
  facebook: true,
  app: true,
})
const notificationmailsLocal = ref(true)
const relevantallowedLocal = ref(true)
const newslettersallowedLocal = ref(true)
const engagementSettings = ref(true)

// Computed properties

const simpleEmailSetting = computed(() => {
  return me.value?.settings?.simplemail ? me.value.settings.simplemail : 'Full'
})

watch(
  simpleEmailSettingLocal,
  async (newValue) => {
    simpleEmailSettingLocal.value = newValue
    const settings = me.value.settings
    settings.simplemail = newValue
    await authStore.saveAndGet({
      settings,
    })
  },
  { immediate: true }
)

const checkSimplicity = computed(() => {
  let ret = true
  let first = true
  let emailFrequency = 24
  let communityEvents = null
  let volunteering = null

  // If we have the same settings on all groups, then we can show a simplified view.
  if (myGroups.value) {
    for (const group of myGroups.value) {
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
  if (me.value?.settings?.simplemail) {
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

const notificationSettings = computed(() => {
  const ret = {
    email: true,
    emailmine: false,
    push: true,
    facebook: true,
    app: true,
  }

  const settings = me.value?.settings?.notifications

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

const notificationmails = computed(() => {
  return Boolean(me.value?.settings?.notificationmails)
})

const relevantallowed = computed(() => {
  return Boolean(me.value?.relevantallowed)
})

const newslettersallowed = computed(() => {
  return Boolean(me.value?.newslettersallowed)
})

// Methods
const toggleAdvanced = (e) => {
  e.preventDefault()
  showAdvanced.value = !showAdvanced.value
}

const changeAllGroups = async (param, value) => {
  for (const group of myGroups.value) {
    const params = {
      userid: me.value.id,
      groupid: group.id,
    }
    params[param] = value

    // Don't fetch for each group.
    await authStore.setGroup(params, true)
  }

  emit('update')
}

const changeNotification = async (e, type) => {
  const settings = me.value.settings
  settings.notifications[type] = e
  await authStore.saveAndGet({
    settings,
  })

  emit('update')
}

const changeRelevant = async (e) => {
  await authStore.saveAndGet({
    relevantallowed: e,
  })

  emit('update')
}

const changeNotifChitchat = async (e) => {
  const settings = me.value.settings
  settings.notificationmails = e
  await authStore.saveAndGet({
    settings,
  })

  emit('update')
}

const changeNewsletter = async (e) => {
  await authStore.saveAndGet({
    newslettersallowed: e,
  })

  emit('update')
}

const changeEngagement = async (e) => {
  const settings = me.value.settings
  settings.engagement = e
  await authStore.saveAndGet({
    settings,
  })

  emit('update')
}

const leaveGroup = async (id) => {
  await authStore.leaveGroup(me.value.id, id)
  emit('update')
}

// Update local refs when props change
watch(
  () => me.value,
  (newVal) => {
    if (newVal) {
      simpleEmailSettingLocal.value = simpleEmailSetting.value
      notificationSettingsLocal.value = { ...notificationSettings.value }
      notificationmailsLocal.value = notificationmails.value
      relevantallowedLocal.value = relevantallowed.value
      newslettersallowedLocal.value = newslettersallowed.value
      engagementSettings.value = newVal.settings?.engagement || false
    }
  },
  { immediate: true }
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
</style>
