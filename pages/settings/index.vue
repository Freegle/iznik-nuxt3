<template>
  <client-only v-if="me">
    <div>
      <h1 class="visually-hidden">Settings</h1>
      <b-row class="m-0">
        <b-col cols="0" xl="3" />
        <b-col cols="12" xl="6" class="p-0">
          <ProfileSection
            @update="updateMe"
            @show-about-me-modal="showAboutMeModal = true"
            @show-profile-modal="showProfileModal = true"
          />
          <AccountSection
            @update="updateMe"
            @show-email-confirm-modal="showEmailConfirmModal = true"
          />
          <AddressBookSection @show-address-modal="showAddressModal = true" />
          <EmailSettingsSection @update="updateMe" />
          <OtherSettingsSection @update="updateMe" />
        </b-col>
        <b-col cols="0" xl="3" />
      </b-row>

      <!-- Modals -->
      <AboutMeModal
        v-if="showAboutMeModal"
        @hidden="showAboutMeModal = false"
        @data-change="updateMe"
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
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { useMe, fetchMe } from '../../composables/useMe'
import { buildHead } from '../../composables/useBuildHead'

// Import the main components
import ProfileSection from '~/components/settings/ProfileSection.vue'
import AccountSection from '~/components/settings/AccountSection.vue'
import AddressBookSection from '~/components/settings/AddressBookSection.vue'
import EmailSettingsSection from '~/components/settings/EmailSettingsSection.vue'
import OtherSettingsSection from '~/components/settings/OtherSettingsSection.vue'

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

// Use the composable to get me and related functions
const { me } = useMe()

// State for modals
const showAboutMeModal = ref(false)
const showProfileModal = ref(false)
const showEmailConfirmModal = ref(false)
const showAddressModal = ref(false)

// Methods
const updateMe = async () => {
  try {
    await fetchMe(true)
  } catch (e) {
    console.error('Failed to fetch user', e)
  }
}

// Check if we need to update the user data
const checkUser = () => {
  // This is a hack. In the lost password case, we've seen that the login which is driven via the default
  // layout completes after we have retrieved our user. The result is that we don't have the right info in "me".
  if (!me.value || !me.value.settings) {
    updateMe()
  } else {
    setTimeout(checkUser, 200)
  }
}

// Lifecycle hooks
onMounted(async () => {
  await updateMe()
  setTimeout(checkUser, 200)
})

// Define async components for modals to improve performance
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
