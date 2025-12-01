<template>
  <div class="settings-section">
    <div class="section-header">
      <v-icon icon="envelope" class="section-icon" />
      <h2>Email Settings</h2>
    </div>

    <div v-if="myGroups" class="section-content">
      <NoticeMessage
        v-if="simpleEmailSetting === 'None' || !notificationSettings.email"
        variant="danger"
        class="mb-3"
      >
        You won't get email notifications. Check
        <nuxt-link no-prefetch to="/chats">Chats</nuxt-link> regularly.
      </NoticeMessage>

      <div v-if="simpleSettings && !showAdvanced">
        <!-- Simple settings -->
        <div class="setting-row">
          <label>Email level:</label>
          <b-form-select v-model="simpleEmailSettingLocal" class="email-select">
            <b-form-select-option value="None">Off</b-form-select-option>
            <b-form-select-option value="Basic">Basic</b-form-select-option>
            <b-form-select-option value="Full">Standard</b-form-select-option>
          </b-form-select>
        </div>

        <div v-if="myGroups?.length === 0" class="text-muted">
          Join a community to set email preferences.
        </div>
        <div v-else-if="simpleEmailSettingLocal !== 'None'">
          <SettingsGroup
            v-model:emailfrequency="emailSimple"
            eventshide
            volunteerhide
            label="OFFER/WANTED frequency:"
            class="mt-2 mb-2"
          />
          <SettingsEmailInfo
            v-model:simple-email-setting="simpleEmailSettingLocal"
          />
        </div>

        <button class="link-btn mt-2" @click="toggleAdvanced">
          Show advanced settings
        </button>
      </div>

      <div v-else>
        <!-- Advanced settings - per group -->
        <div
          v-for="group in myGroups"
          :key="'settingsgroup-' + group.id"
          class="group-settings"
        >
          <div class="group-header">
            <nuxt-link :to="'/explore/' + group.nameshort" class="group-link">
              <b-img
                v-if="group.profile"
                lazy
                rounded
                thumbnail
                :src="group.profile"
                class="group-img"
              />
              {{ group.namedisplay }}
            </nuxt-link>
            <v-icon
              v-if="group.role === 'Moderator' || group.role === 'Owner'"
              icon="crown"
              class="mod-icon"
            />
          </div>
          <SettingsGroup
            :groupid="group.id"
            :leave="group.role === 'Member'"
            @leave="leaveGroup(group.id)"
          />
        </div>

        <div class="advanced-options">
          <div class="option-row">
            <span>Email me replies to my posts</span>
            <OurToggle
              v-model="notificationSettingsLocal.email"
              :width="120"
              :sync="true"
              :labels="{ checked: 'On', unchecked: 'Off' }"
              color="#61AE24"
              @change="changeNotification($event, 'email')"
            />
          </div>

          <div class="option-row">
            <span>Copy of my sent messages</span>
            <OurToggle
              v-model="notificationSettingsLocal.emailmine"
              :width="120"
              :sync="true"
              :labels="{ checked: 'On', unchecked: 'Off' }"
              color="#61AE24"
              @change="changeNotification($event, 'emailmine')"
            />
          </div>

          <div class="option-row">
            <span>ChitChat &amp; notifications</span>
            <OurToggle
              v-model="notificationmailsLocal"
              :width="120"
              :sync="true"
              :labels="{ checked: 'On', unchecked: 'Off' }"
              color="#61AE24"
              @change="changeNotifChitchat"
            />
          </div>

          <div class="option-row">
            <span>Suggested posts for you</span>
            <OurToggle
              v-model="relevantallowedLocal"
              :width="120"
              :sync="true"
              :labels="{ checked: 'On', unchecked: 'Off' }"
              color="#61AE24"
              @change="changeRelevant"
            />
          </div>

          <div class="option-row">
            <span>Newsletters &amp; stories</span>
            <OurToggle
              v-model="newslettersallowedLocal"
              :width="120"
              :sync="true"
              :labels="{ checked: 'On', unchecked: 'Off' }"
              color="#61AE24"
              @change="changeNewsletter"
            />
          </div>

          <div class="option-row">
            <span>Encouragement emails</span>
            <OurToggle
              v-model="engagementSettings"
              :width="120"
              :sync="true"
              :labels="{ checked: 'On', unchecked: 'Off' }"
              color="#61AE24"
              @change="changeEngagement"
            />
          </div>
        </div>

        <p class="admin-note">
          We may occasionally send important admin emails.
        </p>
      </div>
    </div>
    <div v-else class="section-content text-muted">
      You're not a member of any communities yet.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineEmits, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
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
    await authStore.saveAndGet({ settings })
  },
  { immediate: true }
)

const checkSimplicity = computed(() => {
  let ret = true
  let first = true
  let emailFrequency = 24
  let communityEvents = null
  let volunteering = null

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

  return { ret, emailFrequency, communityEvents, volunteering }
})

const simpleSettings = computed(() => {
  if (me.value?.settings?.simplemail) {
    return true
  }
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
    if ('email' in settings) ret.email = settings.email
    if ('emailmine' in settings) ret.emailmine = settings.emailmine
    if ('push' in settings) ret.push = settings.push
    if ('facebook' in settings) ret.facebook = settings.facebook
    if ('app' in settings) ret.app = settings.app
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
    await authStore.setGroup(params, true)
  }
  emit('update')
}

const changeNotification = async (e, type) => {
  const settings = me.value.settings
  settings.notifications[type] = e
  await authStore.saveAndGet({ settings })
  emit('update')
}

const changeRelevant = async (e) => {
  await authStore.saveAndGet({ relevantallowed: e })
  emit('update')
}

const changeNotifChitchat = async (e) => {
  const settings = me.value.settings
  settings.notificationmails = e
  await authStore.saveAndGet({ settings })
  emit('update')
}

const changeNewsletter = async (e) => {
  await authStore.saveAndGet({ newslettersallowed: e })
  emit('update')
}

const changeEngagement = async (e) => {
  const settings = me.value.settings
  settings.engagement = e
  await authStore.saveAndGet({ settings })
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
@import 'assets/css/_color-vars.scss';

.settings-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 1rem;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: $color-green-background;
  }

  .section-icon {
    color: $color-green-background;
  }
}

.section-content {
  padding: 1rem 1.25rem;
}

.setting-row {
  margin-bottom: 0.75rem;

  label {
    display: block;
    font-weight: 500;
    margin-bottom: 0.25rem;
    font-size: 0.9rem;
  }
}

.email-select {
  max-width: 200px;
}

.link-btn {
  background: none;
  border: none;
  color: $color-blue--bright;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
}

.group-settings {
  padding: 1rem;
  margin-bottom: 0.75rem;
  background: $color-gray--lighter;
  border-radius: 8px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.group-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: $color-green-background;
  font-weight: 500;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.group-img {
  height: 40px !important;
  width: 40px !important;
  object-fit: cover;
}

.mod-icon {
  color: $color-green-background;
}

.advanced-options {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.option-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);

  span {
    font-size: 0.9rem;
  }

  &:last-child {
    border-bottom: none;
  }
}

.admin-note {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: $color-gray--dark;
}
</style>
