<template>
  <b-modal ref="modal" scrollable title="Too Soon to Nudge" no-stacking>
    <template #default>
      <div class="nudge-content">
        <div class="nudge-icon-wrapper warning">
          <v-icon icon="clock" class="nudge-icon" />
        </div>
        <div class="nudge-text">
          <p class="nudge-intro">
            It's too soon to nudge - you need to wait 24 hours after the last
            message.
          </p>
          <p class="nudge-reminder">
            Please remember that not everyone is online all the time. Some
            people are only able to check their messages every day or two.
          </p>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="modal-actions">
        <b-button variant="primary" size="sm" @click="hide"> Got it </b-button>
      </div>
    </template>
  </b-modal>
</template>

<script setup>
import { useOurModal } from '~/composables/useOurModal'

const { modal, hide } = useOurModal()
</script>
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.nudge-content {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.nudge-icon-wrapper {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;

  &.warning {
    background: rgba($color-orange--dark, 0.1);

    .nudge-icon {
      color: $color-orange--dark;
    }
  }
}

.nudge-icon {
  font-size: 1.5rem;
}

.nudge-text {
  flex: 1;
}

.nudge-intro {
  font-size: 0.95rem;
  font-weight: 600;
  color: $color-gray--darker;
  margin-bottom: 0.75rem;
}

.nudge-reminder {
  font-size: 0.85rem;
  color: $color-gray--dark;
  margin: 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
</style>
