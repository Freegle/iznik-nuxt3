<template>
  <div class="settings-section">
    <div class="section-header">
      <v-icon icon="cog" class="section-icon" />
      <h2>Other Settings</h2>
    </div>

    <div class="section-content">
      <div class="option-row">
        <div class="option-info">
          <span class="option-label">Enter key in chat</span>
          <span class="option-desc">Send message or add new line</span>
        </div>
        <OurToggle
          v-model="enterNewLineLocal"
          :width="130"
          :sync="true"
          :labels="{ checked: 'New line', unchecked: 'Send' }"
          color="#61AE24"
          @change="changeNewLine"
        />
      </div>

      <div class="option-row">
        <div class="option-info">
          <span class="option-label">Auto-repost</span>
          <span class="option-desc">
            Bump posts until marked as done in
            <nuxt-link no-prefetch to="/myposts">My Posts</nuxt-link>
          </span>
        </div>
        <OurToggle
          v-model="autorepostsLocal"
          :width="100"
          :sync="true"
          :labels="{ checked: 'On', unchecked: 'Off' }"
          color="#61AE24"
          @change="changeAutorepost"
        />
      </div>

      <div class="option-row">
        <div class="option-info">
          <span class="option-label">Freegle updates</span>
          <span class="option-desc">News and ways to support Freegle</span>
        </div>
        <OurToggle
          v-model="marketingConsentLocal"
          :width="100"
          :sync="true"
          :labels="{ checked: 'On', unchecked: 'Off' }"
          color="#61AE24"
          @change="changeMarketingConsent"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import OurToggle from '~/components/OurToggle'
import { useMe } from '~/composables/useMe'

const emit = defineEmits(['update'])

const authStore = useAuthStore()
const miscStore = useMiscStore()

const { me } = useMe()

// State
const autorepostsLocal = ref(true)
const enterNewLineLocal = ref(false)
const marketingConsentLocal = ref(true)

// Methods
const changeNewLine = async (e) => {
  const settings = me.value.settings
  settings.enterNewLine = e
  await authStore.saveAndGet({ settings })
  enterNewLineLocal.value = e
  emit('update')
}

const changeAutorepost = async (e) => {
  const settings = me.value.settings
  settings.autorepostsdisable = !e
  await authStore.saveAndGet({ settings })
  emit('update')
}

const changeMarketingConsent = (e) => {
  miscStore.setMarketingConsent(e)
}

// Update local refs when props change
watch(
  () => me.value,
  (newVal) => {
    if (newVal) {
      autorepostsLocal.value = !newVal.settings?.autorepostsdisable
      enterNewLineLocal.value = newVal.settings?.enterNewLine || false
      marketingConsentLocal.value = miscStore.marketingConsent
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

.option-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
  }
}

.option-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.option-label {
  font-weight: 500;
  font-size: 0.95rem;
}

.option-desc {
  font-size: 0.8rem;
  color: $color-gray--dark;

  a {
    color: $color-blue--bright;
  }
}
</style>
