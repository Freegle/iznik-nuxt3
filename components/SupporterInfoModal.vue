<template>
  <b-modal ref="modal" scrollable hide-header content-class="supporter-modal">
    <template #default>
      <div class="supporter-content">
        <div class="supporter-header">
          <v-icon icon="trophy" class="header-icon" />
          <h5 class="header-title">Freegle Supporters</h5>
          <p class="header-subtitle">
            Help keep Freegle running - with money or time.
          </p>
        </div>

        <div class="supporter-body">
          <p class="intro-text">
            We're free to use, but not free to run. We need volunteer time and
            charity funds to keep going.
          </p>

          <div class="options-grid">
            <div class="option-card">
              <v-icon icon="hand-holding-heart" class="option-icon" />
              <h6 class="option-title">Donate money</h6>
              <p class="option-desc">
                Your donation helps cover server costs and keeps Freegle free
                for everyone.
              </p>
              <DonationButton class="option-btn" />
            </div>

            <div class="option-card">
              <v-icon icon="clock" class="option-icon" />
              <h6 class="option-title">Donate time</h6>
              <p class="option-desc">
                Help moderate posts and keep your community running smoothly.
              </p>
              <b-button
                variant="secondary"
                class="option-btn"
                :disabled="amMicroVolunteering"
                @click="donateTime"
              >
                {{ amMicroVolunteering ? 'Thanks for helping!' : 'Volunteer' }}
              </b-button>
            </div>
          </div>

          <div class="badge-info">
            <v-icon icon="award" class="badge-icon" />
            <span
              >Supporters get a badge that shows you're a committed
              freegler.</span
            >
          </div>
        </div>

        <div class="supporter-footer">
          <b-button variant="link" class="close-btn" @click="hide">
            Close
          </b-button>
        </div>
      </div>
    </template>
    <template #footer><span /></template>
  </b-modal>
</template>

<script setup>
import { useMiscStore } from '~/stores/misc'
import { useAuthStore } from '~/stores/auth'
import { computed } from '#imports'
import { useOurModal } from '~/composables/useOurModal'
import DonationButton from '~/components/DonationButton'

const { modal, hide } = useOurModal()
const miscStore = useMiscStore()
const authStore = useAuthStore()

const amMicroVolunteering = computed(() => {
  return !!miscStore.get('microvolunteeringinviteaccepted')
})

function donateTime() {
  miscStore.set({
    key: 'microvolunteeringinviteaccepted',
    value: Date.now(),
  })

  authStore.saveMicrovolunteering('Basic')
}
</script>

<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.supporter-content {
  padding: 0;
}

.supporter-header {
  text-align: center;
  padding: 1.5rem 1rem 1rem;
  border-bottom: 1px solid $color-gray--lighter;

  .header-icon {
    font-size: 2.5rem;
    color: #ffd700;
    margin-bottom: 0.75rem;
  }

  .header-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 0.25rem 0;
    color: $color-gray--darker;
  }

  .header-subtitle {
    font-size: 0.9rem;
    color: $color-gray--dark;
    margin: 0;
  }
}

.supporter-body {
  padding: 1.25rem;
}

.intro-text {
  text-align: center;
  color: $color-gray--dark;
  margin-bottom: 1.25rem;
  font-size: 0.9rem;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.option-card {
  padding: 1rem;
  background: $color-gray--lighter;
  text-align: center;

  .option-icon {
    font-size: 1.5rem;
    color: $colour-success;
    margin-bottom: 0.5rem;
  }

  .option-title {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: $color-gray--darker;
  }

  .option-desc {
    font-size: 0.8rem;
    color: $color-gray--dark;
    margin-bottom: 0.75rem;
    line-height: 1.3;
  }

  .option-btn {
    width: 100%;
  }
}

.badge-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fffbeb;
  font-size: 0.85rem;
  color: $color-gray--darker;

  .badge-icon {
    color: #ffd700;
    flex-shrink: 0;
  }
}

.supporter-footer {
  display: flex;
  justify-content: center;
  padding: 1rem;
  border-top: 1px solid $color-gray--lighter;

  .close-btn {
    color: $color-gray--dark;
  }
}
</style>
